// src/lib/routeStops.ts

let routeStopCache: Record<string, { stop_id: string; stop_name: string }[]> = {};

export async function loadRouteStops(): Promise<
  Record<string, { stop_id: string; stop_name: string }[]>
> {
  if (Object.keys(routeStopCache).length === 0) {
    const res = await fetch("/all_stops.json");
    if (!res.ok) throw new Error("Failed to load route stops");
    routeStopCache = await res.json();
  }

  return routeStopCache;
}
