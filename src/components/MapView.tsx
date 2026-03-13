"use client";

import dynamic from "next/dynamic";

const MapInner = dynamic(() => import("./MapInner"), { ssr: false });

export interface MapMarker {
  lat: number;
  lng: number;
  label: string;
  popup?: string;
  href?: string;
  chargerType?: string;
  operator?: string;
}

interface MapViewProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export default function MapView({
  markers,
  center = [-25.2744, 133.7751],
  zoom = 4,
  height = "600px",
}: MapViewProps) {
  return (
    <div style={{ height, width: "100%" }}>
      <MapInner markers={markers} center={center} zoom={zoom} />
    </div>
  );
}
