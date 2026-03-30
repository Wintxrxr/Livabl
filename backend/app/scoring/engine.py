import logging
from typing import Dict
from .metrics import (
    calculate_environment_score_enhanced,
    calculate_density_score,
    calculate_flood_risk_score
)

logger = logging.getLogger(__name__)
class ScoringEngine:
    def __init__(self):
        self.metric_weights = {
            'healthcare': 0.12,
            'education': 0.12,
            'connectivity': 0.08,
            'environment': 0.08,
            'civic': 0.08,
            'sentiment': 0.08,
            'density': 0.22,
            'flood_risk': 0.22
        }
 
    def calculate_ward_score(
        self,
        ward_name: str,
        healthcare_score: float,
        education_score: float,
        connectivity_score: float,
        aqi_value: float = None,
        civic_score: float = 50,
        sentiment_score: float = 50
    ) -> Dict[str, any]:
        environment_score = calculate_environment_score_enhanced(
            ward_name,
            aqi_value
        )

        density_score = calculate_density_score(ward_name)
        flood_risk_score = calculate_flood_risk_score(ward_name)
        final_score = (
            healthcare_score * self.metric_weights['healthcare'] +
            education_score * self.metric_weights['education'] +
            connectivity_score * self.metric_weights['connectivity'] +
            environment_score * self.metric_weights['environment'] +
            civic_score * self.metric_weights['civic'] +
            sentiment_score * self.metric_weights['sentiment'] +
            density_score * self.metric_weights['density'] +
            flood_risk_score * self.metric_weights['flood_risk']
        )
        final_score = max(0, min(100, final_score))
        result = {
            'ward_name': ward_name,
            'final_score': round(final_score, 1),
            'breakdown': {
                'healthcare': round(healthcare_score, 1),
                'education': round(education_score, 1),
                'connectivity': round(connectivity_score, 1),
                'environment': round(environment_score, 1),
                'civic': round(civic_score, 1),
                'sentiment': round(sentiment_score, 1),
                'density': round(density_score, 1),
                'flood_risk': round(flood_risk_score, 1)
            },
            'weights': self.metric_weights,
            'classification': self._classify_score(final_score)
        }
        logger.info(f"Calculated score for {ward_name}: {final_score}/100")
        return result
    @staticmethod
    def _classify_score(score: float) -> str:
        if score >= 75:
            return 'excellent'
        elif score >= 65:
            return 'good'
        elif score >= 50:
            return 'moderate'
        elif score >= 35:
            return 'poor':
        else:
            return 'very_poor'
