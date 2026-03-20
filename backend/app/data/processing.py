import logging
from typing import Dict, List, Any, Optional

try:
    from schemas import WardScore, Ward
except ImportError:
    print("Warning: schemas.py not found in same directory")
logger = logging.getLogger(__name__)
class ProcessingError(Exception):
    """Custom exception for processing errors"""
    pass

def parse_features(geojson_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    try:
        logger.info("Parsing features from GeoJSON...")

        if not isinstance(geojson_data, dict):
            raise ProcessingError("Input must be a dictionary")
        if "features" not in geojson_data:
            raise ProcessingError("GeoJSON does not contain 'features' array")
        features = geojson_data["features"]
        if not isinstance(features, list):
            raise ProcessingError(f"'features' must be an array, got {type(features)}")
        if len(features) == 0:
            logger.warning("GeoJSON has empty features array")
        logger.info(f"✓ Parsed {len(features)} features from GeoJSON")
        return features
        
    except ProcessingError:
        raise
    except Exception as e:
        logger.error(f"Error parsing features: {e}")
        raise ProcessingError(f"Failed to parse features: {e}") from e

def validate_features(features: List[Dict[str, Any]]) -> Dict[str, Any]:
    valid_count = 0
    invalid_count = 0
    errors = []
    logger.info(f"Validating {len(features)} features...")
    for i, feature in enumerate(features):
        try:
            if not isinstance(feature, dict):
                errors.append(f"Feature {i}: Not a dictionary")
                invalid_count += 1
                continue

            if feature.get("type") != "Feature":
                errors.append(f"Feature {i}: Invalid type '{feature.get('type')}'")
                invalid_count += 1
                continue

            if "properties" not in feature:
                errors.append(f"Feature {i}: Missing 'properties'")
                invalid_count += 1
                continue

            if "geometry" not in feature:
                errors.append(f"Feature {i}: Missing 'geometry'")
                invalid_count += 1
                continue
            valid_count += 1 
        except Exception as e:
            errors.append(f"Feature {i}: {str(e)}")
            invalid_count += 1
    result = {
        "total_count": len(features),
        "valid_count": valid_count,
        "invalid_count": invalid_count,
        "errors": errors[:10]
    }
    logger.info(f"Validation: {valid_count} valid, {invalid_count} invalid")
    return result

def filter_valid_features(features: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    valid_features = []
    invalid_count = 0
    for i, feature in enumerate(features):
        try:
            if (isinstance(feature, dict) and
                feature.get("type") == "Feature" and
                "properties" in feature and
                "geometry" in feature):
                valid_features.append(feature)
            else:
                invalid_count += 1
        except Exception as e:
            logger.warning(f"Feature {i} validation failed: {e}")
            invalid_count += 1

    if invalid_count > 0:
        logger.info(f"Filtered out {invalid_count} invalid features")
    return valid_features

def get_feature_stats(features: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not features:
        return {
            "count": 0,
            "avg_properties": 0,
            "geometry_types": {}
        }
    total_properties = 0
    geometry_types = {}

    for feature in features:
        props = feature.get("properties", {})
        total_properties += len(props)
        
        geometry = feature.get("geometry", {})
        geom_type = geometry.get("type", "unknown")
        geometry_types[geom_type] = geometry_types.get(geom_type, 0) + 1

    return {
        "count": len(features),
        "avg_properties": round(total_properties / len(features), 2),
        "geometry_types": geometry_types,
        "total_properties": total_properties
    }

def parse_features_safe(geojson_data: Dict[str, Any], allow_empty: bool = True) -> List[Dict[str, Any]]:
    try:
        logger.info("Starting safe feature parsing...")
        features = parse_features(geojson_data)
        if not features and not allow_empty:
            raise ProcessingError("Feature list is empty")
        valid_features = filter_valid_features(features)

        if not valid_features and features:
            logger.warning("All features were invalid after filtering")
        logger.info(f"✓ Safe parse complete: {len(valid_features)} valid features")
        return valid_features

    except ProcessingError:
        raise
    except Exception as e:
        logger.error(f"Safe parse failed: {e}")
        raise ProcessingError(f"Failed to parse features safely: {e}") from e


def normalize_score(value: Any) -> Optional[float]:
    if value is None:
        return None

    try:
        score = float(value)
        if 0 <= score <= 1:
            normalized = score * 100
        else:
            normalized = max(0, min(100, score))

        return round(normalized, 2)
    except (ValueError, TypeError):
        logger.warning(f"Cannot convert '{value}' to float, returning None")
        return None

def extract_metric_breakdown(properties: Dict[str, Any]) -> WardScore:
    overall_score = normalize_score(properties.get("livability_score"))
    if overall_score is None:
        raise ProcessingError(
            "Feature missing required 'livability_score' field"
        )
    return WardScore(
        overall_score=overall_score,
        healthcare_access=normalize_score(properties.get("hospital_score")),
        education_access=normalize_score(properties.get("school_score")),
        environment=normalize_score(properties.get("pollution_score")),  # Lower is better
        connectivity=None,  # Not available in your data
        civic_responsiveness=None,  # Not available
        community_sentiment=None  # Not available
    )

def extract_ward_features(feature: Dict[str, Any]) -> Ward:
    try:
        properties = feature.get("properties", {})
        ward_id = properties.get("ward_id")
        if ward_id is None:
            raise ProcessingError("Feature missing 'ward_id' in properties")
        name = properties.get("Ward_Name")
        if not name:
            raise ProcessingError(f"Feature {ward_id} missing 'Ward_Name' in properties")

        geometry = feature.get("geometry")
        if not geometry:
            raise ProcessingError(f"Feature {ward_id} missing 'geometry'")

        logger.debug(f"Extracting metrics for ward: {ward_id} - {name}")
        scores = extract_metric_breakdown(properties)

        ward = Ward(
            id=str(ward_id),
            name=str(name),
            scores=scores,
            geometry=geometry
        )

        logger.debug(f"✓ Extracted ward: {ward_id} - {name} (Score: {scores.overall_score})")
        return ward

    except ProcessingError:
        raise
    except Exception as e:
        logger.error(f"Error extracting feature: {e}")
        raise ProcessingError(f"Failed to extract feature: {e}") from e

def transform_features_to_wards(features: List[Dict[str, Any]]) -> List[Ward]:
    wards = []
    skipped = 0
    logger.info(f"Transforming {len(features)} features to Ward objects...")

    for i, feature in enumerate(features):
        try:
            ward = extract_ward_features(feature)
            wards.append(ward)
        except ProcessingError as e:
            skipped += 1
            if skipped <= 3:
                logger.warning(f"Skipped feature {i}: {e}")
    if skipped > 0:
        logger.info(f"✓ Transformed {len(wards)} features ({skipped} skipped)")
    else:
        logger.info(f"✓ Transformed {len(wards)} features (all valid)")
    return wards

def validate_ward_data(ward: Ward) -> Dict[str, Any]:
    issues = []

    if not ward.id or not isinstance(ward.id, str):
        issues.append("Invalid or missing ID")

    if not ward.name or not isinstance(ward.name, str):
        issues.append("Invalid or missing name")

    if ward.scores.overall_score is None:
        issues.append("Missing overall score")

    if not ward.geometry or not ward.geometry.get("type"):
        issues.append("Invalid or missing geometry")

    return {
        "is_valid": len(issues) == 0,
        "issues": issues
    }

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print("\n=== Testing Processing Module ===\n")
    try:
        from ingestion import load_geojson
        print("Step 1: Loading GeoJSON data...")
        data = load_geojson("wards_score.geojson")
        print(f"Loaded {len(data['features'])} features") 

        print("\nStep 2: Parsing features...")
        features = parse_features(data)
        print(f"Parsed {len(features)} features")

        print("\nStep 3: Validating features...")
        validation = validate_features(features)
        print(f"Valid: {validation['valid_count']}, Invalid: {validation['invalid_count']}")
        
        print("\nStep 4: Transforming to Ward objects...")
        wards = transform_features_to_wards(features)
        print(f"Transformed {len(wards)} wards")

        if wards:
            ward = wards[0]
            print(f"\nSample Ward:")
            print(f"ID: {ward.id}")
            print(f"Name: {ward.name}")
            print(f"Livability Score: {ward.scores.overall_score}/100")
            print(f"Hospital Score: {ward.scores.healthcare_access}/100")
            print(f"School Score: {ward.scores.education_access}/100")
            print(f"Pollution Score: {ward.scores.environment}/100")

        print("\nAll Tests Passed!")

    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
