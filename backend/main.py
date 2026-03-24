from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json, os, sys

sys.path.insert(0, os.path.dirname(__file__))
from ml.credit_model import score_application
from ml.supply_chain import run_cascade, get_graph_data
from ml.memo_generator import generate_memo

app = FastAPI(title="IDLC AI Credit Intelligence Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Models ────────────────────────────────────────────────────────────────

class CreditApplication(BaseModel):
    business_name: str
    district: str
    industry: str
    business_age_years: int
    stated_monthly_revenue_lac: float
    mfs_monthly_revenue_lac: float
    monthly_expenses_lac: float
    existing_emi_lac: float = 0.0
    collateral_value_lac: float
    requested_amount_lac: float
    cib_clean: int  # 1 = clean, 0 = adverse
    rm_field_score: int  # 1-5
    loan_purpose: Optional[str] = "Working capital"
    rm_name: Optional[str] = "Relationship Manager"
    branch: Optional[str] = "Dhaka Head Office"
    date: Optional[str] = "March 2026"

class MemoRequest(BaseModel):
    application: CreditApplication
    score_result: dict

class CascadeRequest(BaseModel):
    stressed_node_id: str

# ─── Routes ────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "IDLC AI Platform running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/api/credit/score")
def credit_score(application: CreditApplication):
    try:
        data = application.model_dump()
        result = score_application(data)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/credit/memo")
def credit_memo(req: MemoRequest):
    try:
        memo = generate_memo(req.application.model_dump(), req.score_result)
        return {"success": True, "memo": memo}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/supply-chain/graph")
def supply_chain_graph():
    return get_graph_data()

@app.post("/api/supply-chain/cascade")
def supply_chain_cascade(req: CascadeRequest):
    try:
        result = run_cascade(req.stressed_node_id)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/portfolio/state")
def portfolio_state():
    path = os.path.join(os.path.dirname(__file__), "../demo-data/portfolio_state.json")
    with open(path) as f:
        return json.load(f)

@app.get("/api/demo/applications")
def demo_applications():
    import pandas as pd
    path = os.path.join(os.path.dirname(__file__), "../demo-data/sme_applications.csv")
    df = pd.read_csv(path).head(10)
    return df.to_dict(orient="records")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
