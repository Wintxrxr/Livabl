import math
import logging
from typing import Dict, Tuple

logger = logging.getLogger(__name__)
LANDFILL_LOCATIONS = {
    'bhalswa': {'lat': 28.7522, 'lng': 77.0633, 'distance_to_ward_km': 0.5},
    'okhla': {'lat': 28.5421, 'lng': 77.2513, 'distance_to_ward_km': 2.0},
    'gazipur': {'lat': 28.6131, 'lng': 77.2971, 'distance_to_ward_km': 1.5}
}
FLOOD_PRONE_WARDS = {
    'jahangirpuri': {
        'flood_events_10_years': 7,
        'waterlogging_days_per_monsoon': 15,
        'severity': 'high'
    },
    'savda_ghevra': {
        'flood_events_10_years': 5,
        'waterlogging_days_per_monsoon': 10,
        'severity': 'moderate-high'
    },
    'mustafabad': {
        'flood_events_10_years': 4,
        'waterlogging_days_per_monsoon': 8,
        'severity': 'moderate'
    }
}

#ward population density data (people/km²)
#source: Delhi Census 2021
WARD_DENSITY = {
    'jahangirpuri': 38000,
    'bhalswa': 35000,
    'mustafabad': 32000,
    'savda_ghevra': 30000,
    # ... add other wards with actual data
}

def check_aqi_data_availability(ward_name: str, aqi_value: float) -> Tuple[bool, str]:
    if aqi_value is None or aqi_value <= 0:
        return False, f"Ward {ward_name}: No valid AQI data available" 
    return True, ""


def calculate_environment_score_enhanced(
    ward_name: str,
    aqi_value: float = None,
    raw_aqi_score: float = None
) -> float:
    has_data, warning = check_aqi_data_availability(ward_name, aqi_value)

    if has_data and aqi_value:
        #lower AQI = higher livability
        if aqi_value <= 50:
            base_score = 95  # Good
        elif aqi_value <= 100:
            base_score = 75  # Moderate
        elif aqi_value <= 200:
            base_score = 40  # Poor
        else:
            base_score = 15  # Very poor
    else:
        base_score = 40
        logger.warning(warning)
    landfill_penalty = calculate_landfill_penalty(ward_name)
    final_score = base_score - landfill_penalty
    return max(0, min(100, final_score))


def calculate_landfill_penalty(ward_name: str) -> float:
    if ward_name not in LANDFILL_LOCATIONS:
        return 0
    landfill = LANDFILL_LOCATIONS[ward_name]
    distance_km = landfill['distance_to_ward_km']
    if distance_km < 1:
        return 40
    elif distance_km < 2:
        return 30
    elif distance_km < 5:
        return 20
    elif distance_km < 10:
        return 10
    else:
        return 0


def calculate_density_score(ward_name: str) -> float:    
    density = WARD_DENSITY.get(ward_name, 20000)  # Default 20k/km²
    if density > 40000:
        score = 20
    elif density > 30000:
        score = 35   # Highly crowded
    elif density > 20000:
        score = 50   # Moderately dense
    elif density > 10000:
        score = 70   # Low density
    else:
        score = 85   # Very low density
    
    logger.info(f"Ward {ward_name}: Density={density}/km² → Score={score}")
    return score


def calculate_flood_risk_score(ward_name: str) -> float:    
    if ward_name not in FLOOD_PRONE_WARDS:
        return 85
    flood_data = FLOOD_PRONE_WARDS[ward_name]
    events = flood_data['flood_events_10_years']
    waterlogging_days = flood_data['waterlogging_days_per_monsoon']
    event_penalty = events * 5
    waterlogging_penalty = waterlogging_days * 1
    base_score = 85
    final_score = base_score - event_penalty - waterlogging_penalty
    logger.info(f"Ward {ward_name}: {events} floods, {waterlogging_days} "
                f"waterlogging days → Score={max(15, final_score)}")
    return max(15, final_score)
