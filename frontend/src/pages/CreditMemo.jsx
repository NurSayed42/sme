import { useState } from 'react'

const SAMPLE_APP = {
  business_name: 'Rahman Fabrics Ltd',
  district: 'Narayanganj', industry: 'textile',
  business_age_years: 8, cib_clean: 1, rm_field_score: 4,
  stated_monthly_revenue_lac: 22, mfs_monthly_revenue_lac: 28.4,
  monthly_expenses_lac: 14, existing_emi_lac: 1.5,
  collateral_value_lac: 65, requested_amount_lac: 50,
  loan_purpose: 'Working capital expansion',
  rm_name: 'Md. Rahim Uddin', branch: 'Narayanganj Branch',
  date: 'March 2026',
}
const SAMPLE_SCORE = {
  credit_score: 74, decision: 'APPROVE', dscr: 1.82,
  mfs_verified_income: 28.4, stated_income: 22,
  income_gap_pct: 29.1, net_monthly_surplus: 10.2,
  recommended_rate: 13.0,
  top_factors: [
    {feature:'DSCR'},{feature:'CIB Status'},{feature:'Business Age'},
    {feature:'MFS Income Gap'},{feature:'Collateral Coverage'},
  ]
}

export default function CreditMemo() {
  const [memo, setMemo]     = useState('')
  const [loading, setLoading] = useState(false)
  const [elapsed, setElapsed] = useState(null)
  const [error, setError]   = useState(null)
  const [tab, setTab]       = useState('app')

  const generate = async () => {
    setLoading(true); setMemo(''); setError(null); setElapsed(null)
    const start = Date.now()
    try {
      const res = await fetch('/api/credit/memo', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ application: SAMPLE_APP, score_result: SAMPLE_SCORE })
      })
      const data = await res.json()
      if (data.success) {
        setMemo(data.memo)
        setElapsed(((Date.now() - start) / 1000).toFixed(1))
      } else setError(data.detail || 'Generation failed')
    } catch (e) {
      setError('Backend not connected. Add ANTHROPIC_API_KEY to environment and start the server.')
    }
    setLoading(false)
  }

  return (
    <div className="page">
      <div className="page-title">Auto Credit Memo</div>
      <div className="page-sub">
        AI generates a full Bangladesh Bank-compliant credit memo in under 45 seconds. RM reviews and signs off.
      </div>

      <div className="tab-nav">
        <div className={`tab ${tab === 'app' ? 'active' : ''}`} onClick={() => setTab('app')}>Application Data</div>
        <div className={`tab ${tab === 'score' ? 'active' : ''}`} onClick={() => setTab('score')}>Score Result</div>
        <div className={`tab ${tab === 'memo' ? 'active' : ''}`} onClick={() => setTab('memo')}>Generated Memo</div>
      </div>

      {tab === 'app' && (
        <div className="card" style={{marginBottom:16}}>
          <div className="card-title">Application Input (Sample — Rahman Fabrics)</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:0}}>
            {Object.entries(SAMPLE_APP).map(([k,v]) => (
              <div key={k} style={{
                display:'flex',justifyContent:'space-between',
                padding:'6px 12px 6px 0',
                borderBottom:'1px solid var(--border)',
                paddingRight:24,
              }}>
                <span style={{fontSize:11,color:'var(--text3)',textTransform:'uppercase',
                  letterSpacing:'.04em'}}>{k.replace(/_/g,' ')}</span>
                <span style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--text)'}}>{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'score' && (
        <div className="card" style={{marginBottom:16}}>
          <div className="card-title">AI Score Result Feed</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div>
              <div style={{fontFamily:'var(--mono)',fontSize:48,fontWeight:600,
                color:'var(--green)',lineHeight:1,marginBottom:8}}>
                {SAMPLE_SCORE.credit_score}
              </div>
              <div className="decision-pill green" style={{marginBottom:12}}>APPROVE</div>
              <table className="kv-table">
                <tbody>
                  <tr><td>DSCR</td><td style={{color:'var(--green)'}}>{SAMPLE_SCORE.dscr}x</td></tr>
                  <tr><td>MFS Income</td><td style={{color:'var(--green)'}}>৳{SAMPLE_SCORE.mfs_verified_income}L</td></tr>
                  <tr><td>Income Gap</td><td style={{color:'var(--yellow)'}}>+{SAMPLE_SCORE.income_gap_pct}%</td></tr>
                  <tr><td>Net Surplus</td><td>৳{SAMPLE_SCORE.net_monthly_surplus}L</td></tr>
                  <tr><td>Recommended Rate</td><td>{SAMPLE_SCORE.recommended_rate}% p.a.</td></tr>
                </tbody>
              </table>
            </div>
            <div>
              <div style={{fontSize:12,color:'var(--text3)',marginBottom:8,
                textTransform:'uppercase',letterSpacing:'.06em'}}>Top SHAP Factors</div>
              {SAMPLE_SCORE.top_factors.map((f,i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                  <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--text3)',
                    minWidth:16,textAlign:'right'}}>{i+1}</div>
                  <div style={{flex:1,height:4,background:'var(--bg3)',borderRadius:2,overflow:'hidden'}}>
                    <div style={{width:`${100 - i*15}%`,height:'100%',
                      background:'var(--green)',borderRadius:2}}/>
                  </div>
                  <div style={{fontSize:12,color:'var(--text2)',minWidth:140}}>{f.feature}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'memo' && (
        <div style={{marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
            <button className="btn btn-primary" onClick={generate} disabled={loading}>
              {loading
                ? <span style={{display:'flex',alignItems:'center',gap:8}}>
                    <div className="spinner"/>Generating memo...
                  </span>
                : 'Generate Credit Memo →'}
            </button>
            {elapsed && (
              <div style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--green)'}}>
                Generated in {elapsed}s
              </div>
            )}
            {memo && (
              <button className="btn btn-outline" onClick={() => {
                const blob = new Blob([memo], {type:'text/plain'})
                const a = document.createElement('a')
                a.href = URL.createObjectURL(blob)
                a.download = 'credit_memo_rahman_fabrics.txt'
                a.click()
              }}>
                Download .txt
              </button>
            )}
          </div>

          {error && (
            <div className="alert alert-yellow" style={{marginBottom:14}}>
              <strong>Note:</strong> {error}
              <div style={{marginTop:6,fontSize:11}}>
                To enable: <code style={{fontFamily:'var(--mono)'}}>
                  export ANTHROPIC_API_KEY=sk-... && uvicorn main:app --port 8000
                </code>
              </div>
            </div>
          )}

          {loading && (
            <div className="card">
              <div className="memo-loading" style={{flexDirection:'column',gap:16}}>
                <div className="spinner" style={{width:24,height:24}}/>
                <div style={{textAlign:'center'}}>
                  <div style={{marginBottom:4}}> API is writing your credit memo...</div>
                  <div style={{fontSize:11,color:'var(--text3)'}}>
                    Analyzing DSCR · Checking MFS gap · Identifying risks · Formatting to IDLC standard
                  </div>
                </div>
              </div>
            </div>
          )}

          {memo && (
            <div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                <div style={{fontSize:11,color:'var(--text3)',fontFamily:'var(--mono)',
                  textTransform:'uppercase',letterSpacing:'.08em'}}>
                  DRAFT — RM Review & Sign-off Required
                </div>
                <div style={{fontSize:11,color:'var(--yellow)',fontFamily:'var(--mono)'}}>
                  ● PENDING REVIEW
                </div>
              </div>
              <div className="memo-output">{memo}</div>
              <div className="alert alert-yellow" style={{marginTop:12}}>
                This memo was AI-generated in {elapsed}s. RM must review, modify if needed, and digitally sign before submission. All overrides are logged for model improvement.
              </div>
            </div>
          )}

          {!memo && !loading && !error && (
            <div className="card">
              <div style={{padding:'40px',textAlign:'center',color:'var(--text3)'}}>
                <div style={{fontSize:28,opacity:.1,marginBottom:8}}>✎</div>
                <div style={{fontSize:13}}>Click "Generate Credit Memo" to see AI-generated output</div>
                <div style={{fontSize:11,marginTop:4}}>
                  Uses application data + score result → produces full IDLC-format memo
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="col-3" style={{marginTop:4}}>
        {[
          {label:'Time without AI',  value:'2–3 hours',  sub:'Per memo, manual',   color:'var(--red)'},
          {label:'Time with AI',     value:'~45 sec',    sub:'AI draft + RM review', color:'var(--green)'},
          {label:'Monthly saving',   value:'160+ hrs',   sub:'For 60 applications/month', color:'var(--yellow)'},
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{color:s.color,fontSize:20}}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
