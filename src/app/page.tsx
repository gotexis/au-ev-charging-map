import { getAllStations, getStates, getOperators } from "@/lib/data";
import JsonLd from "@/components/JsonLd";
import Link from "next/link";
import MapView from "@/components/MapView";

export default function Home() {
  const stations = getAllStations();
  const states = getStates();
  const operators = getOperators();
  const totalPlugs = stations.reduce((sum, s) => sum + s.numPlugs, 0);

  const dcCount = stations.filter((s) => s.chargerType === "DC").length;
  const acCount = stations.filter((s) => s.chargerType === "AC").length;

  const mapMarkers = stations.map((s) => ({
    lat: s.lat,
    lng: s.lng,
    label: s.name || "EV Charger",
    operator: s.operator,
    chargerType: `${s.chargerType} ${s.chargerRatingKW}kW`,
    popup: `${s.numPlugs} plugs • ${s.address}`,
    href: `/station/${s.id}`,
  }));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "AU EV Charging Finder",
          url: "https://ev-charging.rollersoft.com.au",
          description: "Find electric vehicle charging stations across Australia",
        }}
      />

      {/* Hero */}
      <section className="bg-primary text-primary-content py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">⚡ AU EV Charging Finder</h1>
          <p className="text-xl opacity-90 mb-8">
            Find {stations.length.toLocaleString()} electric vehicle charging stations across Australia
          </p>
          <div className="stats stats-vertical md:stats-horizontal shadow bg-primary-content text-primary">
            <div className="stat">
              <div className="stat-title text-primary/60">Stations</div>
              <div className="stat-value">{stations.length.toLocaleString()}</div>
            </div>
            <div className="stat">
              <div className="stat-title text-primary/60">Plugs</div>
              <div className="stat-value">{totalPlugs.toLocaleString()}</div>
            </div>
            <div className="stat">
              <div className="stat-title text-primary/60">DC Fast</div>
              <div className="stat-value">{dcCount}</div>
            </div>
            <div className="stat">
              <div className="stat-title text-primary/60">AC</div>
              <div className="stat-value">{acCount}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">🗺️ All Charging Stations</h2>
        <div className="rounded-xl overflow-hidden shadow-lg border border-base-300">
          <MapView markers={mapMarkers} height="600px" />
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Browse by State */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Browse by State</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {states.map((state) => (
              <Link
                key={state.code}
                href={`/state/${state.code.toLowerCase()}`}
                className="card bg-base-200 hover:bg-base-300 transition-colors"
              >
                <div className="card-body">
                  <h3 className="card-title">{state.name}</h3>
                  <p className="text-2xl font-bold text-primary">{state.count}</p>
                  <p className="text-sm opacity-70">charging stations</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Top Operators */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Top Charging Networks</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Network / Operator</th>
                  <th className="text-right">Stations</th>
                  <th className="text-right">Share</th>
                </tr>
              </thead>
              <tbody>
                {operators.slice(0, 15).map((op) => (
                  <tr key={op.name}>
                    <td>{op.name || "Independent / Unknown"}</td>
                    <td className="text-right font-mono">{op.count}</td>
                    <td className="text-right font-mono">
                      {((op.count / stations.length) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Featured Stations */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Featured Stations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stations.slice(0, 12).map((station) => (
              <Link
                key={station.id}
                href={`/station/${station.id}`}
                className="card bg-base-200 hover:shadow-lg transition-shadow"
              >
                <div className="card-body">
                  <h3 className="card-title text-base">{station.name}</h3>
                  <p className="text-sm opacity-70">{station.address}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`badge ${station.chargerType === "DC" ? "badge-primary" : "badge-secondary"}`}>
                      {station.chargerType} {station.chargerRatingKW}kW
                    </span>
                    <span className="badge badge-outline">{station.numPlugs} plugs</span>
                    {station.connectors.map((c) => (
                      <span key={c.type} className="badge badge-ghost badge-sm">{c.type}</span>
                    ))}
                  </div>
                  {station.operator && (
                    <p className="text-xs opacity-50 mt-1">{station.operator}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
