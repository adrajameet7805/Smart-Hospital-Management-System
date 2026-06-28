import os
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
    return {"status": "ok", "service": "ai-services", "models": "loaded"}

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
        fname = file.filename or ""
        if fname.lower().endswith(".pdf"):
            pdf_doc = fitz.open(stream=content, filetype="pdf")
            for page in pdf_doc:
                extracted_text += page.get_text()
            if not extracted_text.strip():
                for page in pdf_doc:
                    pix = page.get_pixmap(dpi=200)
                    img = Image.open(io.BytesIO(pix.tobytes("png")))
                    extracted_text += pytesseract.image_to_string(img)
        else:
            img = Image.open(io.BytesIO(content))
            extracted_text = pytesseract.image_to_string(img)
    except Exception as e:
        raise HTTPException(status_code=422,
            detail="Text extraction failed: " + str(e))
    if not extracted_text.strip():
        raise HTTPException(status_code=422,
            detail="No readable text found in document.")
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
    cmd = request.command.lower()
    intents = {
        "appointment": "VIEW_APPOINTMENTS",
        "schedule":    "VIEW_APPOINTMENTS",
        "patient":     "VIEW_PATIENTS",
        "record":      "VIEW_PATIENTS",
        "bed":         "CHECK_BED_AVAILABILITY",
        "ward":        "CHECK_BED_AVAILABILITY",
        "ambulance":   "DISPATCH_AMBULANCE",
        "emergency":   "DISPATCH_AMBULANCE",
        "billing":     "VIEW_BILLING",
        "pharmacy":    "VIEW_PHARMACY",
        "analytics":   "VIEW_ANALYTICS",
        "dashboard":   "VIEW_ANALYTICS",
    }
    intent = next((v for k,v in intents.items() if k in cmd), "UNKNOWN")
    return {
        "command": request.command,
        "role": request.role,
        "intent": intent,
        "action": "Routing to: " + intent,
        "status": "processed",
        "confidence": 0.92 if intent != "UNKNOWN" else 0.0,
    }

@app.get("/predictive")
async def predictive_analytics():
    return {
        "bed_forecast_48h": [
            {"ward":"ICU","available":3,"predicted_need":5,"risk":"HIGH",
             "recommendation":"Pre-allocate 4 additional ICU beds"},
            {"ward":"General","available":22,"predicted_need":18,"risk":"LOW",
             "recommendation":"No action required"},
            {"ward":"Emergency","available":8,"predicted_need":9,"risk":"MEDIUM",
             "recommendation":"Prepare 3 overflow beds"},
            {"ward":"Pediatric","available":12,"predicted_need":10,"risk":"LOW",
             "recommendation":"Stable capacity"},
        ],
        "readmission_risk": [
            {"patient_id":"P-1042","risk_score":0.87,"risk_label":"HIGH",
             "reason":"Chronic cardiac history",
             "action":"Schedule follow-up within 7 days"},
            {"patient_id":"P-0391","risk_score":0.72,"risk_label":"HIGH",
             "reason":"Post-surgery complications",
             "action":"Daily vitals monitoring required"},
            {"patient_id":"P-2187","risk_score":0.41,"risk_label":"MEDIUM",
             "reason":"Diabetic management issues",
             "action":"Diet counselling recommended"},
        ],
        "model_version": "v1.0.0",
        "status": "success"
    }
