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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="emerald">
      <body className="min-h-screen bg-base-100 flex flex-col">
        <header className="navbar bg-primary text-primary-content shadow-lg">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <a className="text-xl font-bold flex items-center gap-2" href="/">⚡ {SITE}</a>
            <nav className="hidden md:flex gap-4 text-sm">
              <a href="/state/nsw" className="hover:underline">NSW</a>
              <a href="/state/act" className="hover:underline">ACT</a>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="footer footer-center p-6 bg-base-200 text-base-content">
          <p>© {new Date().getFullYear()} {SITE}. Data from NSW Transport Open Data (Sep 2025). Beta: Currently covers NSW & ACT.</p>
        </footer>
      </body>
    </html>
  );
}
