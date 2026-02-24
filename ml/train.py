import pandas as pd
import numpy as np
import re
import joblib
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import os

def clean_price(price_str):
    if pd.isna(price_str):
        return np.nan
    price_str = str(price_str).replace('INR', '').replace('₹', '').replace(',', '').strip()
    try:
        val = float(price_str)
        return val if val > 0 else np.nan
    except:
        return np.nan

def clean_bhk(bhk_str):
    if pd.isna(bhk_str):
        return np.nan
    match = re.search(r'(\d+)', str(bhk_str))
    if match:
        return float(match.group(1))
    return np.nan

def clean_floor(floor_str):
    if pd.isna(floor_str):
        return np.nan
    if str(floor_str).lower() == 'ground':
        return 0.0
    try:
        return float(floor_str)
    except:
        return np.nan

def clean_binary(val):
    if pd.isna(val):
        return np.nan
    return 1 if str(val).lower() == 'yes' else 0

def load_and_preprocess_data(filepath):
    df = pd.read_csv(filepath)
    
    # Clean Target variable
    df['Actual_Price'] = df['Actual_Price'].apply(clean_price)
    
    # Drop rows without target variable
    df = df.dropna(subset=['Actual_Price'])
    
    # Feature cleaning
    df['Location'] = df['Location'].fillna('Unknown').apply(lambda x: str(x).strip().title())
    df['Area_sqft'] = pd.to_numeric(df['Area_sqft'], errors='coerce')
    df['BHK'] = df['BHK'].apply(clean_bhk)
    df['Bathrooms'] = pd.to_numeric(df['Bathrooms'], errors='coerce')
    df['Floor'] = df['Floor'].apply(clean_floor)
    df['Total_Floors'] = pd.to_numeric(df['Total_Floors'], errors='coerce')
    df['Age_of_Property'] = pd.to_numeric(df['Age_of_Property'], errors='coerce')
    df['Parking'] = df['Parking'].apply(clean_binary)
    df['Lift'] = df['Lift'].apply(clean_binary)
    
    # Drop where essential numeric features are too corrupted to use
    df = df.dropna(subset=['Area_sqft'])
    # Remove negative area or unrealistic outlier (e.g., negative area found)
    df = df[df['Area_sqft'] > 100]
    
    return df

def train_model():
    print("Loading and preprocessing data...")
    # Go up one directory to find data if run from ml folder
    data_path = 'navi_mumbai_real_estate_uncleaned_2500.csv'
    if not os.path.exists(data_path):
        data_path = '../navi_mumbai_real_estate_uncleaned_2500.csv'

    df = load_and_preprocess_data(data_path)
    
    X = df.drop(columns=['Actual_Price'])
    y = df['Actual_Price']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    numeric_features = ['Area_sqft', 'BHK', 'Bathrooms', 'Floor', 'Total_Floors', 'Age_of_Property', 'Parking', 'Lift']
    categorical_features = ['Location']
    
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='Unknown')),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])
    
    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    
    print("Training model...")
    model.fit(X_train, y_train)
    
    print("Evaluating model...")
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"Mean Absolute Error: INR {mae:,.2f}")
    print(f"R2 Score: {r2:.4f}")
    
    os.makedirs('../backend/models', exist_ok=True)
    model_path = '../backend/models/house_price_pipeline.joblib'
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_model()
