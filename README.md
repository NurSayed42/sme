# 🏦 ABC AI Credit Intelligence Platform
### Demo v1.0 — March 2026

> An AI-powered SME credit risk assessment system built for Bangladesh's NBFI sector —  
> combining alternative MFS data, explainable ML, supply chain contagion modeling,  
> and LLM-generated credit memos into a single platform.

---

## ⚡ What This Does

Bangladesh has **6.5 million SMEs** — most without formal financial records. Traditional credit scoring fails them. This platform bridges that gap using **bKash/Nagad transaction patterns** as alternative income verification, giving NBFIs like IDLC Finance PLC the tools to assess creditworthiness for the underbanked.

**Three core modules:**

| Module | Problem Solved |
|---|---|
| 🎯 AI Credit Scoring | XGBoost + SHAP scoring with MFS alternative data verification |
| 🕸️ Supply Chain Risk | Graph-based cascade simulation — detect NPL contagion before it spreads |
| 📄 Auto Credit Memo | LLM-generated professional memos in under 45 seconds |

---

## 🖥️ Screenshots

> *(Add screenshots in `/docs/screenshots/` and link here)*

| Dashboard | Credit Scoring | Supply Chain | Credit Memo |
|---|---|---|---|
| Portfolio overview | XGBoost + SHAP | Cascade animation | LLM memo output |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│   Dashboard │ CreditScore │ SupplyChain │ CreditMemo │
└───────────────────────┬─────────────────────────────┘
                        │ REST API
┌───────────────────────▼─────────────────────────────┐
│                  FastAPI Backend                     │
│                    main.py                           │
└──────┬────────────────┬──────────────────┬──────────┘
       │                │                  │
┌──────▼──────┐  ┌──────▼──────┐  ┌───────▼───────┐
│ credit_     │  │ supply_     │  │ memo_         │
│ model.py    │  │ chain.py    │  │ generator.py  │
│ XGBoost     │  │ NetworkX    │  │ Groq LLM API  │
│ + SHAP      │  │ Cascade Sim │  │               │
└─────────────┘  └─────────────┘  └───────────────┘
```

---

## 📁 Folder Structure

```
idlc-ai-platform/
├── backend/
│   ├── main.py                  ← FastAPI server (all routes)
│   └── ml/
│       ├── credit_model.py      ← XGBoost + SHAP credit scoring
│       ├── supply_chain.py      ← Cascade risk engine (NetworkX)
│       └── memo_generator.py    ← LLM credit memo generation
├── frontend/
│   ├── src/
│   │   ├── App.jsx              ← Main layout + navigation
│   │   ├── index.css            ← Design system
│   │   └── pages/
│   │       ├── Dashboard.jsx    ← Portfolio overview
│   │       ├── CreditScore.jsx  ← Scoring + MFS verification
│   │       ├── SupplyChain.jsx  ← Cascade risk map
│   │       └── CreditMemo.jsx   ← Auto memo generation
│   └── package.json
├── demo-data/
│   ├── generate.py              ← Synthetic data generator
│   ├── sme_applications.csv     ← 200 synthetic SME applications
│   ├── supply_chain.json        ← 7 companies + edges
│   └── portfolio_state.json     ← IDLC portfolio snapshot
└── docs/
    └── BRS.txt                  ← Full Business Requirements Spec
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Step 1 — Generate Data & Train Model
```bash
cd idlc-ai-platform
python demo-data/generate.py
python backend/ml/credit_model.py
```

### Step 2 — Start Backend
```bash
cd backend
pip install -r requirements.txt

# Windows
set GROQ_API_KEY=your_key_here

# Mac/Linux
export GROQ_API_KEY=your_key_here

uvicorn main:app --port 8000 --reload
```

- Backend: http://localhost:8000
- API Docs (Swagger): http://localhost:8000/docs

### Step 3 — Start Frontend
```bash
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:3000

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/credit/score` | Run credit scoring on application |
| POST | `/api/credit/memo` | Generate LLM credit memo |
| GET | `/api/supply-chain/graph` | Fetch borrower network graph |
| POST | `/api/supply-chain/cascade` | Run NPL cascade simulation |
| GET | `/api/portfolio/state` | Portfolio overview data |
| GET | `/api/demo/applications` | Sample SME applications |

---

## 🧠 Key Technical Concepts

**MFS Alternative Data**
Most Bangladeshi SMEs lack formal bank statements. This platform uses bKash/Nagad transaction patterns to independently verify stated income — flagging discrepancies above 25% as high-risk signals.

**XGBoost + SHAP Explainability**
The credit scoring engine uses XGBoost trained on synthetic SME data. SHAP values decompose each decision — showing exactly which features (DSCR, CIB status, business age) drove the score, enabling regulatory audit trails.

**Supply Chain Contagion Modeling**
Using NetworkX graph analysis, the platform simulates how a single borrower default propagates through supplier/buyer networks. Identifies second and third-order NPL risks invisible to traditional per-borrower analysis.

**LLM Credit Memo Generation**
Structured loan assessment reports generated in under 45 seconds using Groq's LLaMA 3.3 70B model — following standard NBFI credit appraisal format with data-sourced citations.

---

## 📊 ROI Summary

| Metric | Current | With AI Platform |
|---|---|---|
| RM applications / month | 12-15 | 35-40 |
| Fraud detection rate | ~40% | ~88% |
| Credit memo time | 2-3 hours | 45 seconds |
| NPL early warning | After missed payment | 30-90 days prior |
| Annual value (conservative) | — | ৳77+ crore |
| System cost (annual) | — | ৳1.5-2 crore |
| **Estimated ROI** | — | **40-50x** |

---

## ⚙️ Environment Variables

```bash
GROQ_API_KEY=your_key_here    # Required for LLM credit memo generation
```

---

## 🗺️ Roadmap

- [ ] Real CIB API integration
- [ ] Live bKash/Nagad transaction feed
- [ ] Bangladesh Bank compliance reporting module
- [ ] Mobile RM field app
- [ ] Multi-branch portfolio aggregation


## ⚠️ Disclaimer

This is a prototype built for demonstration purposes using synthetic data.
Not intended for production use without real CIB integration and Bangladesh Bank compliance review.