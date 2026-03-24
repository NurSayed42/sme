import pandas as pd
import numpy as np
import json, random, os

np.random.seed(42)
random.seed(42)

DISTRICTS = ["Dhaka","Chittagong","Narayanganj","Gazipur","Sylhet",
             "Rajshahi","Khulna","Bogura","Cumilla","Mymensingh"]
INDUSTRIES = ["textile","trading","manufacturing","retail","food_processing"]
BUSINESS_NAMES = [
    "Rahman Fabrics","Karim Traders","Hossain Knit","Islam Garments",
    "Akter Trading","Molla Manufacturers","Chowdhury Retail","Begum Foods",
    "Reza Textiles","Noor Enterprise","Dhaka Knit Ltd","Excel Garments",
    "Star Trading Co","Prime Fabrics","Green Manufacturing","City Retail",
    "United Foods","Jamuna Textiles","Padma Traders","Meghna Industries"
]

def generate_sme_applications(n=200):
    rows = []
    for i in range(n):
        industry = random.choice(INDUSTRIES)
        district  = random.choice(DISTRICTS)
        biz_age   = np.random.randint(2, 22)
        stated_rev = round(np.random.exponential(18) + 5, 1)
        # MFS reality: 30-60% hidden income for good businesses
        hidden_pct = np.random.uniform(0.05, 0.65)
        mfs_rev    = round(stated_rev * (1 + hidden_pct), 1)
        existing_loans = np.random.randint(0, 4)
        existing_emi   = round(existing_loans * np.random.uniform(0.5, 2.0), 1)
        expenses       = round(mfs_rev * np.random.uniform(0.45, 0.75), 1)
        collateral_val = round(np.random.exponential(30) + 10, 1)
        requested_amt  = round(np.random.uniform(10, 80), 0)
        cib_clean      = 1 if np.random.random() > 0.12 else 0
        rm_score       = np.random.randint(2, 6)
        # True default probability (ground truth for training)
        surplus = mfs_rev - expenses - existing_emi
        dscr    = surplus / max(requested_amt * 0.015, 0.1)
        p_default = 1 / (1 + np.exp(
            dscr * 1.5 + cib_clean * 2 + biz_age * 0.08
            + rm_score * 0.3 - 3.2
        ))
        defaulted = 1 if np.random.random() < p_default else 0
        rows.append({
            "id": f"APP{1000+i}",
            "business_name": random.choice(BUSINESS_NAMES) + f" {i+1}",
            "district": district,
            "industry": industry,
            "business_age_years": biz_age,
            "stated_monthly_revenue_lac": stated_rev,
            "mfs_monthly_revenue_lac": mfs_rev,
            "income_gap_pct": round((mfs_rev - stated_rev) / stated_rev * 100, 1),
            "monthly_expenses_lac": expenses,
            "existing_emi_lac": existing_emi,
            "net_surplus_lac": round(surplus, 1),
            "dscr": round(dscr, 2),
            "collateral_value_lac": collateral_val,
            "requested_amount_lac": requested_amt,
            "cib_clean": cib_clean,
            "rm_field_score": rm_score,
            "defaulted": defaulted
        })
    df = pd.DataFrame(rows)
    df.to_csv(os.path.join(os.path.dirname(__file__), "sme_applications.csv"), index=False)
    print(f"Generated {n} SME applications. Default rate: {df.defaulted.mean():.1%}")
    return df

def generate_supply_chain():
    companies = [
        {"id":"C1","name":"Karim Yarn Mills","industry":"textile","loan_lac":280,"risk_score":82,"district":"Narayanganj"},
        {"id":"C2","name":"Rahman Fabrics","industry":"textile","loan_lac":350,"risk_score":67,"district":"Narayanganj"},
        {"id":"C3","name":"Dhaka Knit Ltd","industry":"textile","loan_lac":210,"risk_score":54,"district":"Dhaka"},
        {"id":"C4","name":"Excel Garments","industry":"textile","loan_lac":480,"risk_score":61,"district":"Chittagong"},
        {"id":"C5","name":"Star Trading Co","industry":"trading","loan_lac":120,"risk_score":38,"district":"Dhaka"},
        {"id":"C6","name":"Prime Retail","industry":"retail","loan_lac":95,"risk_score":29,"district":"Gazipur"},
        {"id":"C7","name":"Noor Enterprise","industry":"manufacturing","loan_lac":165,"risk_score":44,"district":"Bogura"},
    ]
    edges = [
        {"source":"C1","target":"C2","dependency_pct":65,"label":"Yarn supplier"},
        {"source":"C1","target":"C3","dependency_pct":40,"label":"Yarn supplier"},
        {"source":"C2","target":"C4","dependency_pct":55,"label":"Fabric supplier"},
        {"source":"C3","target":"C4","dependency_pct":35,"label":"Fabric supplier"},
        {"source":"C4","target":"C5","dependency_pct":30,"label":"Garment supplier"},
        {"source":"C5","target":"C6","dependency_pct":25,"label":"Product supplier"},
        {"source":"C2","target":"C7","dependency_pct":20,"label":"Fabric supplier"},
    ]
    data = {"companies": companies, "edges": edges}
    with open(os.path.join(os.path.dirname(__file__), "supply_chain.json"),"w") as f:
        json.dump(data, f, indent=2)
    print("Supply chain graph generated.")
    return data

def generate_portfolio_state():
    state = {
        "total_portfolio_cr": 4612,
        "npl_ratio": 3.8,
        "risk_adjusted_yield": 11.2,
        "sector_weights": {
            "textile": 38, "trading": 24,
            "manufacturing": 18, "retail": 12, "other": 8
        },
        "district_weights": {
            "Dhaka": 32,"Chittagong": 28,"Narayanganj": 14,
            "Others": 26
        },
        "bb_limits": {
            "single_sector_max_pct": 40,
            "single_borrower_max_pct": 10
        }
    }
    with open(os.path.join(os.path.dirname(__file__), "portfolio_state.json"),"w") as f:
        json.dump(state, f, indent=2)
    print("Portfolio state generated.")
    return state

if __name__ == "__main__":
    generate_sme_applications(200)
    generate_supply_chain()
    generate_portfolio_state()
    print("\nAll demo data ready.")
