import { useState } from 'react'
import Navbar from '../../components/ui/Navbar'
import toast from 'react-hot-toast'

const INFOS = [
  { icon: '📞', label: 'Téléphone', val: '+229 97 00 00 00', sub: 'Disponible 24h/7j' },
  { icon: '📧', label: 'Email', val: 'contact@gogaz.bj', sub: 'Réponse sous 24h' },
  { icon: '📍', label: 'Zone couverte', val: 'Cotonou & environs', sub: 'Livraison rapide' },
]

export default function Contact() {
  const [form, setForm] = useState({ nom: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nom || !form.message) { toast.error('Nom et message requis.'); return }
    setSent(true)
    toast.success('Message envoyé ! Nous vous répondons sous 24h.')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(90px,14vw,120px) 20px 80px' }}>

        <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div className="pill" style={{ marginBottom: '16px', display: 'inline-flex' }}>Nous contacter</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.8rem,6vw,3rem)', color: 'var(--c-text)', letterSpacing: '-0.02em', marginBottom: '12px' }}>
            Une question ?
          </h1>
          <p style={{ color: 'var(--c-muted)', fontFamily: 'var(--font-body)', fontSize: '1rem' }}>
            Notre équipe est disponible 24h/7j pour vous aider.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: '24px' }}>

          {/* Infos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {INFOS.map((info, i) => (
              <div key={i} className="card" style={{ padding: '22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                  background: 'rgba(249,124,10,0.1)', border: '1px solid rgba(249,124,10,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
                }}>{info.icon}</div>
                <div>
                  <div style={{ color: 'var(--c-dim)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>{info.label}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-text)', fontSize: '0.95rem' }}>{info.val}</div>
                  <div style={{ color: 'var(--c-muted)', fontSize: '0.78rem', fontFamily: 'var(--font-body)' }}>{info.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="card animate-slide-up" style={{ padding: '28px' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-text)', marginBottom: '8px' }}>Message envoyé !</h3>
                <p style={{ color: 'var(--c-muted)', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>Nous vous répondons sous 24 heures.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-text)', fontSize: '1.05rem' }}>Envoyer un message</h3>
                <div>
                  <label className="label">Nom *</label>
                  <input type="text" className="input-field" placeholder="Votre nom complet"
                    value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input-field" placeholder="votre@email.com"
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Message *</label>
                  <textarea className="input-field" rows={4} style={{ resize: 'vertical', minHeight: '100px' }}
                    placeholder="Votre message…"
                    value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                </div>
                <button type="submit" className="btn-primary">Envoyer →</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
