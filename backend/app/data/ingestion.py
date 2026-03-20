import json
import logging
from pathlib import Path
from typing import Dict, Any

logger = logging.getLogger(__name__)

class DataLoadError(Exception):
    pass

class DataValidationError(Exception):
    pass

def get_data_path(filename: str, data_type: str = "processed") -> Path:
    
    if data_type not in ["processed", "raw"]:
        raise ValueError(f"data_type must be processed or raw, got '{data_type}'")
    app_dir = Path(__file__)
    backend_dir = app_dir.parent.parent.parent    #goes to backend/
    file_path = backend_dir/"data"/data_type/filename   #goes to backend/data/
    
    logger.debug(f"Looking for: {file_path}")
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
    logger.debug(f"Found: {file_path}")
    return file_path

def validate_geojson(data: Dict[str, Any]) -> bool:
    if not isinstance(data, dict):
        raise DataValidationError("GeoJSON must be a dictionary")
    
    if data.get("type") != "FeatureCollection":
        raise DataValidationError(f"Expected FeatureCollection, got {data.get('type')}")
    
    if "features" not in data:
        raise DataValidationError("'features' array missing")
    
    if not isinstance(data["features"], list):
        raise DataValidationError("'features' must be an array")
    logger.info(f"Valid GeoJSON with {len(data['features'])} features")
    return True

def load_geojson(filename: str = "wards_score.geojson", data_type: str = "processed") -> Dict[str, Any]:
    try:
        logger.info(f"Loading: {filename} from {data_type}/")
        file_path = get_data_path(filename, data_type)
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)   #parse json
        validate_geojson(data)
        file_size_mb = file_path.stat().st_size / (1024 * 1024)
        feature_count = len(data.get("features", []))
        logger.info(f"Loaded '{filename}': {feature_count} features ({file_size_mb:.2f} MB)")
        return data
        
    except FileNotFoundError as e:
        logger.error(f"File not found: {e}")
        raise DataLoadError(f"Cannot load: {e}") from e
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON: {e}")
        raise DataLoadError(f"Invalid JSON: {e}") from e
    except DataValidationError as e:
        logger.error(f"Validation failed: {e}")
        raise
    except Exception as e:
        logger.error(f"Error: {e}")
        raise DataLoadError(f"Error: {e}") from e

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    try:
        data = load_geojson("wards_score.geojson")
        print(f"Loaded {len(data['features'])} features")
    except Exception as e:
        print(f"Error: {e}")
