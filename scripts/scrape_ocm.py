#!/usr/bin/env python3
"""Fetch ALL Australian EV charging stations from OpenChargeMap API (free, no key needed for basic).
Outputs data/stations.json in the same schema the site expects.
"""
import json, re, urllib.request, time
from collections import defaultdict

API = "https://api.openchargemap.io/v3/poi"
COUNTRY_ID = 14  # Australia
MAX_RESULTS = 5000

def slugify(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')[:80]

def state_from_postcode(pc):
    if not pc: return "Unknown"
    pc = str(pc).strip()
    if pc.startswith("26"): return "ACT"
    if pc.startswith("29"): return "ACT"
    if pc.startswith("2") or pc.startswith("02"): return "NSW"
    if pc.startswith("3") or pc.startswith("03"): return "VIC"
    if pc.startswith("4") or pc.startswith("04"): return "QLD"
    if pc.startswith("5") or pc.startswith("05"): return "SA"
    if pc.startswith("6") or pc.startswith("06"): return "WA"
    if pc.startswith("7") or pc.startswith("07"): return "TAS"
    if pc.startswith("08") or pc.startswith("09"): return "NT"
    if pc.startswith("0"): return "NT"
    return "Unknown"

def state_from_title(title):
    if not title: return None
    t = title.upper().strip()
    mapping = {
        "NEW SOUTH WALES": "NSW", "VICTORIA": "VIC", "QUEENSLAND": "QLD",
        "SOUTH AUSTRALIA": "SA", "WESTERN AUSTRALIA": "WA", "TASMANIA": "TAS",
        "NORTHERN TERRITORY": "NT", "AUSTRALIAN CAPITAL TERRITORY": "ACT",
        "NSW": "NSW", "VIC": "VIC", "QLD": "QLD", "SA": "SA",
        "WA": "WA", "TAS": "TAS", "NT": "NT", "ACT": "ACT",
    }
    return mapping.get(t)

def fetch_page(offset=0):
    url = f"{API}?output=json&countryid={COUNTRY_ID}&maxresults={MAX_RESULTS}&compact=true&verbose=false&offset={offset}"
    print(f"Fetching offset={offset}...")
    req = urllib.request.Request(url, headers={"User-Agent": "AU-EV-Charging-Finder/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read())

def main():
    all_pois = []
    offset = 0
    while True:
        batch = fetch_page(offset)
        if not batch:
            break
        all_pois.extend(batch)
        print(f"  Got {len(batch)} (total: {len(all_pois)})")
        if len(batch) < MAX_RESULTS:
            break
        offset += MAX_RESULTS
        time.sleep(1)

    stations = []
    seen_ids = set()
    for poi in all_pois:
        ocm_id = poi.get("ID", 0)
        if ocm_id in seen_ids:
            continue
        seen_ids.add(ocm_id)

        addr = poi.get("AddressInfo") or {}
        lat = addr.get("Latitude")
        lng = addr.get("Longitude")
        if not lat or not lng:
            continue

        # Connections
        connections = poi.get("Connections") or []
        connectors = []
        dc_found = False
        max_kw = 0
        for conn in connections:
            ct = conn.get("ConnectionType") or {}
            ct_title = ct.get("Title", "")
            level = conn.get("Level") or {}
            level_id = level.get("ID", 0)
            kw = conn.get("PowerKW") or 0
            if kw > max_kw:
                max_kw = kw
            if level_id == 3 or kw >= 50:
                dc_found = True

            # Map connector types
            if "CHAdeMO" in ct_title:
                connectors.append({"type": "CHAdeMO", "count": 1})
            elif "CCS" in ct_title or "Combo" in ct_title:
                connectors.append({"type": "CCS/SAE", "count": 1})
            elif "Tesla" in ct_title:
                connectors.append({"type": "Tesla", "count": 1})
            elif "Type 2" in ct_title:
                connectors.append({"type": "Type 2", "count": 1})

        operator = (poi.get("OperatorInfo") or {}).get("Title", "") or ""
        name = addr.get("Title", "") or ""
        address_line = addr.get("AddressLine1", "") or ""
        town = addr.get("Town", "") or ""
        postcode = addr.get("Postcode", "") or ""
        state_or_province = addr.get("StateOrProvince", "") or ""

        full_address = ", ".join(filter(None, [address_line, town, state_or_province, postcode]))
        
        state = state_from_title(state_or_province) or state_from_postcode(postcode)

        num_plugs = len(connections) or 1
        charger_type = "DC" if dc_found else "AC"
        charger_kw = str(int(max_kw)) if max_kw else ""

        station = {
            "id": ocm_id,
            "name": name,
            "address": full_address,
            "hours": "",
            "operator": operator,
            "numStations": poi.get("NumberOfPoints") or 1,
            "numPlugs": num_plugs,
            "chargerType": charger_type,
            "chargerRatingKW": charger_kw,
            "lat": lat,
            "lng": lng,
            "lga": "",
            "postcode": postcode,
            "state": state,
            "slug": slugify(name) if name else f"station-{ocm_id}",
            "connectors": connectors,
        }
        stations.append(station)

    # Sort by state then name
    stations.sort(key=lambda s: (s["state"], s["name"]))

    with open("data/stations.json", "w") as f:
        json.dump(stations, f)

    # Stats
    states = defaultdict(int)
    operators = defaultdict(int)
    for s in stations:
        states[s["state"]] += 1
        operators[s["operator"]] += 1

    print(f"\nTotal: {len(stations)} stations")
    print("\nBy state:")
    for st, c in sorted(states.items(), key=lambda x: -x[1]):
        print(f"  {st}: {c}")
    print(f"\nTop operators:")
    for op, c in sorted(operators.items(), key=lambda x: -x[1])[:10]:
        print(f"  {op or '(unknown)'}: {c}")

if __name__ == "__main__":
    main()
