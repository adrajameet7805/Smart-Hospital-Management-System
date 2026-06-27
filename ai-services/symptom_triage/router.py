from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from .model import predict_diseases

router = APIRouter()

class TriageRequest(BaseModel):
    symptoms: List[str]
    age: Optional[int] = None
    gender: Optional[str] = None

class DiseaseResult(BaseModel):
    disease: str
    confidence: float
    severity: str
    specialist: str

class TriageResponse(BaseModel):
    possible_diseases: List[DiseaseResult]
    severity_score: int
    recommended_specialist: str
    urgency: str
    advice: str

@router.post("/triage", response_model=TriageResponse)
async def symptom_triage(request: TriageRequest):
    """AI Symptom Triage - Predicts possible diseases based on symptoms"""
    results = predict_diseases(request.symptoms, request.age, request.gender)
    
    # Determine overall severity
    max_severity = max((r["severity_score"] for r in results), default=3)
    urgency_map = {1: "Low", 2: "Low", 3: "Moderate", 4: "High", 5: "Critical"}
    
    return TriageResponse(
        possible_diseases=[
            DiseaseResult(
                disease=r["disease"],
                confidence=r["confidence"],
                severity=r["severity"],
                specialist=r["specialist"]
            ) for r in results[:5]
        ],
        severity_score=max_severity,
        recommended_specialist=results[0]["specialist"] if results else "General Physician",
        urgency=urgency_map.get(max_severity, "Moderate"),
        advice=results[0].get("advice", "Please consult a physician for proper diagnosis.") if results else "Please consult a physician."
    )
