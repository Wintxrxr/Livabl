import json
import logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional, Dict

logger = logging.getLogger(__name__)


class AQICache:

    def __init__(self, cache_dir: str = "/tmp/livabl_aqi_cache", ttl_minutes: int = 60):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.ttl = timedelta(minutes=ttl_minutes)
        logger.info(f"Cache initialized (TTL: {ttl_minutes} min)")

    def _get_cache_file(self, identifier: str) -> Path:
        safe_key = identifier.replace(" ", "_").replace(",", "_").replace(".", "_")
        return self.cache_dir / f"{safe_key}.json"

    def get(self, identifier: str) -> Optional[float]:
        try:
            cache_file = self._get_cache_file(identifier)
            if not cache_file.exists():
                return None

            with open(cache_file, 'r') as f:
                cached = json.load(f)
            timestamp = datetime.fromisoformat(cached['timestamp'])

            if datetime.now() - timestamp > self.ttl:
                cache_file.unlink()
                return None

            return cached['data']

        except Exception as e:
            logger.error(f"Cache read error: {e}")
            return None

    def set(self, identifier: str, data: float) -> bool:
        try:
            cache_file = self._get_cache_file(identifier)

            cache_data = {
                'timestamp': datetime.now().isoformat(),
                'data': data
            }

            with open(cache_file, 'w') as f:
                json.dump(cache_data, f)

            return True

        except Exception as e:
            logger.error(f"Cache write error: {e}")
            return False

    def delete(self, identifier: str) -> bool:
        try:
            cache_file = self._get_cache_file(identifier)
            if cache_file.exists():
                cache_file.unlink()
                return True
            return False
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False


    def clear_all(self) -> int:
        try:
            count = 0
            for cache_file in self.cache_dir.glob("*.json"):
                cache_file.unlink()
                count += 1
            logger.info(f"Cleared {count} cache files")
            return count

        except Exception as e:
            logger.error(f"Cache clear error: {e}")
            return 0
