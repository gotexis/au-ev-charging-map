import { getStationsByState, getStates } from "@/lib/data";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const STATE_NAMES: Record<string, string> = {
  nsw: "New South Wales",
  vic: "Victoria",
  qld: "Queensland",
  sa: "South Australia",
  wa: "Western Australia",
  tas: "Tasmania",
  nt: "Northern Territory",
  act: "Australian Capital Territory",
};

type Params = { state: string };

export function generateStaticParams() {
  return getStates().map((s) => ({ state: s.code.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { state } = await params;
  const name = STATE_NAMES[state] || state.toUpperCase();
  return {
    title: `EV Charging Stations in ${name}`,
    description: `Find electric vehicle charging stations in ${name}, Australia.`,
  };
}

export default async function StatePage({ params }: { params: Promise<Params> }) {
  const { state } = await params;
  const stations = getStationsByState(state);
  const name = STATE_NAMES[state] || state.toUpperCase();

  if (stations.length === 0) return notFound();

  const dcCount = stations.filter((s) => s.chargerType === "DC").length;
  const acCount = stations.filter((s) => s.chargerType === "AC").length;

  // Group by LGA
  const byLga: Record<string, typeof stations> = {};
  stations.forEach((s) => {
    const lga = s.lga || "Other";
    if (!byLga[lga]) byLga[lga] = [];
    byLga[lga].push(s);
  });
  const lgas = Object.entries(byLga).sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="breadcrumbs text-sm mb-4">
        <ul>
          <li><Link href="/">Home</Link></li>
          <li>{name}</li>
        </ul>
      </div>

      <h1 className="text-3xl font-bold mb-2">EV Charging in {name}</h1>
      <p className="text-lg opacity-70 mb-6">
        {stations.length} charging stations • {dcCount} DC fast • {acCount} AC
      </p>

      {lgas.map(([lga, lgaStations]) => (
        <section key={lga} className="mb-8">
          <h2 className="text-xl font-semibold mb-3 border-b pb-2">
            {lga} <span className="text-sm font-normal opacity-60">({lgaStations.length} stations)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lgaStations.map((station) => (
              <Link
                key={station.id}
                href={`/station/${station.id}`}
                className="card bg-base-200 hover:shadow-md transition-shadow compact"
              >
                <div className="card-body">
                  <h3 className="card-title text-sm">{station.name}</h3>
                  <p className="text-xs opacity-70">{station.address}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className={`badge badge-xs ${station.chargerType === "DC" ? "badge-primary" : "badge-secondary"}`}>
                      {station.chargerType} {station.chargerRatingKW}kW
                    </span>
                    <span className="badge badge-xs badge-outline">{station.numPlugs} plugs</span>
                    {station.operator && (
                      <span className="badge badge-xs badge-ghost">{station.operator}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
