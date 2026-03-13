import { getAllStations, getStates, getOperators } from "@/lib/data";
import JsonLd from "@/components/JsonLd";
import Link from "next/link";
import MapExplorerWrapper from "@/components/MapExplorerWrapper";

export default function Home() {
  const stations = getAllStations();
  const states = getStates();
  const operators = getOperators();
  const totalPlugs = stations.reduce((sum, s) => sum + s.numPlugs, 0);

  const operatorNames = operators.map((op) => op.name).filter(Boolean);
  const stateNames = states.map((s) => s.code);

  const stationData = stations.map((s) => ({
    id: s.id,
    name: s.name,
    address: s.address,
    operator: s.operator,
    chargerType: s.chargerType,
    chargerRatingKW: s.chargerRatingKW,
    numPlugs: s.numPlugs,
    lat: s.lat,
    lng: s.lng,
    state: s.state,
    connectors: s.connectors,
  }));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "AU EV Charging Finder",
          url: "https://ev-charging.rollersoft.com.au",
          description: `Find ${stations.length.toLocaleString()} electric vehicle charging stations across Australia`,
        }}
      />

      {/* Map-first hero — full viewport */}
      <MapExplorerWrapper stations={stationData} operators={operatorNames} states={stateNames} />

      {/* Below the fold: browse content for SEO */}
      <div className="container mx-auto px-4 py-12">
        {/* Quick stats */}
        <section className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">⚡ AU EV Charging Finder</h1>
          <p className="text-lg opacity-70 mb-6">
            Find {stations.length.toLocaleString()} electric vehicle charging stations with{" "}
            {totalPlugs.toLocaleString()} plugs across Australia
          </p>
          <div className="stats stats-vertical md:stats-horizontal shadow">
            <div className="stat">
              <div className="stat-title">Stations</div>
              <div className="stat-value text-primary">{stations.length.toLocaleString()}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Plugs</div>
              <div className="stat-value">{totalPlugs.toLocaleString()}</div>
            </div>
            <div className="stat">
              <div className="stat-title">DC Fast</div>
              <div className="stat-value text-warning">{stations.filter((s) => s.chargerType === "DC").length}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Networks</div>
              <div className="stat-value">{operatorNames.length}</div>
            </div>
          </div>
        </section>

        {/* Browse by State */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Browse by State</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {states.map((state) => (
              <Link
                key={state.code}
                href={`/state/${state.code.toLowerCase()}`}
                className="card bg-base-200 hover:bg-base-300 transition-colors"
              >
                <div className="card-body p-4">
                  <h3 className="card-title text-base">{state.name}</h3>
                  <p className="text-2xl font-bold text-primary">{state.count}</p>
                  <p className="text-xs opacity-70">charging stations</p>
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
                  <th>Network</th>
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
                <div className="card-body p-4">
                  <h3 className="card-title text-sm">{station.name}</h3>
                  <p className="text-xs opacity-70">{station.address}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className={`badge badge-sm ${station.chargerType === "DC" ? "badge-primary" : "badge-secondary"}`}>
                      {station.chargerType} {station.chargerRatingKW}kW
                    </span>
                    <span className="badge badge-outline badge-sm">{station.numPlugs} plugs</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
