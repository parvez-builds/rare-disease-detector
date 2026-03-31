from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Rare Disease Detector API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DISEASE_DB = {
    "Fabry Disease": {
        "symptoms": ["burning pain in hands", "decreased sweating", "cloudy cornea"],
        "specialist": "Geneticist / Nephrologist",
        "next_test": "Alpha-Gal A enzyme activity test",
        "reason": "The combination of acroparesthesia (burning pain) and sweat gland dysfunction is a classic marker for Fabry."
    },
    "Huntington's Disease": {
        "symptoms": ["involuntary jerking", "cognitive decline", "mood swings"],
        "specialist": "Neurologist",
        "next_test": "Genetic testing for CAG repeats",
        "reason": "Chorea (involuntary movements) paired with psychiatric shifts strongly indicates Huntington's."
    },
    "Wilson's Disease": {
        "symptoms": ["tremors", "jaundice", "kayser-fleischer rings"],
        "specialist": "Hepatologist",
        "next_test": "Ceruloplasmin blood test",
        "reason": "Copper accumulation in the liver and eyes (KF rings) is a pathognomonic sign."
    }
}


class AnalysisRequest(BaseModel):
    symptoms: List[str]


@app.get("/")
async def root():
    return {"message": "Rare Disease Detector API is running."}


@app.post("/analyze")
async def analyze(request: AnalysisRequest):
    user_symptoms = [s.lower().strip() for s in request.symptoms if s.strip()]
    results = []

    for disease, data in DISEASE_DB.items():
        match_count = sum(
            1
            for known_symptom in data["symptoms"]
            if any(known_symptom in user_symptom for user_symptom in user_symptoms)
        )

        probability = round((match_count / len(data["symptoms"])) * 100)

        if probability > 20:
            results.append({
                "disease": disease,
                "probability": probability,
                "specialist": data["specialist"],
                "next_test": data["next_test"],
                "explanation": data["reason"]
            })

    results.sort(key=lambda x: x["probability"], reverse=True)

    if not results:
        results = [{
            "disease": "Unknown",
            "probability": 0,
            "specialist": "General Physician",
            "next_test": "Clinical evaluation",
            "explanation": "No rare disease match found. Please consult a GP for further assessment."
        }]

    return {"results": results}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)