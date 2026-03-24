import { useState, useEffect } from 'react'

// Fixed node positions for the canvas (percentage-based)
const NODE_POSITIONS = {
  C1: { x: 44, y: 8 },
  C2: { x: 22, y: 38 },
  C3: { x: 62, y: 38 },
  C4: { x: 44, y: 62 },
  C5: { x: 70, y: 78 },
  C6: { x: 70, y: 93 },
  C7: { x: 22, y: 62 },
}

function EdgeLayer({ edges, companies, stressedId }) {
  if (!companies.length) return null
  const compMap = Object.fromEntries(companies.map(c => [c.id, c]))
  return (
    <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}>
      {edges.map((e, i) => {
        const src = NODE_POSITIONS[e.source]
        const tgt = NODE_POSITIONS[e.target]
        if (!src || !tgt) return null
        const srcC = compMap[e.source]
        const isActive = srcC && (srcC.status === 'STRESSED' || srcC.status === 'HIGH_RISK')
        return (
          <line key={i}
            x1={`${src.x + 7}%`} y1={`${src.y + 4.5}%`}
            x2={`${tgt.x + 7}%`} y2={`${tgt.y + 2}%`}
            stroke={isActive ? '#ff4d4f' : '#1e2530'}
            strokeWidth={isActive ? 2 : 1}
            strokeDasharray={isActive ? '4 3' : ''}
            opacity={isActive ? 0.7 : 0.4}
          />
        )
      })}
    </svg>
  )
}

export default function SupplyChain() {
  const [graphData, setGraphData] = useState({ companies: [], edges: [] })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [stressedId, setStressedId] = useState(null)
  const [animStep, setAnimStep] = useState(0)

  useEffect(() => {
    fetch('/api/supply-chain/graph')
      .then(r => r.json())
      .then(setGraphData)
      .catch(() => {
        // Use static demo data if backend not available
        setGraphData({
          companies: [
            {id:'C1',name:'Karim Yarn Mills',industry:'textile',loan_lac:280,risk_score:82,district:'Narayanganj'},
            {id:'C2',name:'Rahman Fabrics',industry:'textile',loan_lac:350,risk_score:54,district:'Narayanganj'},
            {id:'C3',name:'Dhaka Knit Ltd',industry:'textile',loan_lac:210,risk_score:33,district:'Dhaka'},
            {id:'C4',name:'Excel Garments',industry:'textile',loan_lac:480,risk_score:18,district:'Chittagong'},
            {id:'C5',name:'Star Trading Co',industry:'trading',loan_lac:120,risk_score:29,district:'Dhaka'},
            {id:'C6',name:'Prime Retail',industry:'retail',loan_lac:95,risk_score:29,district:'Gazipur'},
            {id:'C7',name:'Noor Enterprise',industry:'manufacturing',loan_lac:165,risk_score:8,district:'Bogura'},
          ],
          edges: [
            {source:'C1',target:'C2',dependency_pct:65},{source:'C1',target:'C3',dependency_pct:40},
            {source:'C2',target:'C4',dependency_pct:55},{source:'C3',target:'C4',dependency_pct:35},
            {source:'C4',target:'C5',dependency_pct:30},{source:'C5',target:'C6',dependency_pct:25},
            {source:'C2',target:'C7',dependency_pct:20},
          ]
        })
      })
  }, [])

  const triggerCascade = async (nodeId) => {
    setLoading(true); setStressedId(nodeId); setResult(null); setAnimStep(0)
    try {
      const res = await fetch('/api/supply-chain/cascade', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({stressed_node_id: nodeId})
      })
      const data = await res.json()
      if (data.success) {
        setResult(data.result)
        // Animate steps
        let step = 0
        const interval = setInterval(() => {
          step++; setAnimStep(step)
          if (step >= 3) clearInterval(interval)
        }, 600)
      }
    } catch (e) {
      // Static demo cascade
      const staticResult = {
        stressed_node: nodeId,
        companies: graphData.companies.map(c => {
          if (c.id === nodeId) return {...c, cascade_risk: 82, status:'STRESSED', color:'red'}
          if (c.id === 'C2') return {...c, cascade_risk: 53, status:'WATCH', color:'yellow'}
          if (c.id === 'C3') return {...c, cascade_risk: 33, status:'WATCH', color:'yellow'}
          if (c.id === 'C4') return {...c, cascade_risk: 21, status:'NORMAL', color:'green'}
          return {...c, status:'NORMAL', color:'green'}
        }),
        edges: graphData.edges,
        total_exposed_lac: 560,
        cascade_count: 2
      }
      setResult(staticResult)
      let step = 0
      const interval = setInterval(() => {
        step++; setAnimStep(step)
        if (step >= 3) clearInterval(interval)
      }, 700)
    }
    setLoading(false)
  }

  const displayCompanies = result ? result.companies : graphData.companies
  const displayEdges     = result ? result.edges     : graphData.edges

  const getNodeColor = (c) => {
    if (!result) return '#2a3340'
    if (c.color === 'red')    return 'var(--red-border)'
    if (c.color === 'yellow') return 'var(--yellow-border)'
    return 'var(--border2)'
  }
  const getNodeBg = (c) => {
    if (!result) return 'var(--bg3)'
    if (c.color === 'red')    return 'var(--red-bg)'
    if (c.color === 'yellow') return 'var(--yellow-bg)'
    return 'var(--bg3)'
  }
  const getNodeTextColor = (c) => {
    if (!result) return 'var(--text2)'
    if (c.color === 'red')    return 'var(--red)'
    if (c.color === 'yellow') return 'var(--yellow)'
    return 'var(--text2)'
  }

  return (
    <div className="page">
      <div className="page-title">Supply Chain Contagion Risk</div>
      <div className="page-sub">
        Select a company to simulate a default. Watch the cascade propagate through connected buyers in real-time.
      </div>

      <div style={{marginBottom:14}}>
        <div style={{fontSize:12,color:'var(--text3)',marginBottom:8,fontFamily:'var(--mono)'}}>
          TRIGGER CASCADE FROM:
        </div>
        <div className="cascade-controls">
          {graphData.companies.map(c => (
            <button key={c.id}
              className={`cascade-btn ${stressedId === c.id ? 'active-stress' : ''}`}
              onClick={() => triggerCascade(c.id)}
              disabled={loading}>
              {c.name}
              <span style={{marginLeft:6,opacity:.6}}>Risk: {c.risk_score}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="col-2">
        <div>
          {/* Canvas */}
          <div className="cascade-canvas">
            <EdgeLayer edges={displayEdges} companies={displayCompanies} stressedId={stressedId} />
            {displayCompanies.map(c => {
              const pos = NODE_POSITIONS[c.id]
              if (!pos) return null
              const risk = result
                ? (result.companies.find(x => x.id === c.id) || c).cascade_risk || c.risk_score
                : c.risk_score
              return (
                <div key={c.id}
                  className={`company-node ${result ? c.color || 'green' : ''} ${c.id === stressedId ? 'pulse' : ''}`}
                  style={{
                    left:`${pos.x}%`, top:`${pos.y}%`,
                    background: getNodeBg(c),
                    borderColor: getNodeColor(c),
                    color: getNodeTextColor(c),
                    transform:'translateX(-50%)',
                    transition: 'all .5s ease',
                  }}>
                  <div className="node-name">{c.name}</div>
                  <div className="node-risk">Risk: {Math.round(risk)}</div>
                  <div className="node-loan">৳{c.loan_lac}L</div>
                  {c.id === stressedId && result && (
                    <div style={{fontSize:9,color:'var(--red)',marginTop:2,fontWeight:600}}>⚠ STRESSED</div>
                  )}
                </div>
              )
            })}
            {loading && (
              <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',
                justifyContent:'center',background:'rgba(10,12,15,.7)'}}>
                <div className="memo-loading">
                  <div className="spinner"/>Simulating cascade propagation...
                </div>
              </div>
            )}
          </div>

          <div className="cascade-legend">
            <div className="legend-item"><div className="legend-dot" style={{background:'var(--red)'}}/> Stressed / High Risk</div>
            <div className="legend-item"><div className="legend-dot" style={{background:'var(--yellow)'}}/> Watch</div>
            <div className="legend-item"><div className="legend-dot" style={{background:'var(--green)'}}/> Normal</div>
          </div>
        </div>

        {/* Result panel */}
        <div>
          {!result && (
            <div className="card" style={{height:'100%',display:'flex',alignItems:'center',
              justifyContent:'center',flexDirection:'column',gap:8,minHeight:280}}>
              <div style={{fontSize:28,opacity:.1}}>⟳</div>
              <div style={{color:'var(--text3)',fontSize:13}}>Select a company to trigger cascade simulation</div>
            </div>
          )}
          {result && (
            <>
              <div className="card" style={{marginBottom:14,borderTop:'2px solid var(--red)'}}>
                <div className="card-title">Cascade Impact Summary</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
                  <div style={{background:'var(--bg3)',borderRadius:4,padding:'10px 12px'}}>
                    <div style={{fontSize:11,color:'var(--text3)',marginBottom:4}}>Clients Affected</div>
                    <div style={{fontFamily:'var(--mono)',fontSize:22,color:'var(--red)'}}>
                      {result.cascade_count}
                    </div>
                  </div>
                  <div style={{background:'var(--bg3)',borderRadius:4,padding:'10px 12px'}}>
                    <div style={{fontSize:11,color:'var(--text3)',marginBottom:4}}>Portfolio Exposed</div>
                    <div style={{fontFamily:'var(--mono)',fontSize:22,color:'var(--yellow)'}}>
                      ৳{result.total_exposed_lac}L
                    </div>
                  </div>
                </div>

                <table className="kv-table">
                  <tbody>
                    {result.companies.map(c => (
                      <tr key={c.id}>
                        <td style={{color: c.color === 'red' ? 'var(--red)' : c.color === 'yellow' ? 'var(--yellow)' : 'var(--text2)'}}>
                          {c.name}
                        </td>
                        <td style={{fontFamily:'var(--mono)',fontSize:12,
                          color: c.color === 'red' ? 'var(--red)' : c.color === 'yellow' ? 'var(--yellow)' : 'var(--text2)'}}>
                          {c.status} · {Math.round(c.cascade_risk)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card">
                <div className="card-title">Recommended Actions</div>
                {result.companies.filter(c => c.status === 'WATCH' || c.status === 'HIGH_RISK').map(c => (
                  <div key={c.id} style={{
                    padding:'10px 12px',borderRadius:4,marginBottom:8,
                    background: c.color === 'red' ? 'var(--red-bg)' : 'var(--yellow-bg)',
                    border: `1px solid ${c.color === 'red' ? 'var(--red-border)' : 'var(--yellow-border)'}`,
                  }}>
                    <div style={{fontWeight:500,fontSize:12,marginBottom:3,
                      color: c.color === 'red' ? 'var(--red)' : 'var(--yellow)'}}>
                      {c.name} — {c.status}
                    </div>
                    <div style={{fontSize:11,color:'var(--text2)'}}>
                      Outstanding: ৳{c.loan_lac}L · Cascade risk: {Math.round(c.cascade_risk)}
                    </div>
                    <div style={{fontSize:11,marginTop:4,color:'var(--text2)'}}>
                      → RM visit within {c.cascade_risk > 50 ? '7 days' : '14 days'}. Review payment schedule.
                    </div>
                  </div>
                ))}
                {result.companies.filter(c => c.status === 'WATCH' || c.status === 'HIGH_RISK').length === 0 && (
                  <div style={{color:'var(--text3)',fontSize:13}}>No immediate actions required.</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
