from pydantic import BaseModel
from typing import Dict


class WardResponse(BaseModel):
    id: int
    name: str
    city: str
    score: float


class WardDetailResponse(BaseModel):
    id: int
    name: str
    city: str
    score: float
    metrics: Dict[str, float]


class CompareResponse(BaseModel):
    ward1: WardResponse
    ward2: WardResponse