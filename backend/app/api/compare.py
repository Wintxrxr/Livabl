from fastapi import APIRouter, HTTPException
from app.data.wards import get_ward_by_id
from app.scoring.score import calculate_score
from app.schemas.ward import CompareResponse

router = APIRouter()


@router.get("/compare", response_model=CompareResponse, summary="Compare two wards")
def compare(ward1: int, ward2: int):
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