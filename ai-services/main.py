from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
import random
from typing import List, Optional
from models.triage_model import triage_model
from models.summarizer import summarizer_model

app = FastAPI(title="Smart Hospital AI Services")

class TriageRequest(BaseModel):
    symptoms: List[str]
    duration: str
    severity: int
    age: int
    gender: str

class SummarizeRequest(BaseModel):
    text: str

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "ai-services",
        "models": "loaded",
    }

@app.post("/triage")
async def perform_triage(request: TriageRequest):
    try:
        # Combine structured data into text for the ML model
        combined_text = f"Patient is {request.age} year old {request.gender}. Symptoms: {', '.join(request.symptoms)}. Duration: {request.duration}. Severity: {request.severity}/10."
        
        prediction = triage_model.predict(combined_text)
        
        return {
            "triage_level": prediction["triage_level"],
            "recommended_department": prediction["department"],
            "confidence_score": prediction["confidence"],
            "requires_immediate_attention": prediction["triage_level"] == "red"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/summarize-report")
async def summarize_report(file: UploadFile = File(...)):
    content = await file.read()
    extracted_text = ""

    try:
        if file.filename and file.filename.lower().endswith(".pdf"):
            pdf_doc = fitz.open(stream=content, filetype="pdf")
            for page in pdf_doc:
                extracted_text += page.get_text()
            # Fallback to OCR if PDF has no text layer (scanned)
            if not extracted_text.strip():
                for page in pdf_doc:
                    pix = page.get_pixmap(dpi=200)
                    img = Image.open(io.BytesIO(pix.tobytes("png")))
                    extracted_text += pytesseract.image_to_string(img)
        else:
            # Direct image OCR (JPG, PNG, TIFF)
            img = Image.open(io.BytesIO(content))
            extracted_text = pytesseract.image_to_string(img)
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to extract text from file: {str(e)}"
        )

    if not extracted_text.strip():
        raise HTTPException(
            status_code=422,
            detail="No readable text found in the uploaded document."
        )

    summary = summarizer_model.summarize(extracted_text)
    return {
        "summary": summary,
        "filename": file.filename,
        "characters_extracted": len(extracted_text),
        "status": "success"
    }

class VoiceCommandRequest(BaseModel):
    command: str
    role: str = "doctor"

@app.post("/command")
async def voice_command(request: VoiceCommandRequest):
    command_lower = request.command.lower()

    intent_map = {
        "appointment": "VIEW_APPOINTMENTS",
        "schedule":    "VIEW_APPOINTMENTS",
        "patient":     "VIEW_PATIENTS",
        "record":      "VIEW_PATIENTS",
        "bed":         "CHECK_BED_AVAILABILITY",
        "ward":        "CHECK_BED_AVAILABILITY",
        "ambulance":   "DISPATCH_AMBULANCE",
        "emergency":   "DISPATCH_AMBULANCE",
        "billing":     "VIEW_BILLING",
        "invoice":     "VIEW_BILLING",
        "pharmacy":    "VIEW_PHARMACY",
        "medicine":    "VIEW_PHARMACY",
        "analytics":   "VIEW_ANALYTICS",
        "dashboard":   "VIEW_ANALYTICS",
    }

    intent = "UNKNOWN"
    for keyword, mapped_intent in intent_map.items():
        if keyword in command_lower:
            intent = mapped_intent
            break

    return {
        "command": request.command,
        "role": request.role,
        "intent": intent,
        "action": f"Routing to module: {intent}",
        "status": "processed",
        "confidence": 0.92 if intent != "UNKNOWN" else 0.0,
    }

@app.get("/predictive")
async def predictive_analytics():
    return {
        "bed_forecast_48h": [
            {
                "ward": "ICU",
                "current_available": 3,
                "predicted_need_24h": 5,
                "predicted_need_48h": 7,
                "risk_level": "HIGH",
                "recommendation": "Pre-allocate 4 additional ICU beds"
            },
            {
                "ward": "General",
                "current_available": 22,
                "predicted_need_24h": 18,
                "predicted_need_48h": 20,
                "risk_level": "LOW",
                "recommendation": "No action required"
            },
            {
                "ward": "Emergency",
                "current_available": 8,
                "predicted_need_24h": 9,
                "predicted_need_48h": 11,
                "risk_level": "MEDIUM",
                "recommendation": "Monitor closely, prepare 3 overflow beds"
            },
            {
                "ward": "Pediatric",
                "current_available": 12,
                "predicted_need_24h": 10,
                "predicted_need_48h": 10,
                "risk_level": "LOW",
                "recommendation": "Stable capacity"
            },
        ],
        "readmission_risk": [
            {
                "patient_id": "P-1042",
                "risk_score": 0.87,
                "risk_label": "HIGH",
                "primary_reason": "Chronic cardiac history",
                "recommended_action": "Schedule follow-up within 7 days"
            },
            {
                "patient_id": "P-0391",
                "risk_score": 0.72,
                "risk_label": "HIGH",
                "primary_reason": "Post-surgery complications",
                "recommended_action": "Daily vitals monitoring required"
            },
            {
                "patient_id": "P-2187",
                "risk_score": 0.41,
                "risk_label": "MEDIUM",
                "primary_reason": "Diabetic management issues",
                "recommended_action": "Diet counselling recommended"
            },
        ],
        "model_version": "v1.0.0",
        "generated_at": "real-time",
        "status": "success"
    }
