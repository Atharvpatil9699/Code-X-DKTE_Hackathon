from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ComplaintCreate(BaseModel):
    citizen_name: str = Field(min_length=2, max_length=100)
    contact: str = Field(min_length=3, max_length=120)
    title: str = Field(min_length=3, max_length=160)
    description: str = Field(min_length=5, max_length=5000)
    address: str = Field(min_length=2, max_length=300)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    source: str = "text"

class StatusUpdate(BaseModel):
    status: str

class ComplaintResponse(BaseModel):
    complaint: Dict[str, Any]
    events: List[Dict[str, Any]]
