import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import ThemeToggle from '../../components/ui/ThemeToggle'
import Icon from '../../components/ui/Icons'

const TABS = [
  { to:'/livreur',             label:'Accueil',      icon:'home', end:true },
  { to:'/livreur/commandes',   label:'Gaz',          icon:'fuel' },
  { to:'/livreur/accessoires', label:'Accessoires',  icon:'wrench' },
]

export default function LivreurLayout() {
  const { user, logout } = useAuth()
  const { connected } = useSocket()
  const navigate = useNavigate()

  return (
    <div style={{ minHeight:'100vh', background:'var(--c-bg)', display:'flex', flexDirection:'column' }}>

      {/* Header */}
      <header style={{
        position:'sticky', top:0, zIndex:50,
        background:'rgba(17,17,16,0.96)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
        borderBottom:'1px solid var(--c-border)',
        paddingTop:'env(safe-area-inset-top)',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', height:'56px' }}>

          {/* Left: brand */}
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{
              width:'36px', height:'36px', borderRadius:'10px',
              background:'linear-gradient(135deg,#f97c0a,#e53935)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 0 16px rgba(249,124,10,0.3)',
            }}><Icon name="truck" color="#fff" size={20} /></div>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:800, color:'var(--c-text)', fontSize:'0.95rem', lineHeight:1 }}>
                Espace Livreur
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'5px', marginTop:'3px' }}>
                <div style={{ width:'6px', height:'6px', borderRadius:'50%', background: connected ? '#4ade80' : '#f87171' }} />
                <span style={{ fontSize:'0.65rem', color:'var(--c-muted)', fontFamily:'var(--font-mono)' }}>
                  {connected ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: user + theme + logout */}
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end' }}>
              <span style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--c-text)', fontSize:'0.82rem' }}>{user?.nom?.split(' ')[0]}</span>
              <span style={{ color:'var(--c-muted)', fontSize:'0.65rem', fontFamily:'var(--font-mono)' }}>Livreur</span>
            </div>
            <ThemeToggle size={32} />
            <button
              onClick={() => { logout(); navigate('/login') }}
              title="Déconnexion"
              style={{
                width:'34px', height:'34px', borderRadius:'8px',
                background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.2)',
                color:'#f87171', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}><Icon name="logout" size={16} /></button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{ flex:1, padding:'16px 16px 80px', maxWidth:'680px', margin:'0 auto', width:'100%' }}>
        <Outlet />
      </main>

      {/* Bottom tabs */}
      <nav style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:50,
        background:'rgba(8,8,7,0.97)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
        borderTop:'1px solid var(--c-border)',
        display:'flex',
        paddingBottom:'env(safe-area-inset-bottom,0px)',
      }}>
        {TABS.map(tab => (
          <NavLink key={tab.to} to={tab.to} end={tab.end}
            style={({ isActive }) => ({
              flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:'4px', padding:'10px 0', textDecoration:'none',
              minHeight:'56px',
              color: isActive ? 'var(--c-brand)' : 'var(--c-dim)',
              fontFamily:'var(--font-display)', fontWeight: isActive ? 700 : 500,
              fontSize:'0.6rem',
              borderTop: isActive ? '2px solid var(--c-brand)' : '2px solid transparent',
              background: isActive ? 'rgba(249,124,10,0.06)' : 'transparent',
              transition:'color 0.15s',
            })}>
            <span style={{ display:'flex', alignItems:'center', justifyContent:'center' }}><Icon name={tab.icon} size={20} /></span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
