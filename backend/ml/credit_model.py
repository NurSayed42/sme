import pandas as pd
import numpy as np
import pickle, os
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import roc_auc_score
import shap

MODEL_PATH = os.path.join(os.path.dirname(__file__), "credit_model.pkl")
ENCODER_PATH = os.path.join(os.path.dirname(__file__), "label_encoders.pkl")
DATA_PATH = os.path.join(os.path.dirname(__file__), "../../demo-data/sme_applications.csv")

FEATURES = [
    "business_age_years","mfs_monthly_revenue_lac","monthly_expenses_lac",
    "existing_emi_lac","dscr","collateral_value_lac","requested_amount_lac",
    "cib_clean","rm_field_score","income_gap_pct","industry_enc","district_enc"
]

def train_model():
    df = pd.read_csv(DATA_PATH)
    le_industry = LabelEncoder().fit(df["industry"])
    le_district = LabelEncoder().fit(df["district"])
    df["industry_enc"] = le_industry.transform(df["industry"])
    df["district_enc"] = le_district.transform(df["district"])
    X = df[FEATURES]
    y = df["defaulted"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    model = XGBClassifier(
        n_estimators=150, max_depth=4, learning_rate=0.05,
        subsample=0.8, colsample_bytree=0.8,
        scale_pos_weight=20, random_state=42, eval_metric="logloss",
        verbosity=0
    )
    model.fit(X_train, y_train)
    auc = roc_auc_score(y_test, model.predict_proba(X_test)[:,1])
    print(f"Model trained. AUC: {auc:.3f}")
    encoders = {"industry": le_industry, "district": le_district}
    with open(MODEL_PATH, "wb") as f: pickle.dump(model, f)
    with open(ENCODER_PATH, "wb") as f: pickle.dump(encoders, f)
    print("Model saved.")
    return model, encoders

def load_model():
    if not os.path.exists(MODEL_PATH):
        return train_model()
    with open(MODEL_PATH, "rb") as f: model = pickle.load(f)
    with open(ENCODER_PATH, "rb") as f: encoders = pickle.load(f)
    return model, encoders

def score_application(data: dict) -> dict:
    model, encoders = load_model()
    # Encode categoricals
    industry_enc = encoders["industry"].transform([data["industry"]])[0]
    district_enc = encoders["district"].transform([data["district"]])[0]
    # Calculate derived fields
    mfs_rev  = data["mfs_monthly_revenue_lac"]
    expenses = data["monthly_expenses_lac"]
    emi      = data["existing_emi_lac"]
    amt      = data["requested_amount_lac"]
    surplus  = mfs_rev - expenses - emi
    dscr     = surplus / max(amt * 0.015, 0.1)
    income_gap = (mfs_rev - data["stated_monthly_revenue_lac"]) / max(data["stated_monthly_revenue_lac"], 1) * 100
    row = {
        "business_age_years":      data["business_age_years"],
        "mfs_monthly_revenue_lac": mfs_rev,
        "monthly_expenses_lac":    expenses,
        "existing_emi_lac":        emi,
        "dscr":                    round(dscr, 2),
        "collateral_value_lac":    data["collateral_value_lac"],
        "requested_amount_lac":    amt,
        "cib_clean":               data["cib_clean"],
        "rm_field_score":          data["rm_field_score"],
        "income_gap_pct":          round(income_gap, 1),
        "industry_enc":            industry_enc,
        "district_enc":            district_enc,
    }
    X = pd.DataFrame([row])
    prob_default = model.predict_proba(X)[0][1]
    credit_score = round((1 - prob_default) * 100)
    # SHAP explanation
    # SHAP explanation
    try:
        explainer = shap.TreeExplainer(model)
        shap_vals = explainer.shap_values(X)[0]
    except Exception:
        import numpy as np
        shap_vals = np.zeros(len(FEATURES))
    feature_impacts = []
    for feat, sv in zip(FEATURES, shap_vals):
        direction = "positive" if sv < 0 else "negative"
        feature_impacts.append({
            "feature": feat.replace("_enc","").replace("_"," ").title(),
            "impact": round(abs(sv) * 100, 1),
            "direction": direction,
            "value": round(float(row[feat]), 2) if feat in row else None
        })
    feature_impacts.sort(key=lambda x: x["impact"], reverse=True)
    # Decision
    if credit_score >= 70:
        decision = "APPROVE"
        decision_color = "green"
    elif credit_score >= 50:
        decision = "REVIEW"
        decision_color = "yellow"
    else:
        decision = "REJECT"
        decision_color = "red"
    # Risk-based rate
    base_rate = 13.5
    if credit_score >= 75 and income_gap < 30:
        rate = base_rate - 1.5
    elif credit_score >= 60:
        rate = base_rate
    elif credit_score >= 50:
        rate = base_rate + 2.0
    else:
        rate = None
    # Income gap flag
    income_flag = None
    if income_gap > 25:
        if income_gap > 0:
            income_flag = f"MFS income is {round(income_gap,1)}% higher than stated — use MFS figure for DSCR"
        else:
            income_flag = f"Stated income exceeds MFS by {round(abs(income_gap),1)}% — possible inflation"
    return {
        "credit_score":         int(credit_score),
        "decision":             decision,
        "decision_color":       decision_color,
        "probability_default":  float(round(prob_default * 100, 1)),
        "dscr":                 float(round(dscr, 2)),
        "net_monthly_surplus":  float(round(surplus, 1)),
        "recommended_rate":     float(rate) if rate is not None else None,
        "income_gap_pct":       float(round(income_gap, 1)),
        "income_flag":          income_flag,
        "top_factors":          [
            {
                "feature":   f["feature"],
                "impact":    float(round(f["impact"], 1)),
                "direction": f["direction"],
                "value":     float(f["value"]) if f["value"] is not None else None
            }
            for f in feature_impacts[:5]
        ],
        "mfs_verified_income":  float(mfs_rev),
        "stated_income":        float(data["stated_monthly_revenue_lac"]),
    }

if __name__ == "__main__":
    train_model()
