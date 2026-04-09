import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GasBottle from '../components/ui/GasBottle'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ telephone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.telephone, form.password)
      toast.success(`Bienvenue, ${user.nom.split(' ')[0]} !`)
      if (user.role === 'admin') navigate('/admin')
      else if (user.role === 'livreur') navigate('/livreur')
      else navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Identifiants incorrects.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--c-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '400px', background: 'radial-gradient(ellipse, rgba(249,124,10,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="animate-scale-in" style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #f97c0a, #ff5500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 0 28px rgba(249,124,10,0.4)' }}>🔥</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--c-text)' }}>Go<span style={{ color: '#f97c0a' }}>Gaz</span></span>
          </Link>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px', alignItems: 'flex-end' }}>
            {[['#E53935',6,'Oryx'], ['#f97c0a',12.5,'Total'], ['#16a34a',25,'Bénin']].map(([c,p,m],i) => (
              <div key={i} style={{ animation: `float ${3+i*0.5}s ease-in-out ${i*0.2}s infinite`, transform: i===1?'none':'translateY(8px)' }}>
                <GasBottle color={c} poids={p} size={i===1?60:44} marque={m} />
              </div>
            ))}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--c-text)', letterSpacing: '-0.02em', marginBottom: '6px' }}>Bon retour !</h1>
          <p style={{ color: 'var(--c-muted)', fontSize: '0.9rem', fontFamily: 'var(--font-body)' }}>Connectez-vous à votre compte</p>
        </div>

        {/* Form */}
        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label className="label">Numéro de téléphone</label>
              <input type="tel" className="input-field" placeholder="+229 97 00 00 00"
                style={{ fontFamily: 'var(--font-mono)' }}
                value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'} className="input-field"
                  placeholder="••••••••" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPwd(v => !v)} style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-dim)', fontSize: '1rem',
                }}>{showPwd ? '🙈' : '👁️'}</button>
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '4px' }} disabled={loading}>
              {loading ? '⏳ Connexion…' : 'Se connecter →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <span style={{ color: 'var(--c-dim)', fontSize: '0.875rem', fontFamily: 'var(--font-body)' }}>
              Pas encore de compte ?{' '}
              <Link to="/register" style={{ color: '#f97c0a', textDecoration: 'none', fontWeight: 600 }}>S'inscrire</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
