from dataclasses import dataclass

@dataclass
class RouteRule:
    department: str
    authority: str
    sla_hours: int

ROUTES = {
    "Pothole / Road Damage": RouteRule("Roads & Public Works", "Municipal Roads Department", 48),
    "Garbage / Waste": RouteRule("Solid Waste Management", "Municipal Sanitation Department", 24),
    "Streetlight": RouteRule("Electrical / Street Lighting", "Municipal Electrical Department", 48),
    "Water Leakage": RouteRule("Water Supply", "Municipal Water Department", 24),
    "Drainage / Sewage": RouteRule("Drainage & Sewerage", "Municipal Drainage Department", 24),
    "Other Civic Issue": RouteRule("General Civic Services", "Municipal Civic Helpdesk", 72),
}

KEYWORDS = {
    "Pothole / Road Damage": ["pothole", "road", "crater", "broken road", "road damage", "asphalt"],
    "Garbage / Waste": ["garbage", "waste", "trash", "dump", "litter", "rubbish"],
    "Streetlight": ["streetlight", "street light", "lamp", "light pole", "dark road"],
    "Water Leakage": ["water leak", "leakage", "leaking pipe", "pipeline leak", "water overflow"],
    "Drainage / Sewage": ["drain", "drainage", "sewage", "sewer", "blocked drain", "flooded drain"],
}
