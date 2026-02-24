from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import os
import logging

app = FastAPI(title="Navi Mumbai House Price Prediction API", version="1.0.0")

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "*" # For deployment, ideally restrict this to the frontend domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PropertyData(BaseModel):
    """
    Pydantic model representing the expected features for a house price prediction.
    """
    location: str = Field(..., alias="Location")
    area_sqft: float = Field(..., alias="Area_sqft", gt=100)
    bhk: int = Field(..., alias="BHK", gt=0)
    bathrooms: float = Field(..., alias="Bathrooms", ge=0)
    floor: float = Field(..., alias="Floor", ge=0)
    total_floors: float = Field(..., alias="Total_Floors", gt=0)
    age_of_property: float = Field(..., alias="Age_of_Property", ge=0)
    parking: int = Field(..., alias="Parking", ge=0, le=1)
    lift: int = Field(..., alias="Lift", ge=0, le=1)
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "Location": "Kharghar",
                "Area_sqft": 1000.0,
                "BHK": 2,
                "Bathrooms": 2.0,
                "Floor": 5,
                "Total_Floors": 15,
                "Age_of_Property": 5.0,
                "Parking": 1,
                "Lift": 1
            }
        }

class PredictionResponse(BaseModel):
    """
    Pydantic model representing the response format for the prediction.
    """
    predicted_price_inr: float

def load_model():
    """Load the trained machine learning pipeline."""
    model_path = os.path.join(os.path.dirname(__file__), "models", "house_price_pipeline.joblib")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}")
    return joblib.load(model_path)

try:
    model_pipeline = load_model()
    logger.info("Machine learning model loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load model: {e}")
    model_pipeline = None

@app.post("/predict", response_model=PredictionResponse)
async def predict_price(data: PropertyData):
    """
    Predict the price of a house in Navi Mumbai based on its features.

    Args:
        data (PropertyData): The property features required by the model.

    Returns:
        PredictionResponse: Discovered predicted price.
    """
    if model_pipeline is None:
        raise HTTPException(status_code=503, detail="Machine learning model is not available.")
    
    try:
        # Convert input to DataFrame as expected by the pipeline
        input_data = pd.DataFrame([{
            "Location": data.location.strip().title(),
            "Area_sqft": data.area_sqft,
            "BHK": data.bhk,
            "Bathrooms": data.bathrooms,
            "Floor": data.floor,
            "Total_Floors": data.total_floors,
            "Age_of_Property": data.age_of_property,
            "Parking": data.parking,
            "Lift": data.lift
        }])
        
        prediction = model_pipeline.predict(input_data)[0]
        return PredictionResponse(predicted_price_inr=round(prediction, 2))
    
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during prediction.")

@app.get("/health")
async def health_check():
    """Endpoint to check the health of the API."""
    return {"status": "healthy", "model_loaded": model_pipeline is not None}
