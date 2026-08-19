# Data Expansion Notes

Date: 2026-07-02

## InfraDispatch

The live planner loads `data/locations.json`. This file has been expanded to 7,510 searchable UAE tourism location rows for MVP search and stress testing across all seven emirates.

Confidence labels:

- `curated-seed`: manually selected important UAE tourism points and major operational locations.
- `generated-seed`: generated rows for broad hotel, mall, attraction, museum, culture site, transport hub, market, beach, outdoor and venue search coverage. These rows must be verified before live operations.

The JSON and CSV exports were refreshed from the same dataset:

- `data/locations.json`
- `data/uae_tourism_locations.json`
- `data/uae_tourism_locations.csv`

Important limitation: generated rows are useful for MVP testing, search behavior, and data-model planning. They are not a verified supplier/location database.

## InfraCluster

InfraCluster now uses `data/uae_tourism_locations.json` as its location database. The dataset covers:

- Abu Dhabi
- Dubai
- Sharjah
- Ajman
- Umm Al Quwain
- Ras Al Khaimah
- Fujairah

Location types include hotels, hotel apartments, resorts, malls, museums, attractions, culture sites, transport hubs, beaches, outdoor points, markets, restaurant areas and event venues.

Important limitation: InfraCluster can import real operator spreadsheets in the browser, but the bundled UAE tourism database remains static seed data. It is not a live DTCM/DCT/hotel/supplier master registry and should be verified before operational use.

## InfraQuote

The attraction database in `assets/js/infraquote-data.js` was expanded with additional UAE tourism attractions and updated ticket assumptions.

Official/primary references checked on 2026-07-01:

- Louvre Abu Dhabi official ticket page: adult 18+ AED 70; under 18 free.
- Qasr Al Watan official booking page: adult from AED 65; junior from AED 30.
- Ferrari World Abu Dhabi official ticket page: single-day ticket from AED 345.
- Warner Bros. World Abu Dhabi official ticket page: single-day ticket from AED 345.
- Yas Waterworld official ticket page: single-day ticket AED 295.
- SeaWorld Abu Dhabi official ticket page: online offer AED 316 from AED 395.
- teamLab Phenomena Abu Dhabi official booking page: regular from AED 145; child from AED 50.
- Qasr Al Hosn official tourism page: general admission starts at AED 30.

Important limitation: ticket prices change by date, offer, resident rule, group contract, time slot and supplier. InfraQuote keeps these as MVP defaults and still warns the user to verify before sending a real quotation.

## InfraSky

InfraSky already includes season, Moon, meteor, constellation, Milky Way and weather logic. This pass made those ideas more visible:

- Added a Sky Intelligence section on the project page.
- Added a text-based sky map to the generated report.
- Expanded the guide story report so the user can understand what the guide should explain on the selected night.

Future real-sky upgrade path:

- Connect a planetarium/sky-map API or astronomy engine.
- Render a visual sky chart for the selected date, time and location.
- Add planet visibility, azimuth/altitude, moon altitude and exact constellation rise/set calculations.
