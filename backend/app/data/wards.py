wards = [
    {
        "id": 1,
        "name": "South Delhi",
        "city": "Delhi",
        "healthcare": 80,
        "education": 75,
        "connectivity": 85,
        "environment": 60,
        "civic": 65,
        "sentiment": 70
    },
    {
        "id": 2,
        "name": "North Delhi",
        "city": "Delhi",
        "healthcare": 70,
        "education": 72,
        "connectivity": 68,
        "environment": 65,
        "civic": 60,
        "sentiment": 62
    }
]


def get_all_wards():
    return wards


def get_ward_by_id(ward_id: int):
    for ward in wards:
        if ward["id"] == ward_id:
            return ward
    return None
def compare_wards(id1: int, id2: int):
    w1 = get_ward_by_id(id1)
    w2 = get_ward_by_id(id2)
    return {"ward 1": w1, "ward 2": w2}
