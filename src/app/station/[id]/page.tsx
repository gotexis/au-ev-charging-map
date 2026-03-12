import { getAllStations, getStationById } from "@/lib/data";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";

type Params = { id: string };

export function generateStaticParams() {
  return getAllStations().map((s) => ({ id: String(s.id) }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const station = getStationById(Number(id));
  if (!station) return { title: "Station Not Found" };
  return {
    title: `${station.name} — EV Charging`,
    description: `${station.chargerType} ${station.chargerRatingKW}kW EV charging at ${station.name}, ${station.address}. ${station.numPlugs} plugs. ${station.operator}.`,
  };
}

export default async function StationPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const station = getStationById(Number(id));
  if (!station) return notFound();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Place",
          name: station.name,
          address: station.address,
          geo: { "@type": "GeoCoordinates", latitude: station.lat, longitude: station.lng },
        }}
      />

      <div className="breadcrumbs text-sm mb-4">
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href={`/state/${station.state.toLowerCase()}`}>{station.state}</Link></li>
          <li>{station.name}</li>
        </ul>
      </div>

      <h1 className="text-3xl font-bold mb-2">{station.name}</h1>
      <p className="text-lg opacity-70 mb-6">{station.address}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Details Card */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title text-lg">Station Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="opacity-70">Charger Type</span>
                <span className={`badge ${station.chargerType === "DC" ? "badge-primary" : "badge-secondary"}`}>
                  {station.chargerType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Power Rating</span>
                <span className="font-semibold">{station.chargerRatingKW} kW</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Stations</span>
                <span className="font-semibold">{station.numStations}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Plugs</span>
                <span className="font-semibold">{station.numPlugs}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Hours</span>
                <span className="font-semibold text-sm">{station.hours || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connectors Card */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title text-lg">Connectors</h2>
            {station.connectors.length > 0 ? (
              <div className="space-y-3">
                {station.connectors.map((c) => (
                  <div key={c.type} className="flex justify-between items-center">
                    <span className="badge badge-lg badge-outline">{c.type}</span>
                    <span className="font-semibold">{c.count}×</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="opacity-60">Connector details not available</p>
            )}
          </div>
        </div>
      </div>

      {/* Operator & Location */}
      <div className="card bg-base-200 mb-8">
        <div className="card-body">
          <h2 className="card-title text-lg">Location & Operator</h2>
          <div className="space-y-2">
            {station.operator && (
              <div className="flex justify-between">
                <span className="opacity-70">Operator</span>
                <span className="font-semibold">{station.operator}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="opacity-70">LGA</span>
              <span>{station.lga}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">Postcode</span>
              <span>{station.postcode}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">Coordinates</span>
              <span className="font-mono text-sm">{station.lat.toFixed(4)}, {station.lng.toFixed(4)}</span>
            </div>
          </div>
          <div className="mt-4">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${station.lat},${station.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
            >
              📍 Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
