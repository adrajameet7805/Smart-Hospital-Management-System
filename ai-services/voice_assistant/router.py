from fastapi import APIRouter
from pydantic import BaseModel
import re

router = APIRouter()

class VoiceCommandRequest(BaseModel):
    text: str

class VoiceCommandResponse(BaseModel):
    intent: str
    action: str
    parameters: dict
    reply: str

@router.post("/command", response_model=VoiceCommandResponse)
async def process_voice_command(request: VoiceCommandRequest):
    """
    Mock NLP Voice Assistant
    In production, this would use a speech-to-text engine and NLP (like Dialogflow or Rasa) 
    to extract intents from doctor's voice commands.
    """
    text = request.text.lower()
    
    # Simple rule-based intent matching for demo
    if "schedule" in text or "appointment" in text:
        return VoiceCommandResponse(
            intent="schedule_appointment",
            action="open_appointment_modal",
            parameters={"context": text},
            reply="I can help you schedule an appointment. Opening the booking screen now."
        )
    elif "prescription" in text or "prescribe" in text:
        med_match = re.search(r'prescribe\s+(\w+)', text)
        med = med_match.group(1) if med_match else "medication"
        return VoiceCommandResponse(
            intent="create_prescription",
            action="draft_prescription",
            parameters={"medication": med},
            reply=f"Drafting a new prescription for {med}."
        )
    elif "patient" in text or "record" in text:
        return VoiceCommandResponse(
            intent="fetch_patient_record",
            action="search_patient",
            parameters={"query": text},
            reply="Looking up patient records."
        )
    else:
        return VoiceCommandResponse(
            intent="unknown",
            action="none",
            parameters={},
            reply="I'm not sure how to help with that. Try asking me to schedule an appointment or prescribe medication."
        )
