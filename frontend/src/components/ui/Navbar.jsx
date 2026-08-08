import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from './ThemeToggle'
import Logo from './Logo'

import Icon from './Icons'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  useEffect(() => { setOpen(false) }, [location.pathname])

  const handleLogout = () => { logout(); navigate('/'); setOpen(false) }

  const navLinks = [
    { to: '/', label: 'Accueil', end: true },
    { to: '/commander', label: 'Commander du gaz' },
    { to: '/accessoires', label: 'Accessoires' },
    { to: '/tarifs', label: 'Tarifs' },
    { to: '/suivi', label: 'Suivi' },
    { to: '/a-propos', label: 'À propos' },
  ]

  const navStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    background: scrolled ? 'rgba(8,8,7,0.96)' : 'rgba(8,8,7,0.5)',
    backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
    borderBottom: scrolled ? '1px solid var(--c-border)' : '1px solid transparent',
    transition: 'background 0.3s ease, border-color 0.3s ease',
    paddingTop: 'env(safe-area-inset-top)',
  }

  return (
    <>
      <nav style={navStyle}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <Logo height={36} showText={true} />
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'none', alignItems: 'center', gap: '2px' }} className="nav-desktop">
            {navLinks.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
                padding: '7px 13px', borderRadius: '8px', textDecoration: 'none',
                fontSize: '0.85rem', fontFamily: 'var(--font-display)', fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--c-brand)' : 'var(--c-muted)',
                background: isActive ? 'rgba(249,124,10,0.1)' : 'transparent',
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              })}>
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="nav-desktop" style={{ display: 'none', alignItems: 'center', gap: '8px' }}>
                  {user.role === 'admin'   && <Link to="/admin"            style={linkStyle}><span style={{ display:'inline-flex', alignItems:'center', gap:'6px' }}>Dashboard <Icon name="arrow-right" size={14} /></span></Link>}
                  {user.role === 'livreur' && <Link to="/livreur"          style={linkStyle}><span style={{ display:'inline-flex', alignItems:'center', gap:'6px' }}>Livraisons <Icon name="arrow-right" size={14} /></span></Link>}
                  {user.role === 'client'  && <Link to="/mes-commandes"    style={linkStyle}><span style={{ display:'inline-flex', alignItems:'center', gap:'6px' }}>Mes commandes <Icon name="arrow-right" size={14} /></span></Link>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 12px 5px 7px', background: 'var(--c-surface2)', border: '1px solid var(--c-border)', borderRadius: '99px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg,#f97c0a,#e53935)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.72rem', fontWeight: 800, fontFamily: 'var(--font-display)', flexShrink: 0 }}>
                    {user.nom.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ color: 'var(--c-muted)', fontSize: '0.82rem', fontFamily: 'var(--font-body)' }} className="hide-xs">{user.nom.split(' ')[0]}</span>
                  <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-dim)', fontSize: '0.65rem', padding: '2px', lineHeight: 1 }} title="Déconnexion"><Icon name="x" size={16} /></button>
                </div>
              </div>
            ) : (
              <div className="nav-desktop" style={{ display: 'none', gap: '8px' }}>
                <Link to="/login"    className="btn-secondary" style={{ padding: '9px 16px', fontSize: '0.85rem' }}>Connexion</Link>
                <Link to="/commander" className="btn-primary"  style={{ padding: '9px 16px', fontSize: '0.85rem', display:'inline-flex', alignItems:'center', gap:'6px' }}>Commander <Icon name="arrow-right" size={14} /></Link>
            <ThemeToggle size={36} />

            {/* Hamburger */}
            <button onClick={() => setOpen(v => !v)} style={{ width: '40px', height: '40px', borderRadius: '10px', background: open ? 'var(--c-border)' : 'var(--c-surface2)', border: '1px solid var(--c-border2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px', cursor: 'pointer', transition: 'all 0.15s' }} className="nav-mobile" aria-label="Menu">
              {[0,1,2].map(i => (
                <span key={i} style={{ display: 'block', height: '2px', borderRadius: '2px', background: 'var(--c-text)', transition: 'all 0.25s', width: i===1&&open ? '0' : '18px', transform: open ? (i===0?'rotate(45deg) translate(5px,5px)':i===2?'rotate(-45deg) translate(5px,-5px)':'none') : 'none', opacity: i===1&&open ? 0 : 1 }} />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* Backdrop */}
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />}

      {/* Mobile drawer */}
      <div style={{ position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 100, background: 'rgba(17,17,16,0.98)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid var(--c-border)', transform: open ? 'translateY(0)' : 'translateY(-120%)', transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)' }} className="nav-mobile">
        <div style={{ padding: '14px 16px 20px' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', marginBottom: '12px', background: 'var(--c-surface2)', borderRadius: '14px', border: '1px solid var(--c-border)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg,#f97c0a,#e53935)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>{user.nom.charAt(0).toUpperCase()}</div>
              <div>
                <div style={{ color: 'var(--c-text)', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '0.95rem' }}>{user.nom}</div>
                <div style={{ color: 'var(--c-muted)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', textTransform: 'capitalize' }}>{user.role}</div>
              </div>
            </div>
          )}

          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)} style={{ display: 'block', padding: '12px 14px', borderRadius: '12px', textDecoration: 'none', color: location.pathname === to ? 'var(--c-brand)' : 'var(--c-muted)', background: location.pathname === to ? 'rgba(249,124,10,0.1)' : 'transparent', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '2px' }}>
              {label}
            </Link>
          ))}

          {user?.role === 'client'  && <Link to="/mes-commandes" onClick={() => setOpen(false)} style={mobileLink}><Icon name="package" size={16} /> Mes commandes</Link>}
          {user?.role === 'admin'   && <Link to="/admin"         onClick={() => setOpen(false)} style={mobileLink}><Icon name="dashboard" size={16} /> Dashboard Admin</Link>}
          {user?.role === 'livreur' && <Link to="/livreur"       onClick={() => setOpen(false)} style={mobileLink}><Icon name="truck" size={16} /> Mes livraisons</Link>}

          <div style={{ borderTop: '1px solid var(--c-border)', marginTop: '12px', paddingTop: '12px' }}>
            {user ? (
              <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '12px', border: 'none', background: 'rgba(248,113,113,0.08)', color: '#f87171', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                <Icon name="logout" size={16} /> Déconnexion
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to="/login"    onClick={() => setOpen(false)} className="btn-secondary" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>Connexion</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary"   style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>S'inscrire</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) { .nav-mobile { display: none !important; } .nav-desktop { display: flex !important; } }
        @media (max-width: 899px) { .hide-xs { display: none; } }
      `}</style>
    </>
  )
}

const linkStyle = { color: 'var(--c-brand)', fontSize: '0.85rem', fontFamily: 'var(--font-display)', fontWeight: 600, textDecoration: 'none' }
const mobileLink = { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 14px', borderRadius: '12px', textDecoration: 'none', color: 'var(--c-muted)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }
