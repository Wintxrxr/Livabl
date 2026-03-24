import os


class AQIConfig:
    WAQI_BASE_URL = "https://api.waqi.info/feed"
    WAQI_TOKEN = os.getenv("WAQI_TOKEN", "demo")
    USE_REALTIME_AQI = os.getenv("USE_REALTIME_AQI", "True").lower() == "true"
    AQI_CACHE_DIR = os.getenv("AQI_CACHE_DIR", "/tmp/livabl_aqi_cache")
    AQI_CACHE_TTL_MINUTES = int(os.getenv("AQI cache ttl minutes", "60"))
    API_TIMEOUT_SECONDS = int(os.getenv("API timeout seconds", "5"))
    FALLBACK_TO_STATIC_AQI = os.getenv("FALLBACK_TO_STATIC_AQI", "True").lower() == "true"
    DEFAULT_STATIC_AQI = 50.0
    @classmethod
    def validate(cls) -> bool:
        if cls.AQI_CACHE_TTL_MINUTES < 1:
            print("ERROR: AQI_CACHE_TTL_MINUTES must be >= 1")
            return False
        return True
    
    @classmethod
    def print_config(cls):
        """Print current configuration"""
        print("\n" + "="*50)
        print("AQI Configuration (WAQI)")
        print("="*50)
        print(f"USE_REALTIME_AQI: {cls.USE_REALTIME_AQI}")
        print(f"WAQI_TOKEN: {cls.WAQI_TOKEN}")
        print(f"CACHE_DIR: {cls.AQI_CACHE_DIR}")
        print(f"CACHE_TTL: {cls.AQI_CACHE_TTL_MINUTES} min")
        print(f"FALLBACK_TO_STATIC: {cls.FALLBACK_TO_STATIC_AQI}")
        print(f"API_TIMEOUT: {cls.API_TIMEOUT_SECONDS}s")
        print("="*50 + "\n")
