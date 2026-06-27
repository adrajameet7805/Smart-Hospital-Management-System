from fastapi import APIRouter
from pydantic import BaseModel
import random
import datetime

router = APIRouter()

class PredictiveAnalyticsResponse(BaseModel):
    predicted_admissions_next_7_days: list[int]
    high_demand_departments: list[str]
    bed_shortage_risk: str
    staffing_recommendation: str

@router.get("/predictive", response_model=PredictiveAnalyticsResponse)
async def get_predictive_analytics():
    """
    Mock Predictive Analytics
    In production, this would use historical data and time-series forecasting (ARIMA, Prophet, or LSTMs)
    to predict patient inflow and resource requirements.
    """
    # Generate mock predictions based on current date/time to simulate changing forecasts
    base_admissions = 40 + (datetime.datetime.now().weekday() * 2)
    predictions = [int(base_admissions + random.uniform(-10, 25)) for _ in range(7)]
    
    avg_predicted = sum(predictions) / len(predictions)
    
    if avg_predicted > 60:
        risk = "High"
        staffing = "Increase staffing in Emergency and Cardiology by 20% over the weekend."
        departments = ["Emergency", "Cardiology", "Pulmonology"]
    elif avg_predicted > 45:
        risk = "Moderate"
        staffing = "Standard staffing levels adequate. Monitor Emergency department."
        departments = ["Emergency", "General Medicine"]
    else:
        risk = "Low"
        staffing = "Standard staffing levels adequate."
        departments = ["General Medicine"]
        
    return PredictiveAnalyticsResponse(
        predicted_admissions_next_7_days=predictions,
        high_demand_departments=departments,
        bed_shortage_risk=risk,
        staffing_recommendation=staffing
    )
