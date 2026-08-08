import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import Icon from '../components/ui/Icons'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nom: '', telephone: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Les mots de passe ne correspondent pas.'); return }
    if (form.password.length < 6) { toast.error('Minimum 6 caractères pour le mot de passe.'); return }
    setLoading(true)
    try {
      await register({ nom: form.nom, telephone: form.telephone, password: form.password })
      toast.success('Compte créé ! Bienvenue 🎉')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création du compte.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '400px', background: 'radial-gradient(ellipse, rgba(249,124,10,0.07) 0%, transparent 60%)', borderRadius: '28px', pointerEvents: 'none' }} />

      <div className="animate-scale-in" style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '20px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #f97c0a, #ff5500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 0 28px rgba(249,124,10,0.4)' }}>
              <Icon name="fire" size={20} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--c-text)' }}>Go<span style={{ color: 'var(--c-brand)' }}>Gaz</span></span>
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--c-text)', letterSpacing: '-0.02em', marginBottom: '6px' }}>Créer un compte</h1>
          <p style={{ color: 'var(--c-muted)', fontSize: '0.9rem', fontFamily: 'var(--font-body)' }}>Rejoignez GoGaz Bénin</p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {[
              { label: 'Nom complet *', key: 'nom', type: 'text', ph: 'Jean Dupont' },
              { label: 'Téléphone *', key: 'telephone', type: 'tel', ph: '+229 97 00 00 00', mono: true },
              { label: 'Mot de passe *', key: 'password', type: 'password', ph: 'Minimum 6 caractères' },
              { label: 'Confirmer *', key: 'confirm', type: 'password', ph: 'Répétez le mot de passe' },
            ].map(f => (
              <div key={f.key}>
                <label className="label">{f.label}</label>
                <input type={f.type} className="input-field" placeholder={f.ph}
                  style={f.mono ? { fontFamily: 'var(--font-mono)' } : {}}
                  value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required />
              </div>
            ))}
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '4px', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8 }} disabled={loading}>
              {loading ? <><Icon name="loader" className="animate-spin" size={16} /> Création…</> : 'Créer mon compte →'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <span style={{ color: 'var(--c-dim)', fontSize: '0.875rem', fontFamily: 'var(--font-body)' }}>
              Déjà un compte ?{' '}
              <Link to="/login" style={{ color: '#f97c0a', textDecoration: 'none', fontWeight: 600 }}>Se connecter</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
