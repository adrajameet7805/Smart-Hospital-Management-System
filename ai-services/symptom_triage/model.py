"""
AI Symptom Triage Model
Uses a symptom-disease mapping dataset for prediction.
In production, this would use a trained ML model (Random Forest / Neural Network).
"""

from typing import List, Optional

# Comprehensive symptom-disease mapping
DISEASE_DATABASE = {
    "Common Cold": {
        "symptoms": ["runny_nose", "sneezing", "sore_throat", "cough", "mild_fever", "congestion", "headache"],
        "severity": "Low",
        "severity_score": 1,
        "specialist": "General Physician",
        "advice": "Rest, stay hydrated, and take OTC cold medicine. See a doctor if symptoms persist beyond 10 days."
    },
    "Influenza (Flu)": {
        "symptoms": ["fever", "cough", "fatigue", "body_ache", "headache", "chills", "sore_throat", "runny_nose"],
        "severity": "Moderate",
        "severity_score": 3,
        "specialist": "General Physician",
        "advice": "Rest, drink plenty of fluids. Antiviral medications are most effective within 48 hours of symptom onset."
    },
    "COVID-19": {
        "symptoms": ["fever", "cough", "fatigue", "loss_of_taste", "loss_of_smell", "shortness_of_breath", "body_ache", "sore_throat", "headache"],
        "severity": "Moderate",
        "severity_score": 3,
        "specialist": "Pulmonologist",
        "advice": "Isolate immediately, get tested, monitor oxygen levels. Seek emergency care if breathing becomes difficult."
    },
    "Migraine": {
        "symptoms": ["severe_headache", "headache", "nausea", "sensitivity_to_light", "sensitivity_to_sound", "vomiting", "blurred_vision"],
        "severity": "Moderate",
        "severity_score": 3,
        "specialist": "Neurologist",
        "advice": "Rest in a dark, quiet room. Take prescribed migraine medication. Keep a headache diary to identify triggers."
    },
    "Hypertension": {
        "symptoms": ["headache", "dizziness", "blurred_vision", "nosebleed", "shortness_of_breath", "chest_pain"],
        "severity": "High",
        "severity_score": 4,
        "specialist": "Cardiologist",
        "advice": "Monitor blood pressure regularly. Reduce salt intake, exercise, and take prescribed medications."
    },
    "Diabetes Type 2": {
        "symptoms": ["frequent_urination", "excessive_thirst", "fatigue", "blurred_vision", "slow_healing", "weight_loss", "tingling_hands"],
        "severity": "High",
        "severity_score": 4,
        "specialist": "Endocrinologist",
        "advice": "Monitor blood sugar levels, follow a balanced diet, exercise regularly, and take prescribed medications."
    },
    "Pneumonia": {
        "symptoms": ["fever", "cough", "shortness_of_breath", "chest_pain", "fatigue", "chills", "phlegm"],
        "severity": "High",
        "severity_score": 4,
        "specialist": "Pulmonologist",
        "advice": "Seek medical attention immediately. Antibiotics may be needed. Rest and stay hydrated."
    },
    "Asthma": {
        "symptoms": ["shortness_of_breath", "wheezing", "cough", "chest_tightness", "difficulty_breathing"],
        "severity": "Moderate",
        "severity_score": 3,
        "specialist": "Pulmonologist",
        "advice": "Use prescribed inhalers, avoid triggers, and have an asthma action plan."
    },
    "Gastroenteritis": {
        "symptoms": ["diarrhea", "nausea", "vomiting", "stomach_pain", "fever", "dehydration", "cramps"],
        "severity": "Moderate",
        "severity_score": 2,
        "specialist": "Gastroenterologist",
        "advice": "Stay hydrated with ORS, eat bland foods. See a doctor if symptoms persist beyond 3 days."
    },
    "Urinary Tract Infection": {
        "symptoms": ["frequent_urination", "burning_urination", "cloudy_urine", "pelvic_pain", "blood_in_urine", "strong_urine_odor"],
        "severity": "Moderate",
        "severity_score": 2,
        "specialist": "Urologist",
        "advice": "Drink plenty of water. Antibiotics are usually needed. Complete the full course of medication."
    },
    "Dengue Fever": {
        "symptoms": ["high_fever", "fever", "severe_headache", "pain_behind_eyes", "joint_pain", "body_ache", "rash", "nausea"],
        "severity": "High",
        "severity_score": 4,
        "specialist": "Infectious Disease Specialist",
        "advice": "Stay hydrated, monitor platelet count. Seek emergency care if bleeding occurs or platelets drop significantly."
    },
    "Heart Attack": {
        "symptoms": ["chest_pain", "shortness_of_breath", "left_arm_pain", "jaw_pain", "sweating", "nausea", "dizziness"],
        "severity": "Critical",
        "severity_score": 5,
        "specialist": "Cardiologist",
        "advice": "EMERGENCY: Call ambulance immediately! Chew aspirin if not allergic. Do not drive yourself to the hospital."
    },
    "Stroke": {
        "symptoms": ["sudden_numbness", "confusion", "difficulty_speaking", "severe_headache", "vision_problems", "dizziness", "loss_of_balance"],
        "severity": "Critical",
        "severity_score": 5,
        "specialist": "Neurologist",
        "advice": "EMERGENCY: Call ambulance immediately! Remember FAST - Face drooping, Arm weakness, Speech difficulty, Time to call."
    },
    "Allergic Rhinitis": {
        "symptoms": ["sneezing", "runny_nose", "itchy_eyes", "congestion", "watery_eyes", "itchy_nose"],
        "severity": "Low",
        "severity_score": 1,
        "specialist": "Allergist",
        "advice": "Avoid allergens, use antihistamines. Consider allergy testing for long-term management."
    },
    "Thyroid Disorder": {
        "symptoms": ["fatigue", "weight_gain", "weight_loss", "hair_loss", "sensitivity_to_cold", "dry_skin", "depression", "anxiety"],
        "severity": "Moderate",
        "severity_score": 3,
        "specialist": "Endocrinologist",
        "advice": "Get thyroid function tests (TSH, T3, T4). Treatment with medication is usually very effective."
    },
    "Anemia": {
        "symptoms": ["fatigue", "weakness", "pale_skin", "shortness_of_breath", "dizziness", "cold_hands", "headache"],
        "severity": "Moderate",
        "severity_score": 2,
        "specialist": "Hematologist",
        "advice": "Get a complete blood count test. Iron supplements and dietary changes may be recommended."
    },
    "Depression": {
        "symptoms": ["persistent_sadness", "loss_of_interest", "fatigue", "sleep_changes", "appetite_changes", "difficulty_concentrating", "hopelessness"],
        "severity": "Moderate",
        "severity_score": 3,
        "specialist": "Psychiatrist",
        "advice": "Seek professional help. Therapy and/or medication can be very effective. You are not alone."
    },
    "Conjunctivitis (Pink Eye)": {
        "symptoms": ["red_eyes", "itchy_eyes", "watery_eyes", "eye_discharge", "swollen_eyelids"],
        "severity": "Low",
        "severity_score": 1,
        "specialist": "Ophthalmologist",
        "advice": "Avoid touching eyes, practice good hygiene. Antibiotic drops may be needed for bacterial conjunctivitis."
    },
    "Kidney Stones": {
        "symptoms": ["severe_back_pain", "lower_back_pain", "blood_in_urine", "nausea", "vomiting", "frequent_urination", "burning_urination"],
        "severity": "High",
        "severity_score": 4,
        "specialist": "Urologist",
        "advice": "Drink plenty of water. Pain management may be needed. Large stones may require medical intervention."
    },
    "Malaria": {
        "symptoms": ["high_fever", "fever", "chills", "sweating", "headache", "nausea", "vomiting", "body_ache"],
        "severity": "High",
        "severity_score": 4,
        "specialist": "Infectious Disease Specialist",
        "advice": "Seek immediate medical attention. Antimalarial drugs are essential. Complete the full course of treatment."
    },
}

# Synonym mapping
SYMPTOM_SYNONYMS = {
    "headache": ["headache", "head_pain", "head_ache", "migraine"],
    "severe_headache": ["severe_headache", "terrible_headache", "worst_headache"],
    "fever": ["fever", "temperature", "high_temperature", "pyrexia", "mild_fever", "high_fever"],
    "cough": ["cough", "coughing", "dry_cough", "wet_cough"],
    "fatigue": ["fatigue", "tiredness", "tired", "exhaustion", "weakness", "lethargy"],
    "body_ache": ["body_ache", "body_pain", "muscle_pain", "muscle_ache", "joint_pain"],
    "nausea": ["nausea", "nauseous", "feel_sick", "queasy"],
    "vomiting": ["vomiting", "throwing_up", "emesis"],
    "diarrhea": ["diarrhea", "loose_stools", "loose_motion"],
    "shortness_of_breath": ["shortness_of_breath", "breathlessness", "difficulty_breathing", "dyspnea"],
    "chest_pain": ["chest_pain", "chest_tightness", "chest_discomfort"],
    "dizziness": ["dizziness", "lightheaded", "vertigo", "feeling_faint"],
    "sore_throat": ["sore_throat", "throat_pain", "painful_throat"],
    "runny_nose": ["runny_nose", "nasal_discharge", "stuffy_nose", "congestion"],
    "stomach_pain": ["stomach_pain", "abdominal_pain", "belly_pain", "cramps"],
    "rash": ["rash", "skin_rash", "hives", "red_spots"],
    "blurred_vision": ["blurred_vision", "vision_problems", "blurry_vision"],
    "weight_loss": ["weight_loss", "losing_weight", "unexplained_weight_loss"],
    "weight_gain": ["weight_gain", "gaining_weight"],
}


def normalize_symptom(symptom: str) -> str:
    """Normalize a symptom string to a standard form"""
    symptom = symptom.lower().strip().replace(" ", "_").replace("-", "_")
    for standard, synonyms in SYMPTOM_SYNONYMS.items():
        if symptom in synonyms:
            return standard
    return symptom


def predict_diseases(symptoms: List[str], age: Optional[int] = None, gender: Optional[str] = None) -> List[dict]:
    """
    Predict possible diseases based on symptoms using weighted matching.
    Returns a sorted list of disease predictions with confidence scores.
    """
    normalized = [normalize_symptom(s) for s in symptoms]
    results = []

    for disease_name, disease_info in DISEASE_DATABASE.items():
        disease_symptoms = set(disease_info["symptoms"])
        input_symptoms = set(normalized)
        
        # Calculate matching
        matched = disease_symptoms & input_symptoms
        
        if len(matched) == 0:
            continue
        
        # Confidence = weighted combination of precision and recall
        recall = len(matched) / len(disease_symptoms)      # How many disease symptoms were found
        precision = len(matched) / len(input_symptoms)      # How many input symptoms matched
        
        # F1-like score
        if recall + precision > 0:
            confidence = 2 * (precision * recall) / (precision + recall)
        else:
            confidence = 0
        
        # Boost for more matches
        confidence = min(confidence * (1 + len(matched) * 0.1), 0.99)
        
        # Age-based adjustments
        if age:
            if disease_name == "Heart Attack" and age < 30:
                confidence *= 0.3
            if disease_name == "Diabetes Type 2" and age < 20:
                confidence *= 0.5
            if disease_name == "Stroke" and age < 40:
                confidence *= 0.4
        
        results.append({
            "disease": disease_name,
            "confidence": round(confidence * 100, 1),
            "severity": disease_info["severity"],
            "severity_score": disease_info["severity_score"],
            "specialist": disease_info["specialist"],
            "matched_symptoms": list(matched),
            "advice": disease_info["advice"]
        })
    
    # Sort by confidence descending
    results.sort(key=lambda x: x["confidence"], reverse=True)
    
    # If no matches, return general advice
    if not results:
        results.append({
            "disease": "Unspecified Condition",
            "confidence": 0,
            "severity": "Unknown",
            "severity_score": 2,
            "specialist": "General Physician",
            "matched_symptoms": [],
            "advice": "Your symptoms don't match a specific condition in our database. Please consult a General Physician for proper diagnosis."
        })
    
    return results
