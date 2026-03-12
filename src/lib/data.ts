import stationsData from "../../data/stations.json";

export interface Station {
  id: number;
  name: string;
  address: string;
  hours: string;
  operator: string;
  numStations: number;
  numPlugs: number;
  chargerType: string;
  chargerRatingKW: string;
  lat: number;
  lng: number;
  lga: string;
  postcode: string;
  state: string;
  slug: string;
  connectors: { type: string; count: number }[];
}

const stations: Station[] = stationsData as Station[];

export function getAllStations(): Station[] {
  return stations;
}

export function getStationsByState(state: string): Station[] {
  return stations.filter((s) => s.state.toLowerCase() === state.toLowerCase());
}

export function getStationBySlug(slug: string): Station | undefined {
  return stations.find((s) => s.slug === slug);
}

export function getStationById(id: number): Station | undefined {
  return stations.find((s) => s.id === id);
}

export function getStates(): { name: string; code: string; count: number }[] {
  const map: Record<string, number> = {};
  stations.forEach((s) => {
    map[s.state] = (map[s.state] || 0) + 1;
  });
  return Object.entries(map)
    .map(([code, count]) => ({
      name: STATE_NAMES[code] || code,
      code,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

export function getOperators(): { name: string; count: number }[] {
  const map: Record<string, number> = {};
  stations.forEach((s) => {
    const op = s.operator || "Unknown";
    map[op] = (map[op] || 0) + 1;
  });
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

const STATE_NAMES: Record<string, string> = {
  NSW: "New South Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  SA: "South Australia",
  WA: "Western Australia",
  TAS: "Tasmania",
  NT: "Northern Territory",
  ACT: "Australian Capital Territory",
};
