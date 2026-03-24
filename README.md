# IDLC AI Credit Intelligence Platform
## Demo v1.0 — March 2026

---

## Folder Structure

```
idlc-ai-platform/
├── backend/
│   ├── main.py                  ← FastAPI server (all routes)
│   └── ml/
│       ├── credit_model.py      ← XGBoost + SHAP credit scoring
│       ├── supply_chain.py      ← Cascade risk engine (NetworkX)
│       └── memo_generator.py   ← Claude API credit memo
├── frontend/
│   ├── src/
│   │   ├── App.jsx              ← Main layout + navigation
│   │   ├── index.css            ← Design system
│   │   └── pages/
│   │       ├── Dashboard.jsx    ← Portfolio overview
│   │       ├── CreditScore.jsx  ← Module 1+4 (scoring + MFS)
│   │       ├── SupplyChain.jsx  ← Module 5 (cascade map)
│   │       └── CreditMemo.jsx   ← Module 7 (auto memo)
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

## Run Instructions

### Step 1 — Generate data & train model (already done)
```bash
cd idlc-ai-platform
python demo-data/generate.py
python backend/ml/credit_model.py
```

### Step 2 — Start Backend
```bash
cd backend
export ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
uvicorn main:app --port 8000 --reload
```
Backend runs at: http://localhost:8000
API docs at:     http://localhost:8000/docs

### Step 3 — Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:3000

---

## Demo Flow for IDLC Presentation (15 minutes)

### Minute 1-2: Dashboard
- Show portfolio overview
- Point to textile at 38% — "approaching BB limit"
- Point to active alert at bottom

### Minute 3-7: Credit Scoring (Module 1+4)
- Fill form with Rahman Fabrics data (pre-filled)
- Highlight: stated ৳22L vs MFS ৳28.4L
- Click "Run AI Credit Scoring"
- Show: score 74, DSCR 1.82x, income gap flag
- Say: "আপনার RM manually ২-৩ ঘণ্টায় এটা করে, আমার system ৮ সেকেন্ডে করে"

### Minute 8-11: Supply Chain (Module 5)
- Click "Karim Yarn Mills" button
- Watch cascade animation
- Show affected companies turning yellow/red
- Say: "এই cascade টা আপনারা ৪৫ দিন পরে দেখতেন, আমার system এখনই দেখাচ্ছে"

### Minute 12-15: Credit Memo (Module 7)
- Go to Memo tab → Generated Memo tab
- Click "Generate Credit Memo"
- Wait 30-45 seconds
- Show full professional memo output
- Say: "আপনার RM ৩ ঘণ্টায় এটা লেখে। এটা ৪৫ সেকেন্ডে হলো।"

---

## API Endpoints

| Method | Endpoint                     | Description              |
|--------|------------------------------|--------------------------|
| POST   | /api/credit/score            | Credit score application |
| POST   | /api/credit/memo             | Generate credit memo     |
| GET    | /api/supply-chain/graph      | Get graph data           |
| POST   | /api/supply-chain/cascade    | Run cascade simulation   |
| GET    | /api/portfolio/state         | Portfolio overview data  |
| GET    | /api/demo/applications       | Sample applications      |

---

## Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-...    # Required for credit memo generation
```

---

## ROI Summary (for IDLC presentation)

| Metric                        | Current    | With AI        |
|-------------------------------|------------|----------------|
| RM apps / month               | 12-15      | 35-40          |
| Fraud detection rate          | ~40%       | ~88%           |
| Credit memo time              | 2-3 hours  | 45 seconds     |
| NPL early warning             | After miss | 30-90 days     |
| Annual value (conservative)   | —          | ৳77+ crore     |
| System cost (annual)          | —          | ৳1.5-2 crore   |
| **ROI**                       | —          | **40-50x**     |
