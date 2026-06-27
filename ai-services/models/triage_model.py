import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
import pickle
import os

class TriageModel:
    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(__file__), 'triage_rf.pkl')
        self.pipeline = None
        self._load_or_train_model()

    def _load_or_train_model(self):
        if os.path.exists(self.model_path):
            with open(self.model_path, 'rb') as f:
                self.pipeline = pickle.load(f)
        else:
            # Dummy training data for demonstration if no model file exists
            data = pd.DataFrame({
                'symptoms': [
                    'severe chest pain radiating to left arm, shortness of breath, sweating',
                    'mild headache for 2 hours, took paracetamol',
                    'fever 102F, severe cough, difficulty breathing, blue lips',
                    'itchy rash on arm, no other symptoms',
                    'sudden weakness on one side, slurred speech, facial drooping'
                ],
                'triage_level': ['red', 'green', 'red', 'green', 'red'],
                'department': ['Cardiology', 'General Medicine', 'Pulmonology', 'Dermatology', 'Neurology']
            })
            
            self.pipeline = Pipeline([
                ('tfidf', TfidfVectorizer(stop_words='english')),
                ('clf', RandomForestClassifier(n_estimators=100, random_state=42))
            ])
            
            # Train the model
            X = data['symptoms']
            y = list(zip(data['triage_level'], data['department']))
            # We need to flatten or train separate models, but for simplicity we'll just predict strings
            y_str = [f"{lvl}|{dep}" for lvl, dep in y]
            self.pipeline.fit(X, y_str)
            
            # Save the model
            with open(self.model_path, 'wb') as f:
                pickle.dump(self.pipeline, f)

    def predict(self, symptoms_text: str):
        prediction = self.pipeline.predict([symptoms_text])[0]
        triage_level, department = prediction.split('|')
        
        # Calculate a pseudo-confidence score from probabilities
        probs = self.pipeline.predict_proba([symptoms_text])[0]
        confidence = float(max(probs))
        
        return {
            "triage_level": triage_level,
            "department": department,
            "confidence": confidence
        }

triage_model = TriageModel()
