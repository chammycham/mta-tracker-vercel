//src/lib/feedMap.ts
const API_KEY = process.env.NEXT_PUBLIC_MTA_BUS_KEY;

//getting the feed URL based on the route
export function getFeedUrl(route: string): string {
  const routeUpper = route.toUpperCase();

  if (["1", "2", "3", "4", "5", "6", "6X", "7", "7X", "S"].includes(routeUpper)) {
    return "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs";
  } else if (["A", "C", "E"].includes(routeUpper)) {
    return "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace";
  } else if (["B", "D", "F", "M"].includes(routeUpper)) {
    return "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm";
  } else if (["G"].includes(routeUpper)) {
    return "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g";
  } else if (["J", "Z"].includes(routeUpper)) {
    return "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz";
  } else if (["L"].includes(routeUpper)) {
    return "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l";
  } else if (["N", "Q", "R", "w"].includes(routeUpper)) {
    return "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw";
  } else if (/^M\d/.test(routeUpper)) {
    return `https://gtfsrt.prod.obanyc.com/tripUpdates?key=${API_KEY}`;
  }

  console.warn(`Unknown route: ${routeUpper}, using fallback GTFS feed`);
  return "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs";
}
