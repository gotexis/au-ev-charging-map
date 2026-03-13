"use client";

import dynamic from "next/dynamic";

const MapExplorer = dynamic(() => import("./MapExplorer"), { ssr: false });

interface Station {
  id: number;
  name: string;
  address: string;
  operator: string;
  chargerType: string;
  chargerRatingKW: string;
  numPlugs: number;
  lat: number;
  lng: number;
  state: string;
  connectors: { type: string; count: number }[];
}

interface Props {
  stations: Station[];
  operators: string[];
  states: string[];
}

export default function MapExplorerWrapper(props: Props) {
  return <MapExplorer {...props} />;
}
