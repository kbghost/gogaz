import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GasBottle from '../components/ui/GasBottle'
import Icon from '../components/ui/Icons'
import toast from 'react-hot-toast'

export default function Login() {
  const [telephone, setTelephone] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!telephone || !motDePasse) {
      toast.error('Veuillez remplir tous les champs')
      return
    }
    setLoading(true)
    try {
      const user = await login(telephone, motDePasse)
      toast.success(`Bienvenue, ${user.nom} !`)
      if (user.role === 'admin') navigate('/admin')
      else if (user.role === 'livreur') navigate('/livreur')
      else navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Identifiants incorrects')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--c-bg)' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '24px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px', alignItems: 'flex-end' }}>
          {[['#E53935', 6, 'Oryx'], ['#f97c0a', 12.5, 'Total'], ['#16a34a', 25, 'Bénin']].map(([c, p, m], i) => (
            <div key={i} style={{ animation: `float ${3 + i * 0.5}s ease-in-out ${i * 0.2}s infinite`, transform: i === 1 ? 'none' : 'translateY(8px)' }}>
              <GasBottle color={c} poids={p} size={i === 1 ? 60 : 44} marque={m} />
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--c-text)', marginBottom: '6px' }}>Connexion</h1>
          <p style={{ color: 'var(--c-muted)', fontSize: '0.85rem' }}>Accédez à votre espace GoGaz</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--c-text)', marginBottom: '6px' }}>Numéro de téléphone</label>
            <input
              type="tel"
              className="input-field"
              placeholder="ex: 97000000"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--c-text)', marginBottom: '6px' }}>Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                className="input-field"
                placeholder="••••••••"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                <Icon name={showPwd ? 'eye-off' : 'eye'} size={18} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            disabled={loading}
          >
            {loading ? <><Icon name="loader" className="animate-spin" size={16} /> Connexion…</> : <>Se connecter <span style={{ opacity: 0.9 }}>→</span></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--c-muted)' }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color: 'var(--c-brand)', fontWeight: 600, textDecoration: 'none' }}>S'inscrire</Link>
        </div>
      </div>
    </div>
  )
}

