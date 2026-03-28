import json
from pathlib import Path

APP_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = APP_DIR.parent
DATA_PATH = BACKEND_DIR / "data" / "processed" / "wards_score.geojson"

def load_data():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
        return data["features"]


def _ward_name(properties: dict, index: int) -> str:
    name = properties.get("Ward_Name")
    if isinstance(name, str) and name.strip():
        return name.strip()
    return f"Ward {index}"


def get_all_wards():
    features = load_data()
    return [
        {
            "id": i,
            "name": _ward_name(w["properties"], i),
            "city": "Delhi",
            "score": round(float(w["properties"].get("livability_score", 0)) * 100, 2),
            **w["properties"]
        }
        for i, w in enumerate(features)
    ]

def get_ward_by_id(ward_id: int):
    wards_list = get_all_wards()
    if ward_id < 0 or ward_id >= len(wards_list):
        return None
    return wards_list[ward_id]
