from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
import re

router = APIRouter()

class SummaryResponse(BaseModel):
    summary: str
    key_findings: list[str]
    abnormalities: list[str]
    recommendations: str

@router.post("/summarize-report", response_model=SummaryResponse)
async def summarize_report(file: UploadFile = File(...)):
    """
    Mock AI Report Summarization
    In production, this would use OCR and an LLM (e.g., GPT-4 or Claude) to extract text and summarize medical reports.
    """
    # For demonstration, we'll return a mock summary based on the filename or generic text
    filename = file.filename.lower()
    
    if "blood" in filename or "cbc" in filename:
        return SummaryResponse(
            summary="The patient's Complete Blood Count (CBC) shows mild anemia but otherwise normal parameters. White blood cell count is within the normal range, indicating no active infection.",
            key_findings=["Hemoglobin: 11.2 g/dL (Slightly Low)", "WBC: 7.5 x 10^9/L (Normal)", "Platelets: 250 x 10^9/L (Normal)"],
            abnormalities=["Mild Anemia"],
            recommendations="Increase dietary iron intake. Follow up in 3 months with a repeat CBC."
        )
    elif "xray" in filename or "chest" in filename:
        return SummaryResponse(
            summary="Chest X-ray shows clear lung fields with no evidence of consolidation, effusion, or pneumothorax. Heart size is normal.",
            key_findings=["Clear lungs", "Normal heart size", "No acute cardiopulmonary abnormalities"],
            abnormalities=[],
            recommendations="No further radiological intervention needed at this time."
        )
    else:
        return SummaryResponse(
            summary="The medical report has been reviewed. Most parameters are within expected ranges with a few minor deviations.",
            key_findings=["Vitals stable", "General markers normal"],
            abnormalities=["Minor elevation in liver enzymes"],
            recommendations="Maintain a healthy diet and moderate exercise. Consult with primary care physician for routine follow-up."
        )
