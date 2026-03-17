from fastapi import APIRouter, HTTPException
from typing import List
from app.data.wards import get_all_wards, get_ward_by_id
from app.scoring.score import calculate_score
from app.schemas.ward import WardResponse, WardDetailResponse, CompareResponse

router = APIRouter(tags=["Wards"])


@router.get("/wards", response_model=List[WardResponse])
def list_wards():
    data = get_all_wards()

    return [
        {
            "id": w["id"],
            "name": w["name"],
            "city": w["city"],
            "score": round(calculate_score(w), 2)
        }
        for w in data
    ]


@router.get("/wards/{ward_id}", response_model=WardDetailResponse)
def get_ward(ward_id: int):
    w = get_ward_by_id(ward_id)

    if not w:
        raise HTTPException(status_code=404, detail="Ward not found")

    return {
        "id": w["id"],
        "name": w["name"],
        "city": w["city"],
        "score": round(calculate_score(w), 2),
        "metrics": {
            "healthcare": w["healthcare"],
            "education": w["education"],
            "connectivity": w["connectivity"],
            "environment": w["environment"],
            "civic": w["civic"],
            "sentiment": w["sentiment"]
        }
    }


@router.get("/compare", response_model=CompareResponse)
def compare_route(ward1: int, ward2: int):
    w1 = get_ward_by_id(ward1)
    w2 = get_ward_by_id(ward2)

    if not w1 or not w2:
        raise HTTPException(status_code=404, detail="One or both wards not found")

    return {
        "ward1": {
            "id": w1["id"],
            "name": w1["name"],
            "city": w1["city"],
            "score": round(calculate_score(w1), 2)
        },
        "ward2": {
            "id": w2["id"],
            "name": w2["name"],
            "city": w2["city"],
            "score": round(calculate_score(w2), 2)
        }
    }