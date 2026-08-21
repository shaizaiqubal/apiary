HARDINESS_ORDER = ["H1a", "H1b", "H1c", "H2", "H3", "H4", "H5", "H6", "H7"]

BUCKET_MIN_HARDINESS = {
    "mild_sw": "H3",
    "south": "H4",
    "central": "H5",
    "north": "H6",
}


def get_region_bucket(lat: float) -> str:
    if lat < 50.5:
        return "mild_sw"
    elif lat < 52.5:
        return "south"
    elif lat < 55.0:
        return "central"
    else:
        return "north"


def hardiness_meets_bucket(plant_hardiness: str, bucket: str) -> bool:
    #True if a plant's H-rating is hardy enough to survive this bucket's winter minimum.
    if not plant_hardiness:
        return False
    required = BUCKET_MIN_HARDINESS[bucket]
    try:
        return HARDINESS_ORDER.index(plant_hardiness) >= HARDINESS_ORDER.index(required)
    except ValueError:
        return False
