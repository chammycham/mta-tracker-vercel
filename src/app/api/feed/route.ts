//src/app/api/feed/route.ts
import { NextRequest, NextResponse } from "next/server";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import fetch from "node-fetch";
import { getFeedUrl } from "@/lib/feedMap";

const API_KEY = process.env.NEXT_PUBLIC_MTA_BUS_KEY;
const SERVICE_FEED_URL = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fall-alerts";

//Checking if alerts are active based on its time
function isAlertActive(activePeriods: any[]): boolean {
  const now = Date.now() / 1000;
  for (const period of activePeriods) {
    const start = typeof period.start === "object" ? period.start.toNumber?.() : period.start ?? 0; //if no start, set start to 0
    const end = typeof period.end === "object" ? period.end.toNumber?.() : period.end ?? Infinity; //if no end, set to infinity
    if (now >= start && now <= end) return true;
  }
  return false;
}

//Extracting any service alerts
function extractAlertText(alert: any): string {
  //only using ones in English (as opposed to HTML)
  const header = alert.headerText?.translation?.find((t: any) => t.language === "en")?.text;
  const description = alert.descriptionText?.translation?.find((t: any) => t.language === "en")?.text;

  const parts = [header, description].filter(Boolean); //combine header and description
  return parts.join(": ");
}

//Extracting vehicle data
export async function GET(req: NextRequest) {
  const stop = req.nextUrl.searchParams.get("stop");
  const route = req.nextUrl.searchParams.get("route");
  const type = req.nextUrl.searchParams.get("type");

  if (!stop || !route || !type) {
    return NextResponse.json(
      { error: "Missing ?stop=STOP_ID&route=ROUTE_ID&type=TYPE" },
      { status: 400 }
    );
  }

  const normalizeStopId = (id: string): string => id?.replace(/[NSWE]$/, ""); //removes direciton 
  const normalizeRouteId = (id: string): string => id?.replace(/^0+/, "");

  const FEED_URL =
  type === "bus"
    ? `https://gtfsrt.prod.obanyc.com/tripUpdates?key=${API_KEY}`
    : getFeedUrl(route);
  const arrivals: number[] = [];
  const seenAlerts = new Set<string>();
  const matchedAlerts: string[] = [];

  try {
    //extracting the information from the feed
    const res = await fetch(FEED_URL);
    if (!res.ok) throw new Error("Failed to fetch feed");

    const buffer = await res.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(buffer)
    );

    feed.entity.forEach((entity) => {
      const trip = entity.tripUpdate?.trip;
      const updates = entity.tripUpdate?.stopTimeUpdate;

      if (trip && trip.routeId === route && updates) {
        updates.forEach((stu) => {
          if (stu.stopId === stop && stu.arrival?.time != null) {
            const timeVal = typeof stu.arrival.time === "object"
              ? stu.arrival.time.toNumber()
              : stu.arrival.time;

            const eta = Math.round((timeVal * 1000 - Date.now()) / 60000);
            if (eta > 0) {
              arrivals.push(eta);
            }
          }
        });
      }
    });

    //getting service alerts
    const alertRes = await fetch(SERVICE_FEED_URL);
    if (!alertRes.ok) throw new Error("Failed to fetch service alerts");

    const alertBuffer = await alertRes.arrayBuffer();
    const alertFeed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(alertBuffer)
    );

    alertFeed.entity.forEach((entity) => {
      const alert = entity.alert;
      if (!alert) return;
      //using alerts within the active period only
      const activePeriods = Array.isArray(alert.activePeriod) ? alert.activePeriod : [];
      if (!isAlertActive(activePeriods)) return;

      const informedEntities = Array.isArray(alert.informedEntity) ? alert.informedEntity : [];

      let alertMatches = false;

      for (const informed of informedEntities ?? []) {
        const agencyOk = ["MTA NYCT", "MTASBWY"].includes(informed.agencyId ?? ""); //only using service alerts from specific agencies
        const stopOk = normalizeStopId(informed.stopId ?? "") === normalizeStopId(stop);
        const routeOk = normalizeRouteId(informed.routeId ?? "") === normalizeRouteId(route);

        if (agencyOk && (stopOk || routeOk)) {
          alertMatches = true;
          break;
        }
      }

      if (alertMatches) {
        const text = extractAlertText(alert);
        if (text && !seenAlerts.has(text)) {
          seenAlerts.add(text);
          matchedAlerts.push(text);
        }
      }
    });

    arrivals.sort((a, b) => a - b);

    return NextResponse.json({
      route,
      stop,
      arrivals: arrivals.slice(0, 3),
      alerts: matchedAlerts,
    });
  } catch (err) {
    console.error("Subway API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

