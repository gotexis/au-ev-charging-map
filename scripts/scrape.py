#!/usr/bin/env python3
"""Transform raw EV charger CSV into structured JSON for the site."""
import csv, json, os, re
from collections import defaultdict

def slugify(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')

def main():
    stations = []
    with open("data/raw_ev_chargers.csv", "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            lat = row.get("Latitude", "")
            lng = row.get("Longitude", "")
            if not lat or not lng:
                continue
            try:
                lat_f, lng_f = float(lat), float(lng)
            except ValueError:
                continue
            
            connectors = []
            if row.get("CHAdeMO") and row["CHAdeMO"] not in ("0", ""):
                connectors.append({"type": "CHAdeMO", "count": int(row["CHAdeMO"])})
            if row.get("CCS_SAE") and row["CCS_SAE"] not in ("0", ""):
                connectors.append({"type": "CCS/SAE", "count": int(row["CCS_SAE"])})
            if row.get("Tesla_Fast") and row["Tesla_Fast"] not in ("0", ""):
                connectors.append({"type": "Tesla", "count": int(row["Tesla_Fast"])})
            
            station = {
                "id": int(row.get("OBJECTID", 0)),
                "name": row.get("Station_name", "").strip(),
                "address": row.get("Station_address", "").strip(),
                "hours": row.get("Opening_hours", "").strip(),
                "operator": row.get("Operator", "").strip(),
                "numStations": int(row.get("Number_of_stations", 0) or 0),
                "numPlugs": int(row.get("Number_of_plugs", 0) or 0),
                "chargerType": row.get("Charger_type", "").strip(),
                "chargerRatingKW": row.get("Charger_rating", "").strip(),
                "lat": lat_f,
                "lng": lng_f,
                "lga": row.get("LGANAME", "").strip(),
                "postcode": row.get("PCODE", "").strip(),
                "connectors": connectors,
                "slug": slugify(row.get("Station_name", "")),
            }
            stations.append(station)
    
    # Deduce state from postcode
    for s in stations:
        pc = s["postcode"]
        if pc.startswith("2") or pc.startswith("02"):
            s["state"] = "NSW"
        elif pc.startswith("3") or pc.startswith("03"):
            s["state"] = "VIC"
        elif pc.startswith("4") or pc.startswith("04"):
            s["state"] = "QLD"
        elif pc.startswith("5") or pc.startswith("05"):
            s["state"] = "SA"
        elif pc.startswith("6") or pc.startswith("06"):
            s["state"] = "WA"
        elif pc.startswith("7") or pc.startswith("07"):
            s["state"] = "TAS"
        elif pc.startswith("0"):
            s["state"] = "NT"
        elif pc.startswith("26") or pc.startswith("29"):
            s["state"] = "ACT"
        else:
            s["state"] = "Unknown"
        # ACT override
        if pc.startswith("26"):
            s["state"] = "ACT"
    
    with open("data/stations.json", "w") as f:
        json.dump(stations, f)
    
    # Stats
    states = defaultdict(int)
    operators = defaultdict(int)
    for s in stations:
        states[s["state"]] += 1
        operators[s["operator"]] += 1
    
    print(f"Total: {len(stations)} stations")
    print("\nBy state:")
    for st, c in sorted(states.items(), key=lambda x: -x[1]):
        print(f"  {st}: {c}")
    print(f"\nTop operators:")
    for op, c in sorted(operators.items(), key=lambda x: -x[1])[:10]:
        print(f"  {op}: {c}")

if __name__ == "__main__":
    main()
