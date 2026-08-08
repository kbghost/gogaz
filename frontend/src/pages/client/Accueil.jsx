import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/ui/Navbar'
import HeroSlider from '../../components/ui/HeroSlider'
import ProductImage from '../../components/ui/ProductImage'
import Icon from '../../components/ui/Icons'
import { produitAPI } from '../../services/api'
import { formatPrix, marqueColors } from '../../utils/helpers'

const STEPS = [
  { n: '01', icon: 'cart', title: 'Choisissez', desc: 'Marque + format de bouteille' },
  { n: '02', icon: 'map-pin', title: 'Localisez', desc: 'GPS automatique ou carte' },
  { n: '03', icon: 'check', title: 'Confirmez', desc: 'Paiement cash à livraison' },
  { n: '04', icon: 'zap', title: 'Recevez', desc: 'Livreur tracé en temps réel' },
]

const STATS = [
  { val: '500+', label: 'Clients satisfaits', icon: 'users' },
  { val: '<30min', label: 'Délai de livraison', icon: 'zap' },
  { val: '4', label: 'Marques disponibles', icon: 'cart' },
  { val: '24/7', label: 'Service actif', icon: 'clock' },
]

export default function Accueil() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: produits = [] } = useQuery({
    queryKey: ['produits'],
    queryFn: async () => {
      const res = await produitAPI.getAll()
      return res.data
    },
  })

  const goCommander = () => {
    navigate('/commander')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', color: 'var(--c-text)' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{ paddingTop: '80px', paddingBottom: '40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <HeroSlider />
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
            <button onClick={goCommander} className="btn-primary glow" style={{ fontSize: '1rem', padding: '14px 28px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Icon name="cart" size={18} /> Commander maintenant
            </button>
            <Link to="/tarifs" className="btn-secondary" style={{ fontSize: '1rem', padding: '14px 22px' }}>
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ borderTop: '1px solid var(--c-border)', borderBottom: '1px solid var(--c-border)', background: 'var(--c-surface)', padding: '24px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '4px', color: 'var(--c-muted)', display: 'flex', justifyContent: 'center' }}>
                <Icon name={s.icon} size={28} />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--c-brand)' }}>{s.val}</div>
              <div style={{ color: 'var(--c-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-body)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section style={{ padding: '60px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', color: 'var(--c-text)', marginBottom: '8px' }}>
              Comment ça marche ?
            </h2>
            <p style={{ color: 'var(--c-muted)', fontSize: '0.95rem' }}>Livraison de gaz en 4 étapes simples</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {STEPS.map((s) => (
              <div key={s.n} style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '18px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-8px', right: '-2px', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '4.5rem', color: 'rgba(249,124,10,0.06)', lineHeight: 1 }}>{s.n}</div>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(249,124,10,0.1)', border: '1px solid rgba(249,124,10,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: 'var(--c-brand)' }}>
                  <Icon name={s.icon} size={20} />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--c-brand)', marginBottom: '6px', letterSpacing: '0.06em' }}>ÉTAPE {s.n}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-text)', marginBottom: '6px' }}>{s.title}</h3>
                <p style={{ color: 'var(--c-muted)', fontSize: '0.83rem', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessories Banner */}
      <section style={{ padding: '40px 0 80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '24px', padding: '32px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--c-text)', marginBottom: '8px' }}>
                Besoin d'un détendeur ou tuyau de gaz ?
              </h3>
              <p style={{ color: 'var(--c-muted)', fontSize: '0.9rem' }}>
                Découvrez notre catalogue d'accessoires de sécurité certifiés.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexShrink: 0, alignItems: 'center' }}>
              {[{ i: 'tool', color: 'var(--c-brand)' }, { i: 'circle', color: '#a16207' }, { i: 'fire', color: '#f97316' }].map((icon, i) => (
                <div key={i} style={{
                  width: '50px', height: '50px', borderRadius: '14px',
                  background: 'var(--c-surface2)', border: '1px solid var(--c-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: `float ${3 + i * 0.4}s ease-in-out ${i * 0.3}s infinite`,
                }}>
                  <Icon name={icon.i} size={22} color={icon.color} />
                </div>
              ))}
              <Link to="/accessoires" className="btn-secondary" style={{ marginLeft: '12px' }}>
                Voir accessoires →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--c-border)', padding: '24px 0', background: 'var(--c-surface)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-dim)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="truck" size={18} /> <span>GoGaz <span style={{ fontWeight: 400, opacity: 0.6 }}>Bénin</span></span>
          </div>
          <div style={{ color: 'var(--c-muted)', fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} GoGaz Bénin. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}

