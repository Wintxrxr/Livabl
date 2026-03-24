import requests
import logging
from typing import Optional, Dict

logger = logging.getLogger(__name__)

class WAQIClient:
    BASE_URL = "https://api.waqi.info/feed"
    DEMO_TOKEN = "demo"

    def __init__(self, token: str = "demo"):
        self.token = token
        logger.info(f"WAQI Client initialized")

    def aqi_by_city(self, city: str) -> Optional[float]:
        try:
            url = f"{self.BASE_URL}/{city}/?token={self.token}"
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            data = response.json()

            if data.get('status') != 'ok':
                logger.warning(f"No data for city: {city}")
                return None

            aqi = data['data']['aqi']
            aqi_score = min((aqi / 500) * 100, 100)
            logger.info(f"{city.title()} AQI: {aqi_score:.1f}/100")
            return aqi_score

        except Exception as e:
            logger.error(f"Error getting AQI for {city}: {e}")
            return None

    def get_aqi_by_coordinates(self, lat: float, lon: float) -> Optional[float]:
        try:
            url = f"{self.BASE_URL}/geo:{lat};{lon}/?token={self.token}"
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            data = response.json()
 
            if data.get('status') != 'ok':
                logger.warning(f"No data for coords: {lat},{lon}")
                return None
            aqi = data['data']['aqi']
            aqi_score = min((aqi / 500) * 100, 100)
            location_name = data['data'].get('city', {}).get('name', 'Unknown')
            logger.info(f"{location_name} AQI: {aqi_score:.1f}/100")
            return aqi_score

        except Exception as e:
            logger.error(f"Error getting AQI: {e}")
            return None

    def get_detailed_aqi(self, city: str) -> Optional[Dict]:
        try:
            url = f"{self.BASE_URL}/{city}/?token={self.token}"
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            data = response.json()

            if data.get('status') != 'ok':
                return None

            full_data = data.get('data', {})
            iaqi = full_data.get('iaqi', {})
            return {
                'aqi_score': min((full_data['aqi'] / 500) * 100, 100),
                'raw_aqi': full_data['aqi'],
                'pm25': iaqi.get('pm25', {}).get('v'),
                'pm10': iaqi.get('pm10', {}).get('v'),
                'no2': iaqi.get('no2', {}).get('v'),
                'o3': iaqi.get('o3', {}).get('v'),
                'location': full_data.get('city', {}).get('name'),
            }

        except Exception as e:
            logger.error(f"Error: {e}")
            return None

    def convert_aqi_to_category(self, aqi_score: float) -> str:
        if aqi_score <= 20:
            return "Good"
        elif aqi_score <= 40:
            return "Moderate"
        elif aqi_score <= 60:
            return "Unhealthy for Sensitive Groups"
        elif aqi_score <= 80:
            return "Unhealthy"
        else:
            return "Hazardous"


