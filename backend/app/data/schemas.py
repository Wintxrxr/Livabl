import logging
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class WardScore(BaseModel):
    overall_score: float = Field(..., ge=0, le=100)
    healthcare_access: Optional[float] = Field(None, ge=0, le=100)
    education_access: Optional[float] = Field(None, ge=0, le=100)
    connectivity: Optional[float] = Field(None, ge=0, le=100)
    environment: Optional[float] = Field(None, ge=0, le=100)
    civic_responsiveness: Optional[float] = Field(None, ge=0, le=100)
    community_sentiment: Optional[float] = Field(None, ge=0, le=100)

class Ward(BaseModel):
    id: str = Field(..., description="Unique ward identifier")
    name: str = Field(..., description="Ward name")
    scores: WardScore = Field(..., description="Ward quality scores")
    geometry: Dict[str, Any] = Field(..., description="GeoJSON geometry object")

class ComparisonResult(BaseModel):
    wards: List[Ward]
    best_ward: Ward
    worst_ward: Ward
    average_score: float
    score_range: Dict[str, float]

class HealthResponse(BaseModel):
    status: str
    wards_loaded: int
    timestamp: str
    message: Optional[str] = None

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    score = WardScore(overall_score=75.5, healthcare_access=80)
    ward = Ward(id="w1", name="Ward", scores=score, geometry={"type": "Polygon", "coordinates": []})
    print(f"Ward created: {ward.name}")
