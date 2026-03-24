import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

const sectors = [
  { name: 'Textile',       pct: 38, max: 40, color: '#4096ff' },
  { name: 'Trading',       pct: 24, max: 40, color: '#00d68f' },
  { name: 'Manufacturing', pct: 18, max: 40, color: '#7c6af0' },
  { name: 'Retail',        pct: 12, max: 40, color: '#ff9f40' },
  { name: 'Other',         pct:  8, max: 40, color: '#8a97a8' },
]

const radarData = [
  { subject: 'Credit Quality', A: 78 },
  { subject: 'Diversification', A: 62 },
  { subject: 'Fraud Detection', A: 88 },
  { subject: 'Early Warning', A: 71 },
  { subject: 'Compliance', A: 95 },
  { subject: 'RM Efficiency', A: 55 },
]

export default function Dashboard({ onNavigate }) {
  return (
    <div className="page">
      <div className="page-title">SME Portfolio Intelligence</div>
      <div className="page-sub">ABC Finance · Real-time AI monitoring across 35 districts</div>

      <div className="stat-grid">
        {[
          { label: 'Total SME Portfolio',  value: '৳4,612 Cr', sub: 'Active loans' },
          { label: 'Current NPL Ratio',    value: '3.8%',       sub: '↓ 0.9% YoY', color: 'var(--green)' },
          { label: 'Applications / Month', value: '487',        sub: 'Pending: 23' },
          { label: 'Fraud Detected MTD',   value: '12',         sub: '৳1.8Cr saved', color: 'var(--yellow)' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={s.color ? {color: s.color} : {}}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="col-2" style={{marginBottom:16}}>
        <div className="card">
          <div className="card-title">Sector Concentration</div>
          {sectors.map(s => (
            <div key={s.name} style={{marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:12,color:'var(--text2)'}}>{s.name}</span>
                <span style={{fontFamily:'var(--mono)',fontSize:12,
                  color: s.pct >= 38 ? 'var(--yellow)' : 'var(--text)'}}>
                  {s.pct}%
                  {s.pct >= 38 && <span style={{marginLeft:6,fontSize:10,color:'var(--yellow)'}}>▲ WATCH</span>}
                </span>
              </div>
              <div style={{background:'var(--bg3)',height:6,borderRadius:3,overflow:'hidden'}}>
                <div style={{
                  width: `${(s.pct/s.max)*100}%`,
                  height:'100%', borderRadius:3,
                  background: s.pct >= 38 ? 'var(--yellow)' : s.color,
                  transition:'width .5s'
                }}/>
              </div>
              {s.pct >= 38 && (
                <div style={{fontSize:11,color:'var(--yellow)',marginTop:3}}>
                  {s.max - s.pct}% headroom before BB limit
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">System Health Score</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e2530" />
              <PolarAngleAxis dataKey="subject" tick={{fill:'#8a97a8',fontSize:10}} />
              <Radar dataKey="A" stroke="#00d68f" fill="#00d68f" fillOpacity={0.12} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="col-3">
        {[
          {
            title: 'Credit Scoring + MFS',
            desc: 'AI scores applicants using bKash/Nagad data to find hidden income — catches 40% more creditworthy borrowers.',
            btn: 'Try Credit Scoring',
            page: 'credit',
            color: 'var(--blue)'
          },
          {
            title: 'Supply Chain Cascade',
            desc: 'Graph model shows which clients will be affected if a supplier defaults — 30-90 days early warning.',
            btn: 'View Cascade Map',
            page: 'supply',
            color: 'var(--yellow)'
          },
          {
            title: 'Auto Credit Memo',
            desc: 'Full 5-page credit memo generated in 45 seconds. RM reviews and signs. Saves 3 hours per application.',
            btn: 'Generate Memo',
            page: 'memo',
            color: 'var(--green)'
          },
        ].map(m => (
          <div className="card" key={m.title} style={{borderTop:`2px solid ${m.color}`}}>
            <div style={{fontSize:14,fontWeight:600,color:'var(--text)',marginBottom:8}}>{m.title}</div>
            <div style={{fontSize:12,color:'var(--text2)',lineHeight:1.6,marginBottom:14}}>{m.desc}</div>
            <button className="btn btn-outline" style={{width:'100%'}} onClick={() => onNavigate(m.page)}>
              {m.btn} →
            </button>
          </div>
        ))}
      </div>

      <div className="alert alert-yellow" style={{marginTop:16}}>
        <strong>Active Alert:</strong> Karim Yarn Mills (Narayanganj) — Risk Score 82/100.
        3 connected buyers flagged. Total exposed: ৳350L.
        <span style={{marginLeft:8,textDecoration:'underline',cursor:'pointer'}}
          onClick={() => onNavigate('supply')}>
          View cascade →
        </span>
      </div>
    </div>
  )
}
