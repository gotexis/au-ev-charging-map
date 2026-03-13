"use client";

import { useState, useMemo } from "react";
import MapView from "./MapView";
import type { MapMarker } from "./MapView";

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

export default function MapExplorer({ stations, operators, states }: Props) {
  const [chargerFilter, setChargerFilter] = useState<string>("all");
  const [operatorFilter, setOperatorFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return stations.filter((s) => {
      if (chargerFilter !== "all" && s.chargerType !== chargerFilter) return false;
      if (operatorFilter !== "all" && s.operator !== operatorFilter) return false;
      if (stateFilter !== "all" && s.state !== stateFilter) return false;
      return true;
    });
  }, [stations, chargerFilter, operatorFilter, stateFilter]);

  const markers: MapMarker[] = filtered.map((s) => ({
    lat: s.lat,
    lng: s.lng,
    label: s.name || "EV Charger",
    operator: s.operator,
    chargerType: `${s.chargerType} ${s.chargerRatingKW}kW`,
    popup: `${s.numPlugs} plugs • ${s.address}`,
    href: `/station/${s.id}`,
  }));

  const center: [number, number] = stateFilter !== "all"
    ? getStateCenter(stateFilter)
    : [-28.0, 134.0];
  const zoom = stateFilter !== "all" ? 7 : 5;

  return (
    <div className="relative w-full" style={{ height: "calc(100vh - 64px)" }}>
      {/* Filter bar overlay */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <button
          className="btn btn-sm btn-primary shadow-lg"
          onClick={() => setShowFilters(!showFilters)}
        >
          🔍 Filters ({filtered.length.toLocaleString()} stations)
        </button>
        {showFilters && (
          <div className="bg-base-100 rounded-xl shadow-2xl p-4 w-72 max-h-[70vh] overflow-y-auto">
            <div className="form-control mb-3">
              <label className="label label-text text-xs font-bold">Charger Type</label>
              <select
                className="select select-bordered select-sm"
                value={chargerFilter}
                onChange={(e) => setChargerFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="DC">⚡ DC Fast</option>
                <option value="AC">🔌 AC</option>
              </select>
            </div>
            <div className="form-control mb-3">
              <label className="label label-text text-xs font-bold">State</label>
              <select
                className="select select-bordered select-sm"
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
              >
                <option value="all">All States</option>
                {states.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-control mb-3">
              <label className="label label-text text-xs font-bold">Network</label>
              <select
                className="select select-bordered select-sm"
                value={operatorFilter}
                onChange={(e) => setOperatorFilter(e.target.value)}
              >
                <option value="all">All Networks</option>
                {operators.map((op) => (
                  <option key={op} value={op}>{op || "Independent"}</option>
                ))}
              </select>
            </div>
            <button
              className="btn btn-ghost btn-xs w-full"
              onClick={() => {
                setChargerFilter("all");
                setOperatorFilter("all");
                setStateFilter("all");
              }}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Stats badge */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-base-100/90 backdrop-blur rounded-lg shadow-lg px-3 py-2 text-xs flex gap-3">
          <span className="font-bold">{filtered.length.toLocaleString()} stations</span>
          <span className="text-primary">⚡ {filtered.filter(s => s.chargerType === "DC").length} DC</span>
          <span className="text-secondary">🔌 {filtered.filter(s => s.chargerType === "AC").length} AC</span>
        </div>
      </div>

      <MapView markers={markers} center={center} zoom={zoom} height="100%" />
    </div>
  );
}

function getStateCenter(state: string): [number, number] {
  const centers: Record<string, [number, number]> = {
    NSW: [-32.0, 147.0],
    VIC: [-37.0, 145.0],
    QLD: [-22.0, 150.0],
    SA: [-30.0, 136.0],
    WA: [-25.0, 122.0],
    TAS: [-42.0, 146.5],
    NT: [-19.5, 134.0],
    ACT: [-35.3, 149.1],
  };
  return centers[state] || [-28.0, 134.0];
}
