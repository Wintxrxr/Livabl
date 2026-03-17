from typing import Dict, Any


def calculate_score(ward: Dict[str, Any]) -> float:
    """Calculate a simple livability score from ward metric values.
    Expects keys: healthcare, education, connectivity, environment, civic, sentiment.
    """
    keys = ["healthcare", "education", "connectivity", "environment", "civic", "sentiment"]
    values = [float(ward.get(k, 0)) for k in keys]
    if not values:
        return 0.0
    return sum(values) / len(values)
