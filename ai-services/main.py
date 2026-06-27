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
    return {"status": "healthy"}

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

    if file.filename.endswith(".pdf"):
        pdf_doc = fitz.open(stream=content, filetype="pdf")
        for page in pdf_doc:
            extracted_text += page.get_text()
        # If PDF has no text layer (scanned), OCR each page as image
        if not extracted_text.strip():
            for page in pdf_doc:
                pix = page.get_pixmap()
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                extracted_text += pytesseract.image_to_string(img)
    else:
        # Direct image OCR (JPG, PNG)
        img = Image.open(io.BytesIO(content))
        extracted_text = pytesseract.image_to_string(img)

    if not extracted_text.strip():
        raise HTTPException(status_code=422, 
                            detail="Could not extract text from document.")

    summary = summarizer_model.summarize(extracted_text)
    return {
        "summary": summary,
        "filename": file.filename,
        "characters_extracted": len(extracted_text)
    }

class VoiceCommandRequest(BaseModel):
    command: str
    role: str  # "doctor" | "admin" | "patient"

@app.post("/command")
async def voice_command(request: VoiceCommandRequest):
    command_lower = request.command.lower()

    # Intent routing — extend as needed
    if "appointment" in command_lower:
        intent = "VIEW_APPOINTMENTS"
    elif "patient" in command_lower:
        intent = "VIEW_PATIENTS"
    elif "bed" in command_lower:
        intent = "CHECK_BED_AVAILABILITY"
    elif "ambulance" in command_lower:
        intent = "DISPATCH_AMBULANCE"
    else:
        intent = "UNKNOWN"

    return {
        "command": request.command,
        "intent": intent,
        "action": f"Routing to: {intent}",
        "status": "processed"
    }

@app.get("/predictive")
async def predictive_analytics():
    # Simulated forecast — wire to real PostgreSQL data + model later
    return {
        "bed_forecast_48h": [
            {"ward": "ICU", "available": 3, "predicted_need": 5, 
             "risk": "HIGH"},
            {"ward": "General", "available": 22, "predicted_need": 18, 
             "risk": "LOW"},
            {"ward": "Emergency", "available": 8, "predicted_need": 9, 
             "risk": "MEDIUM"},
        ],
        "readmission_risk_patients": [
            {"patient_id": "P-1042", "risk_score": 0.87, 
             "reason": "Chronic cardiac history"},
            {"patient_id": "P-0391", "risk_score": 0.72, 
             "reason": "Post-surgery complications"},
        ],
        "generated_at": "real-time"
    }
