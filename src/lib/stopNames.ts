// src/lib/stopNames.ts
let cache: Record<string, Record<string, string>> = {};

//loading stop names based on vehicle type
export async function loadStopNames(type: "train" | "bus"): Promise<Record<string, string>> {
  if (!cache[type]) {
    const path = type === "bus" ? "/bus_stops.json" : "/train_stops_bad.json";
    const res = await fetch(path);
    const stops = await res.json();

    const stopMap: Record<string, string> = {};
    stops.forEach((stop: { stop_id: string; stop_name: string }) => {
      stopMap[stop.stop_id] = stop.stop_name;
    });

    cache[type] = stopMap;
  }

  return cache[type];
}
