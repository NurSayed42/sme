import { useState } from 'react'
import CreditScore from './pages/CreditScore'
import SupplyChain from './pages/SupplyChain'
import CreditMemo from './pages/CreditMemo'
import Dashboard from './pages/Dashboard'

const NAV = [
  { id: 'dashboard',    label: 'Portfolio Overview',  section: 'OVERVIEW' },
  { id: 'credit',       label: 'Credit Scoring',      section: 'MODULES' },
  { id: 'supply',       label: 'Supply Chain Risk',   section: null },
  { id: 'memo',         label: 'Auto Credit Memo',    section: null },
]

export default function App() {
  const [page, setPage] = useState('dashboard')

  const titles = {
    dashboard: 'Portfolio Overview',
    credit:    'AI Credit Scoring — Module 1 & 4',
    supply:    'Supply Chain Cascade — Module 5',
    memo:      'Auto Credit Memo — Module 7',
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">ABC Finance</div>
          <div className="logo-name">AI Credit Platform</div>
          <div className="logo-sub">SME Intelligence v1.0</div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map((item, i) => (
            <div key={item.id}>
              {item.section && <div className="nav-section">{item.section}</div>}
              <div
                className={`nav-item ${page === item.id ? 'active' : ''}`}
                onClick={() => setPage(item.id)}
              >
                <div className="nav-dot" />
                {item.label}
              </div>
            </div>
          ))}
        </nav>
        <div style={{padding:'16px 18px',borderTop:'1px solid var(--border)'}}>
          <div style={{fontSize:'10px',color:'var(--text3)',fontFamily:'var(--mono)'}}>
            DEMO v1.0 · March 2026
          </div>
          <div style={{fontSize:'11px',color:'var(--text3)',marginTop:'2px'}}>
            Prepared for IDLC Finance Ltd
          </div>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <span className="topbar-title">{titles[page]}</span>
          <span className="topbar-badge">LIVE DEMO</span>
        </div>
        {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
        {page === 'credit'    && <CreditScore />}
        {page === 'supply'    && <SupplyChain />}
        {page === 'memo'      && <CreditMemo />}
      </div>
    </div>
  )
}
