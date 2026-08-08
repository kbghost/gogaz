import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { useEffect, useState } from 'react'
import ThemeToggle from '../../components/ui/ThemeToggle'
import Icon from '../../components/ui/Icons'
import toast from 'react-hot-toast'

const NAV = [
  { to:'/admin',              label:'Dashboard',    icon:'dashboard', end:true },
  { to:'/admin/commandes',    label:'Commandes',    icon:'package' },
  { to:'/admin/produits',     label:'Produits',     icon:'fuel' },
  { to:'/admin/accessoires',  label:'Accessoires',  icon:'wrench' },
  { to:'/admin/slider',       label:'Slider',       icon:'image' },
  { to:'/admin/utilisateurs', label:'Utilisateurs', icon:'users' },
  { to:'/admin/carte',        label:'Carte live',   icon:'map' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const { on, connected } = useSocket()
  const navigate = useNavigate()
  const [newOrders, setNewOrders] = useState(0)

  useEffect(() => {
    const unsub = on('nouvelle_commande', (c) => {
      setNewOrders(n => n+1)
      toast.success(`🔥 Nouvelle commande: ${c.numeroCommande}`, { duration:5000 })
    })
    return () => { if (typeof unsub==='function') unsub() }
  }, [on])

  const handleLogout = () => { logout(); navigate('/login') }

  const navLinkStyle = (isActive) => ({
    display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px',
    borderRadius:'10px', textDecoration:'none', cursor:'pointer',
    fontFamily:'var(--font-display)', fontWeight: isActive ? 700 : 500, fontSize:'0.875rem',
    color: isActive ? 'var(--c-brand)' : 'var(--c-muted)',
    background: isActive ? 'rgba(249,124,10,0.1)' : 'transparent',
    border: isActive ? '1px solid rgba(249,124,10,0.2)' : '1px solid transparent',
    transition:'all 0.15s', minHeight:'42px',
  })

  return (
    <div style={{ minHeight:'100vh', background:'var(--c-bg)' }}>

      {/* Desktop sidebar */}
      <aside style={{ display:'none', position:'fixed', top:0, left:0, bottom:0, width:'240px', background:'var(--c-surface)', borderRight:'1px solid var(--c-border)', flexDirection:'column', zIndex:40 }} className="lg-flex">

        {/* Brand */}
        <div style={{ padding:'20px 16px', borderBottom:'1px solid var(--c-border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:'linear-gradient(135deg,#f97c0a,#e53935)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 16px rgba(249,124,10,0.35)' }}>
              <Icon name="fire" color="#fff" size={18} />
            </div>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:800, color:'var(--c-text)', fontSize:'0.95rem', lineHeight:1 }}>GoGaz</div>
              <div style={{ color:'var(--c-brand)', fontSize:'0.68rem', fontFamily:'var(--font-mono)', marginTop:'2px' }}>Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'12px 8px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'2px' }}>
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} style={({ isActive }) => navLinkStyle(isActive)}>
              <span style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'22px', flexShrink:0 }}>
                <Icon name={item.icon} size={18} />
              </span>
              <span style={{ flex:1 }}>{item.label}</span>
              {item.label==='Commandes' && newOrders>0 && (
                <span style={{ background:'var(--c-brand)', color:'#fff', fontSize:'0.65rem', fontFamily:'var(--font-mono)', borderRadius:'99px', padding:'2px 6px', fontWeight:700 }}>
                  {newOrders>9?'9+':newOrders}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding:'12px', borderTop:'1px solid var(--c-border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px', background:'var(--c-surface2)', borderRadius:'12px', marginBottom:'8px' }}>
            <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:'rgba(249,124,10,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--c-brand)', fontFamily:'var(--font-display)', fontWeight:800, fontSize:'0.9rem', flexShrink:0 }}>
              {user?.nom?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:600, color:'var(--c-text)', fontSize:'0.82rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.nom}</div>
              <div style={{ display:'flex', alignItems:'center', gap:'5px', marginTop:'2px' }}>
                <div style={{ width:'6px', height:'6px', borderRadius:'50%', background: connected ? '#4ade80' : '#f87171', flexShrink:0 }} />
                <span style={{ color:'var(--c-dim)', fontSize:'0.65rem', fontFamily:'var(--font-mono)' }}>{connected?'En ligne':'Hors ligne'}</span>
              </div>
            </div>
            <ThemeToggle size={28} />
          </div>
          <button onClick={handleLogout} style={{ width:'100%', padding:'10px', borderRadius:'10px', background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', color:'#f87171', fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.82rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
            <Icon name="logout" size={16} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile top header */}
      <header style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, background:'rgba(17,17,16,0.96)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--c-border)', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', paddingTop:'env(safe-area-inset-top)' }} className="lg-hide">
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:'linear-gradient(135deg,#f97c0a,#e53935)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name="fire" color="#fff" size={16} />
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:800, color:'var(--c-text)', fontSize:'0.9rem' }}>GoGaz <span style={{ color:'var(--c-brand)' }}>Admin</span></span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <div style={{ width:'7px', height:'7px', borderRadius:'50%', background: connected ? '#4ade80' : '#f87171' }} />
          <ThemeToggle size={30} />
          <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'rgba(249,124,10,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--c-brand)', fontFamily:'var(--font-display)', fontWeight:800, fontSize:'0.85rem' }}>
            {user?.nom?.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ paddingLeft:0, minHeight:'100vh', paddingBottom:'72px' }} className="lg-ml240">
        <div style={{ paddingTop:'56px', padding:'72px 16px 80px' }} className="lg-pad">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:50, background:'rgba(8,8,7,0.96)', backdropFilter:'blur(20px)', borderTop:'1px solid var(--c-border)', display:'flex', paddingBottom:'env(safe-area-inset-bottom,0px)' }} className="lg-hide">
        {NAV.slice(0,6).map(item => (
          <NavLink key={item.to} to={item.to} end={item.end}
            style={({ isActive }) => ({
              flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:'3px', padding:'8px 0', textDecoration:'none', minHeight:'52px',
              color: isActive ? 'var(--c-brand)' : 'var(--c-dim)',
              fontFamily:'var(--font-display)', fontWeight: isActive ? 700 : 500,
              fontSize:'0.55rem', borderTop: isActive ? '2px solid var(--c-brand)' : '2px solid transparent',
              background: isActive ? 'rgba(249,124,10,0.05)' : 'transparent',
            })}>
            <span style={{ fontSize:'1.1rem', lineHeight:1, position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon name={item.icon} size={18} />
              {item.label==='Commandes' && newOrders>0 && (
                <span style={{ position:'absolute', top:'-4px', right:'-4px', background:'var(--c-brand)', color:'#fff', fontSize:'0.55rem', borderRadius:'99px', padding:'1px 4px', fontFamily:'var(--font-mono)', fontWeight:700 }}>{newOrders}</span>
              )}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
        <button onClick={handleLogout} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'3px', padding:'8px 0', minHeight:'52px', background:'none', border:'none', borderTop:'2px solid transparent', color:'rgba(248,113,113,0.6)', fontFamily:'var(--font-display)', fontWeight:500, fontSize:'0.55rem', cursor:'pointer' }}>
          <Icon name="logout" size={18} />
          <span>Quitter</span>
        </button>
      </nav>

      <style>{`
        @media (min-width:1024px) {
          .lg-flex { display:flex !important; }
          .lg-hide { display:none !important; }
          .lg-ml240 { padding-left:240px !important; }
          .lg-pad { padding:32px !important; }
        }
      `}</style>
    </div>
  )
}
