<div align="center">

# Livabl

**A Data-Driven Quality of Life Index for Smarter Home Decisions**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Built with OSM](https://img.shields.io/badge/Maps-OpenStreetMap-blue)](https://www.openstreetmap.org)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB)](https://react.dev)
[![Python](https://img.shields.io/badge/Backend-Python%20%2B%20FastAPI-3776AB)](https://fastapi.tiangolo.com)
[![FossHack 2025](https://img.shields.io/badge/FossHack-2025-orange)](https://fossunited.org)

Livabl is an open-source platform that aggregates public urban datasets to generate a **0–100 Quality of Life score** for every ward in Delhi NCR. It helps renters, homebuyers, researchers, and urban planners make informed decisions through comparable locality insights and an interactive map.

</div>

---

## The Problem

Housing decisions are often made with incomplete or biased information.

- Property listings only emphasize positives
- Short visits don't reveal long-term livability issues
- Public data on air quality, infrastructure, and civic issues is scattered across multiple portals with no unified view

As a result, people rely on price, intuition, and word-of-mouth rather than measurable quality-of-life indicators. **Delhi NCR alone has 11 million+ residents making housing decisions without reliable livability data.**

---

## The Solution

Livabl unifies multiple public datasets into a **standardized locality score (0–100)** and visualizes it on an interactive OpenStreetMap-powered dashboard.

The platform transforms complex urban data into simple, actionable insights through:

- Interactive ward-level map with color-coded livability zones
- Per-ward score breakdown across 6 key metrics
- Ranked neighborhood list with real-time filtering
- Side-by-side locality comparison *(coming soon)*

---

## Live Demo

> Dashboard running locally — see Getting Started below.

![Livabl Dashboard](docs/screenshot.png)

---

## Quality Score Metrics

Livabl computes a **0–100 livability score** using six weighted pillars:

| Metric | Description | Data Source |
|--------|-------------|-------------|
| 🏥 Healthcare Access | Hospitals within a 3 km radius | OpenStreetMap |
| 🏫 Education Access | Schools within a 3 km radius | OpenStreetMap |
| 🚇 Connectivity | Metro accessibility index | Public transit data |
| 🌿 Environment | Average AQI levels | Open AQI datasets |
| 🏛️ Civic Responsiveness | Active complaint data | Municipal records |
| 💬 Community Sentiment | User-submitted ratings | Platform data |

Each metric is normalized to a common 0–100 scale before weighted aggregation into a final Quality Score.

---

## How the Scoring Works

```
Raw public datasets
        ↓
Data ingestion & cleaning (Python)
        ↓
Normalize metrics → 0-100 scale
        ↓
Weighted aggregation per ward
        ↓
Quality Score generated for all 290 Delhi wards
        ↓
Served via FastAPI → React dashboard
```

---

## Tech Stack

### Frontend
- **React + TypeScript** — component-based UI
- **Vite** — fast dev server and build tool
- **Leaflet.js** — interactive map rendering
- **OpenStreetMap** — free, open-source map tiles and ward boundary data

### Backend
- **Python + FastAPI** — REST API and data processing
- **GeoJSON** — ward boundary and score data format
- **uv** — fast Python package manager

### Data & Mapping
- **OpenStreetMap** — ward boundaries via Overpass API
- **290 Delhi NCR wards** with real livability scores
- Open environmental datasets (AQI, hospitals, schools)

---

## Project Structure

```
Livabl/
├── frontend/                  # React + TypeScript dashboard
│   ├── src/
│   │   ├── api/               # Backend API layer
│   │   │   ├── wards.ts       # Real ward data loading
│   │   │   └── overpass.ts    # OSM boundary parser
│   │   ├── components/        # UI components
│   │   │   ├── Header.tsx     # Search + filter bar
│   │   │   ├── LiveMap.tsx    # Leaflet OSM map
│   │   │   ├── Sidebar.tsx    # Score cards + ward list
│   │   │   └── ScoreBar.tsx   # Animated score bars
│   │   ├── types/             # TypeScript definitions
│   │   └── utils.ts           # Score color helpers
│   └── public/
│       └── data/
│           └── wards_score.geojson   # 290 Delhi ward scores
│
├── backend/                   # Python scoring pipeline
│   ├── app/
│   │   ├── api/routes.py      # FastAPI endpoints
│   │   ├── data/
│   │   │   ├── ingestion.py   # GeoJSON loader
│   │   │   ├── processing.py  # Ward data transformer
│   │   │   └── schemas.py     # Pydantic data models
│   │   └── scoring/           # Score computation engine
│   └── data/
│       ├── raw/               # Source GeoJSON files
│       └── processed/         # Scored ward data
│
└── docs/                      # Architecture and methodology
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm
- **uv** (Python package manager)

```bash
pip install uv
```

### Installation

```bash
# Clone the repository
git clone https://github.com/WalkingDead1407/Livabl.git
cd Livabl
```

#### Backend

```bash
cd backend

# Create and activate virtual environment
uv venv
source .venv/bin/activate   # Linux / macOS
# .venv\Scripts\activate    # Windows

# Install dependencies
uv pip install -r requirements.txt

# Run the API server
python app.py
```

The API will be available at `http://localhost:8000`.

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

#### Connecting Frontend to Backend

Create a `.env` file inside the `frontend/` folder:

```
VITE_API_URL=http://localhost:8000
```

The frontend will automatically switch from local GeoJSON to the live API.

---

## Contributing

Contributions are welcome! This project is built for FossHack 2025.

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Commit your changes (`git commit -m "feat: add your feature"`)
4. Push and open a pull request

Please open an issue before starting work on a large feature so we can coordinate.

---

## Roadmap

- [x] Interactive OSM map with Leaflet.js
- [x] 290 Delhi ward boundaries from OpenStreetMap
- [x] Real livability scores from backend pipeline
- [x] Ward search across all 290 wards
- [ ] Filter map by score category (Healthcare, Education, Environment)
- [ ] Side-by-side ward comparison view
- [ ] Connect to live FastAPI backend
- [ ] Crime and safety indices
- [ ] Rental price trend overlay
- [ ] Walkability and green cover metrics
- [ ] Time-series score evolution
- [ ] Support for additional Indian cities

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Livabl — Turning urban data into clear decisions.**

Built with ❤️ for [FossHack 2025](https://fossunited.org) · Powered by [OpenStreetMap](https://www.openstreetmap.org)

</div>
