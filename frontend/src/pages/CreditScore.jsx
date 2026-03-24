import { useState } from 'react'

const DISTRICTS = ['Dhaka','Chittagong','Narayanganj','Gazipur','Sylhet','Rajshahi','Khulna','Bogura','Cumilla','Mymensingh']
const INDUSTRIES = ['textile','trading','manufacturing','retail','food_processing']

const DEFAULT_FORM = {
  business_name: 'Rahman Fabrics Ltd',
  district: 'Narayanganj',
  industry: 'textile',
  business_age_years: 8,
  stated_monthly_revenue_lac: 22,
  mfs_monthly_revenue_lac: 28.4,
  monthly_expenses_lac: 14,
  existing_emi_lac: 1.5,
  collateral_value_lac: 65,
  requested_amount_lac: 50,
  cib_clean: 1,
  rm_field_score: 4,
  loan_purpose: 'Working capital expansion',
}

export default function CreditScore() {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/api/credit/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...form,
          business_age_years: parseInt(form.business_age_years),
          stated_monthly_revenue_lac: parseFloat(form.stated_monthly_revenue_lac),
          mfs_monthly_revenue_lac: parseFloat(form.mfs_monthly_revenue_lac),
          monthly_expenses_lac: parseFloat(form.monthly_expenses_lac),
          existing_emi_lac: parseFloat(form.existing_emi_lac),
          collateral_value_lac: parseFloat(form.collateral_value_lac),
          requested_amount_lac: parseFloat(form.requested_amount_lac),
          cib_clean: parseInt(form.cib_clean),
          rm_field_score: parseInt(form.rm_field_score),
        })
      })
      const data = await res.json()
      if (data.success) setResult(data.result)
      else setError(data.detail || 'Scoring failed')
    } catch (e) {
      setError('Cannot connect to backend. Make sure server is running on port 8000.')
    }
    setLoading(false)
  }

  const scoreColor = result
    ? (result.credit_score >= 70 ? 'green' : result.credit_score >= 50 ? 'yellow' : 'red')
    : 'green'

  const incomeGap = parseFloat(form.mfs_monthly_revenue_lac) - parseFloat(form.stated_monthly_revenue_lac)
  const incomeGapPct = Math.round((incomeGap / parseFloat(form.stated_monthly_revenue_lac)) * 100)

  return (
    <div className="page">
      <div className="page-title">AI Credit Scoring</div>
      <div className="page-sub">
        Enter application data. MFS income reveals hidden revenue that bank statements miss.
      </div>

      <div className="col-2">
        {/* Left: Form */}
        <div>
          <div className="card" style={{marginBottom:14}}>
            <div className="card-title">Business Information</div>
            <div className="form-grid">
              <div className="form-group" style={{gridColumn:'span 2'}}>
                <label>Business Name</label>
                <input value={form.business_name} onChange={e => set('business_name', e.target.value)} />
              </div>
              <div className="form-group">
                <label>District</label>
                <select value={form.district} onChange={e => set('district', e.target.value)}>
                  {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Industry</label>
                <select value={form.industry} onChange={e => set('industry', e.target.value)}>
                  {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Business Age (Years)</label>
                <input type="number" value={form.business_age_years} onChange={e => set('business_age_years', e.target.value)} />
              </div>
              <div className="form-group">
                <label>CIB Status</label>
                <select value={form.cib_clean} onChange={e => set('cib_clean', e.target.value)}>
                  <option value={1}>Clean</option>
                  <option value={0}>Adverse</option>
                </select>
              </div>
              <div className="form-group">
                <label>RM Field Score (1-5)</label>
                <select value={form.rm_field_score} onChange={e => set('rm_field_score', e.target.value)}>
                  {[1,2,3,4,5].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Loan Purpose</label>
                <input value={form.loan_purpose} onChange={e => set('loan_purpose', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="card" style={{marginBottom:14}}>
            <div className="card-title">Financial Data</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Stated Revenue / Month (৳L)</label>
                <input type="number" step="0.1" value={form.stated_monthly_revenue_lac}
                  onChange={e => set('stated_monthly_revenue_lac', e.target.value)} />
              </div>
              <div className="form-group">
                <label>MFS-Verified Revenue / Month (৳L)</label>
                <input type="number" step="0.1" value={form.mfs_monthly_revenue_lac}
                  onChange={e => set('mfs_monthly_revenue_lac', e.target.value)}
                  style={{borderColor:'var(--green)', color:'var(--green)'}} />
              </div>
              <div className="form-group">
                <label>Monthly Expenses (৳L)</label>
                <input type="number" step="0.1" value={form.monthly_expenses_lac}
                  onChange={e => set('monthly_expenses_lac', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Existing EMI (৳L)</label>
                <input type="number" step="0.1" value={form.existing_emi_lac}
                  onChange={e => set('existing_emi_lac', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Collateral Value (৳L)</label>
                <input type="number" step="0.1" value={form.collateral_value_lac}
                  onChange={e => set('collateral_value_lac', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Requested Amount (৳L)</label>
                <input type="number" step="1" value={form.requested_amount_lac}
                  onChange={e => set('requested_amount_lac', e.target.value)} />
              </div>
            </div>

            {/* Live income gap preview */}
            <div className={`gap-box ${incomeGapPct > 5 ? 'warn' : 'ok'}`}>
              <strong>MFS Income Gap Preview:</strong>{' '}
              MFS shows ৳{parseFloat(form.mfs_monthly_revenue_lac).toFixed(1)}L vs stated ৳{parseFloat(form.stated_monthly_revenue_lac).toFixed(1)}L
              {incomeGapPct > 0
                ? ` — ${incomeGapPct}% hidden income detected`
                : ` — stated income is higher (fraud risk if >30%)`}
            </div>
          </div>

          <button className="btn btn-primary" style={{width:'100%', padding:'13px'}}
            onClick={submit} disabled={loading}>
            {loading
              ? <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                  <div className="spinner"/>Scoring Application...
                </span>
              : 'Run AI Credit Scoring →'}
          </button>
          {error && <div className="alert alert-red" style={{marginTop:10}}>{error}</div>}
        </div>

        {/* Right: Result */}
        <div>
          {!result && !loading && (
            <div className="card" style={{height:'100%',display:'flex',alignItems:'center',
              justifyContent:'center',flexDirection:'column',gap:8,minHeight:300}}>
              <div style={{fontSize:32,opacity:.15}}>◎</div>
              <div style={{color:'var(--text3)',fontSize:13}}>Score result will appear here</div>
            </div>
          )}
          {loading && (
            <div className="card" style={{height:'100%',display:'flex',alignItems:'center',
              justifyContent:'center',minHeight:300}}>
              <div className="memo-loading">
                <div className="spinner"/>
                Running XGBoost model with SHAP explainability...
              </div>
            </div>
          )}
          {result && (
            <>
              <div className="card" style={{marginBottom:14}}>
                <div className="card-title">Credit Decision</div>
                <div className="score-ring-wrap">
                  <div className={`score-number ${scoreColor}`}>{result.credit_score}</div>
                  <div>
                    <div style={{fontSize:12,color:'var(--text2)',marginBottom:6}}>Credit Score / 100</div>
                    <div className={`decision-pill ${scoreColor}`}>{result.decision}</div>
                    {result.recommended_rate && (
                      <div style={{marginTop:8,fontFamily:'var(--mono)',fontSize:13,color:'var(--text)'}}>
                        Rate: <strong style={{color:'var(--green)'}}>{result.recommended_rate}%</strong> p.a.
                      </div>
                    )}
                  </div>
                </div>

                <table className="kv-table">
                  <tbody>
                    <tr>
                      <td>MFS-Verified Income</td>
                      <td style={{color:'var(--green)'}}>৳{result.mfs_verified_income}L / month</td>
                    </tr>
                    <tr>
                      <td>Stated Income</td>
                      <td>৳{result.stated_income}L / month</td>
                    </tr>
                    <tr>
                      <td>Income Gap</td>
                      <td style={{color: result.income_gap_pct > 25 ? 'var(--yellow)' : 'var(--text)'}}>
                        +{result.income_gap_pct}%
                      </td>
                    </tr>
                    <tr>
                      <td>Net Monthly Surplus</td>
                      <td>৳{result.net_monthly_surplus}L</td>
                    </tr>
                    <tr>
                      <td>DSCR</td>
                      <td style={{color: result.dscr >= 1.25 ? 'var(--green)' : 'var(--red)'}}>
                        {result.dscr}x {result.dscr >= 1.25 ? '✓' : '✗'}
                      </td>
                    </tr>
                    <tr>
                      <td>Default Probability</td>
                      <td>{result.probability_default}%</td>
                    </tr>
                  </tbody>
                </table>

                {result.income_flag && (
                  <div className="alert alert-yellow" style={{marginTop:12}}>
                    {result.income_flag}
                  </div>
                )}
              </div>

              <div className="card">
                <div className="card-title">Top Decision Factors (SHAP)</div>
                {result.top_factors.map((f, i) => (
                  <div className="factor-row" key={i}>
                    <div className="factor-label">{f.feature}</div>
                    <div className="factor-bar-bg">
                      <div className="factor-bar-fill" style={{
                        width: `${Math.min(f.impact * 4, 100)}%`,
                        background: f.direction === 'positive' ? 'var(--green)' : 'var(--red)'
                      }}/>
                    </div>
                    <div className="factor-impact"
                      style={{color: f.direction === 'positive' ? 'var(--green)' : 'var(--red)'}}>
                      {f.direction === 'positive' ? '+' : '-'}{f.impact}
                    </div>
                  </div>
                ))}
                <div style={{marginTop:12,fontSize:11,color:'var(--text3)'}}>
                  Green = improves score · Red = reduces score · Values are SHAP impact units
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
