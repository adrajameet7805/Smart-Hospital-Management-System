import os

class MedicalSummarizer:
    def __init__(self):
        self.summarizer = None
        self.use_mock = os.environ.get("USE_MOCK_MODELS", "true").lower() == "true"
        
        if not self.use_mock:
            try:
                # Lazy import to save memory if using mock
                from transformers import pipeline
                # Use a small distilbart model for medical text summarization
                self.summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
            except Exception as e:
                print(f"Failed to load transformers model, falling back to mock: {e}")
                self.use_mock = True

    def summarize(self, text: str) -> str:
        if not text or len(text) < 50:
            return text
            
        if self.use_mock:
            # Simple extractive heuristic if real model is disabled
            sentences = text.split('.')
            if len(sentences) > 3:
                return '. '.join(sentences[:2]) + '.'
            return text
            
        try:
            # Generate actual summary via Transformers
            max_len = min(130, max(30, int(len(text.split()) * 0.6)))
            summary = self.summarizer(text, max_length=max_len, min_length=30, do_sample=False)
            return summary[0]['summary_text']
        except Exception as e:
            print(f"Summarization error: {e}")
            return text

summarizer_model = MedicalSummarizer()
