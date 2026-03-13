import type { Metadata } from "next";
import "./globals.css";

const SITE = "AU EV Charging Finder";
const DESC = "Find electric vehicle charging stations across Australia. 1,400+ stations with connector types, operators, and locations.";
const URL = "https://ev-charging.rollersoft.com.au";

export const metadata: Metadata = {
  title: { default: SITE, template: `%s | ${SITE}` },
  description: DESC,
  openGraph: { title: SITE, description: DESC, url: URL, siteName: SITE, locale: "en_AU", type: "website" },
  alternates: { canonical: URL },
  robots: { index: true, follow: true },
};

const STATES = [
  { code: "nsw", name: "NSW" },
  { code: "vic", name: "VIC" },
  { code: "qld", name: "QLD" },
  { code: "sa", name: "SA" },
  { code: "wa", name: "WA" },
  { code: "tas", name: "TAS" },
  { code: "act", name: "ACT" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="emerald">
      <body className="min-h-screen bg-base-100 flex flex-col">
        <header className="navbar bg-primary text-primary-content shadow-lg">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <a className="text-xl font-bold flex items-center gap-2" href="/">⚡ {SITE}</a>
            <nav className="hidden md:flex gap-4 text-sm">
              {STATES.map((s) => (
                <a key={s.code} href={`/state/${s.code}`} className="hover:underline">{s.name}</a>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="footer footer-center p-6 bg-base-200 text-base-content">
          <p>
            © {new Date().getFullYear()} {SITE}. Data from{" "}
            <a href="https://www.openstreetmap.org" className="link" target="_blank" rel="noopener">OpenStreetMap</a> &{" "}
            <a href="https://opendata.transport.nsw.gov.au" className="link" target="_blank" rel="noopener">NSW Transport Open Data</a>.
          </p>
          <p className="text-xs opacity-60">
            A <a href="https://rollersoft.com.au" className="link" target="_blank" rel="noopener">Rollersoft</a> project.
          </p>
        </footer>
      </body>
    </html>
  );
}
