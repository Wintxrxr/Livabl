import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parents[1] #goes to /backend/app/

ROOT_DIR = BASE_DIR.parent #goes to /backend/ 

DATA_PATH = BASE_DIR / "data" / "processed" / "wards_score.geojson"

def load_data():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
        return data["features"]

def get_all_wards():
    features = load_data()
    return [
        {
            "id": i,
            "name": w["properties"].get("ward_name", f"Ward {i}"),
            "city": "Delhi",
            **w["properties"] 
        }
        for i, w in enumerate(features)
    ]

def get_ward_by_id(ward_id: int):
    wards_list = get_all_wards()
    if ward_id < 0 or ward_id >= len(wards_list):
        return None
    return wards_list[ward_id]
