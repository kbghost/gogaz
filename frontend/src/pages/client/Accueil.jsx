import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/ui/Navbar'
import HeroSlider from '../../components/ui/HeroSlider'
import ProductImage from '../../components/ui/ProductImage'
import { produitAPI } from '../../services/api'
import { formatPrix, marqueColors } from '../../utils/helpers'

const STEPS = [
  { n: '01', icon: '⛽', title: 'Choisissez', desc: 'Marque + format de bouteille' },
  { n: '02', icon: '📍', title: 'Localisez', desc: 'GPS automatique ou carte' },
  { n: '03', icon: '✅', title: 'Confirmez', desc: 'Paiement cash à livraison' },
  { n: '04', icon: '🚀', title: 'Recevez', desc: 'Livreur tracé en temps réel' },
]

const STATS = [
  { val: '500+', label: 'Clients satisfaits', icon: '👨‍👩‍👧‍👦' },
  { val: '<30min', label: 'Délai de livraison', icon: '⚡' },
  { val: '4', label: 'Marques disponibles', icon: '⛽' },
  { val: '24/7', label: 'Service actif', icon: '🕐' },
]

export default function Accueil() {
  const [visible, setVisible] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const goCommander = () => { if (!user) navigate('/login'); else navigate('/commander') }
  const goAccessoires = () => { if (!user) navigate('/login'); else navigate('/accessoires') }

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  // Load real products with images
  const { data: produitsData } = useQuery({
    queryKey: ['produits-accueil'],
    queryFn: () => produitAPI.getAll({ disponible: true }),
    staleTime: 5 * 60 * 1000,
  })
  const produits = produitsData?.data?.produits || []

  // Group by marque and pick one per brand (12.5kg)
  const marquesFeatured = Object.values(
    produits.reduce((acc, p) => {
      if (!acc[p.marque]) acc[p.marque] = p
      else if (p.poids === 12.5) acc[p.marque] = p
      return acc
    }, {})
  ).slice(0, 4)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', overflowX: 'hidden' }}>
      <Navbar />

      {/* ── HERO SLIDER ── */}
      <div style={{ paddingTop: '64px' }}>
        <HeroSlider />
      </div>

      {/* ── QUICK STATS ── */}
      <section style={{ padding: '32px 20px', borderBottom: '1px solid var(--c-border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '16px' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--c-brand)' }}>{s.val}</div>
              <div style={{ color: 'var(--c-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-body)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HERO TEXT + CTA ── */}
      <section style={{ padding: 'clamp(50px,8vw,80px) 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', left: '-100px', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,124,10,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateY(24px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}>
              <div className="pill" style={{ marginBottom: '16px', display: 'inline-flex' }}>Livraison express</div>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--c-text)',
                fontSize: 'clamp(2rem,6vw,3.8rem)', lineHeight: 1.1,
                letterSpacing: '-0.03em', marginBottom: '16px',
              }}>
                Votre gaz livré<br />
                <span style={{ background: 'linear-gradient(135deg,#f97c0a,#ff5500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  en moins de 30 minutes
                </span>
              </h1>
              <p style={{ color: 'var(--c-muted)', fontSize: 'clamp(0.9rem,2vw,1.05rem)', lineHeight: 1.7, maxWidth: '480px', marginBottom: '28px', fontFamily: 'var(--font-body)' }}>
                Oryx, PUMA GAZ, Bénin Petro — commandez la marque de votre choix. Paiement cash à la réception.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <button onClick={goCommander} className="btn-primary glow" style={{ fontSize: '1rem', padding: '14px 28px' }}>
                  ⛽ Commander maintenant
                </button>
                <Link to="/tarifs" className="btn-secondary" style={{ fontSize: '1rem', padding: '14px 22px' }}>
                  Voir les tarifs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUITS CATALOGUE ── */}
      <section style={{ padding: 'clamp(40px,7vw,70px) 20px', borderTop: '1px solid var(--c-border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '32px' }}>
            <div>
              <div className="pill" style={{ marginBottom: '10px', display: 'inline-flex' }}>Catalogue</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.4rem,4vw,2rem)', color: 'var(--c-text)', letterSpacing: '-0.02em' }}>
                Nos marques de gaz
              </h2>
            </div>
            <Link to="/tarifs" style={{ color: 'var(--c-brand)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
              Tous les tarifs →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '16px' }}>
            {marquesFeatured.length === 0
              ? Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: '280px', borderRadius: '18px' }} />)
              : marquesFeatured.map((p, i) => {
                const color = marqueColors[p.marque] || '#f97c0a'
                return (
                  <Link key={p._id} to="/commander" style={{ textDecoration: 'none' }}
                    className="animate-slide-up"
                
                  >
                    <div style={{
                      background: 'var(--c-surface)', border: '1px solid var(--c-border)',
                      borderRadius: '18px', overflow: 'hidden',
                      transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 12px 40px ${color}20` }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--c-border)'; e.currentTarget.style.boxShadow = '' }}
                    >
                      {/* Image area */}
                      <div style={{ height: '180px', background: 'var(--c-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, ${color}18, transparent 70%)` }} />
                        <ProductImage
                          imageUrl={p.imageUrl}
                          couleur={color}
                          poids={p.poids}
                          marque={p.marque}
                          size={180}
                          objectFit="contain"
                          style={{ position: 'relative', zIndex: 1 }}
                        />
                        {/* Color stripe */}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: color }} />
                      </div>
                      {/* Info */}
                      <div style={{ padding: '18px' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--c-text)', fontSize: '1.05rem', marginBottom: '4px' }}>
                          {p.marque}
                        </div>
                        <div style={{ color: 'var(--c-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-body)', marginBottom: '12px' }}>
                          Formats : 6 · 12.5 · 25 kg
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color }}>
                          À partir de {formatPrix(p.prix)}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })
            }
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: 'clamp(40px,7vw,70px) 20px', borderTop: '1px solid var(--c-border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="pill" style={{ marginBottom: '12px', display: 'inline-flex' }}>Simple</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.4rem,4vw,2rem)', color: 'var(--c-text)', letterSpacing: '-0.02em' }}>
              Comment ça marche ?
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px' }}>
            {STEPS.map((s, i) => (
              <div key={s.n} style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '18px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-8px', right: '-2px', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '4.5rem', color: 'rgba(249,124,10,0.06)', lineHeight: 1, userSelect: 'none' }}>{s.n}</div>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(249,124,10,0.1)', border: '1px solid rgba(249,124,10,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '14px' }}>{s.icon}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--c-brand)', marginBottom: '6px', letterSpacing: '0.06em' }}>ÉTAPE {s.n}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-text)', marginBottom: '6px' }}>{s.title}</h3>
                <p style={{ color: 'var(--c-muted)', fontSize: '0.83rem', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ACCESSOIRES CTA ── */}
      <section style={{ padding: 'clamp(40px,7vw,70px) 20px', borderTop: '1px solid var(--c-border)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            borderRadius: '24px', overflow: 'hidden',
            background: 'linear-gradient(135deg, var(--c-surface) 0%, var(--c-surface2) 100%)',
            border: '1px solid var(--c-border)', padding: 'clamp(28px,5vw,48px)',
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '28px',
          }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div className="pill" style={{ marginBottom: '12px', display: 'inline-flex' }}>Nouveau</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.2rem,4vw,1.8rem)', color: 'var(--c-text)', letterSpacing: '-0.02em', marginBottom: '10px' }}>
                Boutique accessoires 🔧
              </h2>
              <p style={{ color: 'var(--c-muted)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
                Détendeurs, tuyaux, briquets, gazinières... Tout ce qu'il vous faut, livré avec votre gaz.
              </p>
              <Link to="/accessoires" className="btn-primary" style={{ fontSize: '0.95rem' }}>
                Voir la boutique →
              </Link>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
              {['🔧', '🟫', '🔥'].map((icon, i) => (
                <div key={i} style={{
                  width: '60px', height: '60px', borderRadius: '16px',
                  background: 'var(--c-border)', border: '1px solid var(--c-border2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem',
                  animation: `float ${3 + i * 0.4}s ease-in-out ${i * 0.3}s infinite`,
                }}>{icon}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--c-border)', padding: '28px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-dim)' }}>🏍️ GoGaz <span style={{ fontWeight: 400, color: 'var(--c-dim)', opacity: 0.6 }}>Bénin</span></div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {[['/', 'Accueil'], ['/tarifs', 'Tarifs'], ['/accessoires', 'Accessoires'], ['/a-propos', 'À propos'], ['/contact', 'Contact']].map(([to, label]) => (
              <Link key={to} to={to} style={{ color: 'var(--c-dim)', fontSize: '0.82rem', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>{label}</Link>
            ))}
          </div>
          <div style={{ color: 'var(--c-dim)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>© {new Date().getFullYear()} · Cotonou, Bénin</div>
        </div>
      </footer>
    </div>
  )
}
