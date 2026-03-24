import os, json

SYSTEM_PROMPT = """You are a Senior Credit Analyst at IDLC Finance Limited, Bangladesh's largest NBFI.
Generate professional credit memos in IDLC's standard format.

Rules:
- Always cite data source: (MFS-verified), (CIB), (Field visit), (Document scan)
- Use Bangladesh Bank terminology: DSCR, SMA, UC, CIB, NPL
- Include minimum 3 risk factors even for strong applications
- Calculate DSCR from MFS-verified income, not stated income
- Recommend exact: amount, rate (%), tenure (months), and 2-3 specific covenants
- If income gap >25%, note it and explain why MFS figure is used
- Write in professional English. BDT amounts in Lakh (L) or Crore (Cr)
- Keep memo under 400 words but comprehensive
- Format exactly as shown:

CREDIT MEMO — [Business Name]
Date: [Date]
RM: [RM Name] | Branch: [Branch]

1. APPLICANT SUMMARY
[2-3 sentences]

2. FINANCIAL ANALYSIS
Stated Income: ৳XL/month | MFS-Verified: ৳XL/month | Gap: X%
Monthly Expenses: ৳XL | Net Surplus: ৳XL
DSCR: X.Xx | Collateral: ৳XL (LTV: X%)

3. RISK FACTORS
- [Risk 1]
- [Risk 2]
- [Risk 3]

4. RECOMMENDATION
Decision: [APPROVE / CONDITIONAL APPROVE / REJECT]
Amount: ৳XL | Rate: X.X% p.a. | Tenure: XX months
Covenants:
- [Covenant 1]
- [Covenant 2]

Prepared by: AI Credit Assistant (Review & Sign-off required)"""


def generate_memo(application_data: dict, score_result: dict) -> str:
    prompt = f"""{SYSTEM_PROMPT}

Generate a credit memo for this application:

APPLICANT DATA:
Business: {application_data.get('business_name','N/A')}
District: {application_data.get('district','N/A')}
Industry: {application_data.get('industry','N/A')}
Business Age: {application_data.get('business_age_years','N/A')} years
CIB Status: {'Clean' if application_data.get('cib_clean') else 'Adverse'}
RM Field Score: {application_data.get('rm_field_score','N/A')}/5

FINANCIAL FIGURES:
Stated Monthly Revenue: {application_data.get('stated_monthly_revenue_lac','N/A')}L
MFS-Verified Revenue: {score_result.get('mfs_verified_income','N/A')}L
Income Gap: {score_result.get('income_gap_pct','N/A')}%
Monthly Expenses: {application_data.get('monthly_expenses_lac','N/A')}L
Existing EMI: {application_data.get('existing_emi_lac',0)}L
Net Monthly Surplus: {score_result.get('net_monthly_surplus','N/A')}L
DSCR: {score_result.get('dscr','N/A')}x
Collateral Value: {application_data.get('collateral_value_lac','N/A')}L

LOAN REQUEST:
Amount: {application_data.get('requested_amount_lac','N/A')}L
Purpose: {application_data.get('loan_purpose','Working capital')}

AI ASSESSMENT:
Credit Score: {score_result.get('credit_score','N/A')}/100
Decision: {score_result.get('decision','N/A')}
Recommended Rate: {score_result.get('recommended_rate','N/A')}% p.a.
Top Risk Factors: {json.dumps([f['feature'] for f in score_result.get('top_factors',[])[:3]])}

RM: {application_data.get('rm_name','Relationship Manager')}
Branch: {application_data.get('branch','Dhaka Head Office')}
Date: {application_data.get('date','March 2026')}"""

    api_key = os.environ.get("GROQ_API_KEY")

    if api_key:
        try:
            from groq import Groq
            client = Groq(api_key=api_key)
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1024
            )
            return response.choices[0].message.content
        except Exception as e:
            return _fallback_memo(application_data, score_result, error=str(e))
    else:
        return _fallback_memo(application_data, score_result)


def _fallback_memo(application_data: dict, score_result: dict, error: str = None) -> str:
    """Returns a pre-filled template when no API key is available."""
    biz        = application_data.get('business_name', 'N/A')
    district   = application_data.get('district', 'N/A')
    industry   = application_data.get('industry', 'N/A')
    age        = application_data.get('business_age_years', 'N/A')
    cib        = 'Clean' if application_data.get('cib_clean') else 'Adverse'
    rm_score   = application_data.get('rm_field_score', 'N/A')
    stated     = application_data.get('stated_monthly_revenue_lac', 'N/A')
    mfs        = score_result.get('mfs_verified_income', 'N/A')
    gap        = score_result.get('income_gap_pct', 'N/A')
    expenses   = application_data.get('monthly_expenses_lac', 'N/A')
    emi        = application_data.get('existing_emi_lac', 0)
    surplus    = score_result.get('net_monthly_surplus', 'N/A')
    dscr       = score_result.get('dscr', 'N/A')
    collateral = application_data.get('collateral_value_lac', 'N/A')
    req_amt    = application_data.get('requested_amount_lac', 'N/A')
    purpose    = application_data.get('loan_purpose', 'Working capital')
    cs         = score_result.get('credit_score', 'N/A')
    decision   = score_result.get('decision', 'N/A')
    rate       = score_result.get('recommended_rate', 'N/A')
    rm_name    = application_data.get('rm_name', 'Relationship Manager')
    branch     = application_data.get('branch', 'Dhaka Head Office')
    date       = application_data.get('date', 'March 2026')

    note = f"\n[NOTE: AI memo generation unavailable — {error}]\n" if error else \
           "\n[NOTE: Set GEMINI_API_KEY environment variable to enable AI-generated memos]\n"

    ltv = round((float(req_amt) / float(collateral)) * 100, 1) if collateral not in ('N/A', 0) else 'N/A'

    return f"""CREDIT MEMO — {biz}
Date: {date}
RM: {rm_name} | Branch: {branch}
{note}
1. APPLICANT SUMMARY
{biz} is a {age}-year-old {industry} business operating in {district}. CIB status is {cib} (CIB-verified). RM field assessment score: {rm_score}/5. The applicant has requested working capital financing for {purpose}.

2. FINANCIAL ANALYSIS
Stated Income: ৳{stated}L/month | MFS-Verified: ৳{mfs}L/month | Gap: {gap}%
Monthly Expenses: ৳{expenses}L | Existing EMI: ৳{emi}L | Net Surplus: ৳{surplus}L
DSCR: {dscr}x | Collateral: ৳{collateral}L (LTV: {ltv}%)

AI Credit Score: {cs}/100

3. RISK FACTORS
- Income concentration risk: MFS-verified income gap of {gap}% warrants quarterly MFS statement submission
- Single-product/sector exposure in {industry} industry subject to market cyclicality
- Collateral adequacy: LTV of {ltv}% requires periodic revaluation every 12 months

4. RECOMMENDATION
Decision: {decision}
Amount: ৳{req_amt}L | Rate: {rate}% p.a. | Tenure: 36 months
Covenants:
- Quarterly MFS transaction statement submission mandatory
- Annual financial statement and collateral revaluation required

Prepared by: AI Credit Assistant (Review & Sign-off required)"""


if __name__ == "__main__":
    test_app = {
        "business_name": "Rahman Fabrics Ltd",
        "district": "Narayanganj", "industry": "textile",
        "business_age_years": 8, "cib_clean": 1, "rm_field_score": 4,
        "stated_monthly_revenue_lac": 22, "monthly_expenses_lac": 14,
        "existing_emi_lac": 1.5, "collateral_value_lac": 65,
        "requested_amount_lac": 50, "loan_purpose": "Working capital expansion",
        "rm_name": "Md. Rahim Uddin", "branch": "Narayanganj", "date": "March 2026"
    }
    test_score = {
        "credit_score": 74, "decision": "APPROVE", "dscr": 1.82,
        "mfs_verified_income": 28.4, "income_gap_pct": 29.1,
        "net_monthly_surplus": 10.2, "recommended_rate": 13.0,
        "top_factors": [
            {"feature": "DSCR"}, {"feature": "CIB Status"}, {"feature": "Business Age"}
        ]
    }
    print(generate_memo(test_app, test_score))