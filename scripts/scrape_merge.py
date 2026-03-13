#!/usr/bin/env python3
"""Merge multiple free AU EV charging data sources into stations.json.

Sources:
1. NSW TfNSW Open Data CSV (data/raw_ev_chargers_sep25.csv) — primary, ~1400 stations
2. OpenChargeMap bulk dump (GitHub archive) — fills VIC/QLD/SA/WA/TAS/NT
3. QLD TMR Open Data CSV — QLD govt-funded stations

Usage: python3 scripts/scrape_merge.py
"""
import csv, json, os, re, urllib.request, gzip, tempfile
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"

def slugify(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')[:80]

STATE_NORMALIZE = {
    'NEW SOUTH WALES': 'NSW', 'VICTORIA': 'VIC', 'QUEENSLAND': 'QLD',
    'SOUTH AUSTRALIA': 'SA', 'WESTERN AUSTRALIA': 'WA', 'TASMANIA': 'TAS',
    'NORTHERN TERRITORY': 'NT', 'AUSTRALIAN CAPITAL TERRITORY': 'ACT',
    'NSW': 'NSW', 'VIC': 'VIC', 'QLD': 'QLD', 'SA': 'SA',
    'WA': 'WA', 'TAS': 'TAS', 'NT': 'NT', 'ACT': 'ACT',
}

def state_from_postcode(pc):
    if not pc: return 'Unknown'
    pc = str(pc).strip()
    if pc.startswith('26') or pc.startswith('29'): return 'ACT'
    if pc.startswith('2'): return 'NSW'
    if pc.startswith('3'): return 'VIC'
    if pc.startswith('4'): return 'QLD'
    if pc.startswith('5'): return 'SA'
    if pc.startswith('6'): return 'WA'
    if pc.startswith('7'): return 'TAS'
    if pc.startswith('0'): return 'NT'
    return 'Unknown'

def load_nsw_csv():
    """Load NSW TfNSW open data CSV."""
    csv_path = DATA / "raw_ev_chargers_sep25.csv"
    if not csv_path.exists():
        print("NSW CSV not found, skipping")
        return []
    stations = []
    with open(csv_path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            lat, lng = row.get("Latitude",""), row.get("Longitude","")
            if not lat or not lng: continue
            try: lat_f, lng_f = float(lat), float(lng)
            except: continue
            connectors = []
            for ct, key in [("CHAdeMO","CHAdeMO"),("CCS/SAE","CCS_SAE"),("Tesla","Tesla_Fast")]:
                v = row.get(key,"")
                if v and v not in ("0",""): connectors.append({"type":ct,"count":int(v)})
            name = row.get("Station_name","").strip()
            stations.append({
                "name": name,
                "address": row.get("Station_address","").strip(),
                "hours": row.get("Opening_hours","").strip(),
                "operator": row.get("Operator","").strip(),
                "numStations": int(row.get("Number_of_stations",0) or 0),
                "numPlugs": int(row.get("Number_of_plugs",0) or 0),
                "chargerType": row.get("Charger_type","").strip(),
                "chargerRatingKW": row.get("Charger_rating","").strip(),
                "lat": lat_f, "lng": lng_f,
                "lga": row.get("LGANAME","").strip(),
                "postcode": row.get("PCODE","").strip(),
                "state": state_from_postcode(row.get("PCODE","")),
                "slug": slugify(name) if name else "",
                "connectors": connectors,
            })
    print(f"NSW CSV: {len(stations)}")
    return stations

def load_ocm_dump():
    """Download and parse OCM GitHub archive for non-NSW/ACT stations."""
    url = "https://github.com/openchargemap/ocm-data/raw/master/poi.json.gz"
    print("Downloading OCM dump...")
    tmp = tempfile.NamedTemporaryFile(suffix=".json.gz", delete=False)
    urllib.request.urlretrieve(url, tmp.name)
    stations = []
    with gzip.open(tmp.name, 'rt') as f:
        for line in f:
            try: poi = json.loads(line.strip())
            except: continue
            addr = poi.get('AddressInfo',{})
            country = addr.get('Country',{})
            if country.get('ID') != 14 and country.get('ISOCode') != 'AU': continue
            lat, lng = addr.get('Latitude'), addr.get('Longitude')
            if not lat or not lng: continue
            sop = (addr.get('StateOrProvince','') or '').strip()
            pc = str(addr.get('Postcode','') or '').strip()
            state = STATE_NORMALIZE.get(sop.upper(), state_from_postcode(pc))
            if state in ('NSW','ACT'): continue  # better data from TfNSW
            connections = poi.get('Connections') or []
            connectors, dc_found, max_kw = [], False, 0
            for conn in connections:
                ct = (conn.get('ConnectionType') or {}).get('Title','')
                kw = conn.get('PowerKW') or 0
                lid = (conn.get('Level') or {}).get('ID',0)
                if kw > max_kw: max_kw = kw
                if lid == 3 or kw >= 50: dc_found = True
                if 'CHAdeMO' in ct: connectors.append({'type':'CHAdeMO','count':1})
                elif 'CCS' in ct or 'Combo' in ct: connectors.append({'type':'CCS/SAE','count':1})
                elif 'Tesla' in ct: connectors.append({'type':'Tesla','count':1})
                elif 'Type 2' in ct: connectors.append({'type':'Type 2','count':1})
            operator = ((poi.get('OperatorInfo') or {}).get('Title','') or '')
            name = addr.get('Title','') or ''
            stations.append({
                "name": name,
                "address": ', '.join(filter(None, [addr.get('AddressLine1',''), addr.get('Town',''), sop, pc])),
                "hours": "", "operator": operator,
                "numStations": poi.get('NumberOfPoints') or 1,
                "numPlugs": len(connections) or 1,
                "chargerType": "DC" if dc_found else "AC",
                "chargerRatingKW": str(int(max_kw)) if max_kw else "",
                "lat": lat, "lng": lng,
                "lga": "", "postcode": pc, "state": state,
                "slug": slugify(name) if name else "",
                "connectors": connectors,
            })
    os.unlink(tmp.name)
    print(f"OCM dump: {len(stations)} non-NSW/ACT AU stations")
    return stations

def load_qld_tmr():
    """Download QLD TMR EV charging CSV."""
    url = "https://www.tmr.qld.gov.au/-/media/aboutus/corpinfo/Open%20data/findachargingev/csl_ev.csv"
    print("Downloading QLD TMR data...")
    tmp = tempfile.NamedTemporaryFile(suffix=".csv", delete=False, mode='w')
    req = urllib.request.urlopen(url, timeout=30)
    content = req.read().decode('utf-8')
    tmp.write(content)
    tmp.close()
    stations = []
    with open(tmp.name) as f:
        reader = csv.DictReader(f)
        for row in reader:
            lat, lng = row.get('Latitude','').strip(), row.get('Longitude','').strip()
            if not lat or not lng: continue
            try: lat_f, lng_f = float(lat), float(lng)
            except: continue
            name = row.get('Location Name','').strip()
            stations.append({
                "name": name,
                "address": row.get('Address','').strip(),
                "hours": "", "operator": row.get('Host','').strip(),
                "numStations": 1, "numPlugs": 1,
                "chargerType": "DC", "chargerRatingKW": "",
                "lat": lat_f, "lng": lng_f,
                "lga": "", "postcode": "", "state": "QLD",
                "slug": slugify(name) if name else "",
                "connectors": [],
            })
    os.unlink(tmp.name)
    print(f"QLD TMR: {len(stations)}")
    return stations

def main():
    all_stations = []
    seen = set()

    # Priority order: NSW first (best data), then QLD TMR, then OCM
    for source_fn in [load_nsw_csv, load_qld_tmr, load_ocm_dump]:
        for s in source_fn():
            key = (round(s['lat'],3), round(s['lng'],3))
            if key in seen: continue
            if s['state'] == 'Unknown': continue
            seen.add(key)
            all_stations.append(s)

    all_stations.sort(key=lambda s: (s['state'], s['name']))
    for i, s in enumerate(all_stations):
        s['id'] = i
        if not s['slug']: s['slug'] = f"station-{i}"

    with open(DATA / "stations.json", 'w') as f:
        json.dump(all_stations, f)

    states = defaultdict(int)
    for s in all_stations:
        states[s['state']] += 1
    print(f"\nTotal: {len(all_stations)} stations")
    for st, c in sorted(states.items(), key=lambda x:-x[1]):
        print(f"  {st}: {c}")

if __name__ == "__main__":
    main()
