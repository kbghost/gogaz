import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../../components/ui/Navbar'
import { accessoireAPI, getImageUrl } from '../../services/api'
import { formatPrix } from '../../utils/helpers'

const CAT_ICONS = { 'Détendeur':'🔧','Tuyau':'🟫','Briquet':'🔥','Gazinière':'🍳','Sécurité':'🛡️','Autre':'📦' }
const CAT_COLORS = { 'Détendeur':'#3b82f6','Tuyau':'#8b5cf6','Briquet':'#f97c0a','Gazinière':'#ec4899','Sécurité':'#22c55e','Autre':'#6b7280' }

export default function Accessoires() {
  const [catFilter, setCatFilter] = useState('')

  const { data: catsData } = useQuery({ queryKey: ['acc-cats'], queryFn: accessoireAPI.getCategories })
  const { data, isLoading } = useQuery({
    queryKey: ['acc-vitrine', catFilter],
    queryFn: () => accessoireAPI.getAll({ disponible: true, categorie: catFilter || undefined }),
  })

  const categories  = catsData?.data?.categories || []
  const accessoires = data?.data?.accessoires || []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(90px,14vw,120px) 20px 80px' }}>

        {/* Hero section */}
        <div className="animate-fade-in" style={{ marginBottom: '48px' }}>
          <div className="pill" style={{ marginBottom: '14px', display: 'inline-flex' }}>Boutique</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.8rem,6vw,3rem)', color: 'var(--c-text)', letterSpacing: '-0.02em', marginBottom: '10px' }}>
                Accessoires gaz
              </h1>
              <p style={{ color: 'var(--c-muted)', fontSize: '0.95rem', fontFamily: 'var(--font-body)', maxWidth: '500px' }}>
                Détendeurs, tuyaux, briquets et plus encore. Livraison possible avec votre bouteille de gaz.
              </p>
            </div>
            <Link to="/commander-accessoires" className="btn-primary" style={{ flexShrink: 0, fontSize: '0.95rem' }}>
              🛒 Commander des accessoires →
            </Link>
          </div>
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {['', ...categories].map(cat => {
            const active = catFilter === cat
            return (
              <button key={cat||'all'} onClick={() => setCatFilter(cat)} style={{
                padding: '8px 18px', borderRadius: '99px', border: '1px solid var(--c-border)',
                background: active ? 'var(--c-brand)' : 'var(--c-surface2)',
                color: active ? '#fff' : 'var(--c-muted)',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.84rem', cursor: 'pointer',
                boxShadow: active ? '0 0 16px rgba(249,124,10,0.3)' : 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}>
                {cat ? `${CAT_ICONS[cat]||'📦'} ${cat}` : 'Tous'}
              </button>
            )
          })}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '16px' }}>
            {Array(8).fill(0).map((_,i) => <div key={i} className="skeleton" style={{ height: '300px', borderRadius: '18px' }} />)}
          </div>
        ) : accessoires.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🔧</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-text)', marginBottom: '8px' }}>Aucun accessoire</h3>
            <p style={{ color: 'var(--c-muted)', fontFamily: 'var(--font-body)' }}>Aucun produit dans cette catégorie pour le moment.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '16px' }}>
            {accessoires.map((acc, i) => {
              const imgUrl = getImageUrl(acc.imageUrl)
              const catColor = CAT_COLORS[acc.categorie] || '#6b7280'
              return (
                <div key={acc._id} className="animate-slide-up" style={{ animationDelay: `${i * 0.04}s` }}>
                  <div style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '18px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderColor=catColor; e.currentTarget.style.boxShadow=`0 12px 36px ${catColor}20` }}
                    onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.borderColor='var(--c-border)'; e.currentTarget.style.boxShadow='' }}
                  >
                    {/* Image */}
                    <div style={{ height: '140px', background: 'var(--c-surface2)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {imgUrl
                        ? <img src={imgUrl} alt={acc.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
                        : null
                      }
                      <div style={{ display: imgUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
                        <span style={{ fontSize: '3rem' }}>{CAT_ICONS[acc.categorie]||'📦'}</span>
                      </div>

                      {/* Category badge */}
                      <div style={{ position: 'absolute', top: '10px', left: '10px', background: `${catColor}cc`, backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '99px', color: '#fff', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {CAT_ICONS[acc.categorie]} {acc.categorie}
                      </div>

                      {/* Color bar */}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: catColor }} />

                      {acc.stock === 0 && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: '#f87171', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '0.9rem' }}>Rupture de stock</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-text)', fontSize: '0.93rem', lineHeight: 1.3 }}>{acc.nom}</h3>
                      {acc.description && <p style={{ color: 'var(--c-muted)', fontSize: '0.78rem', lineHeight: 1.5, flex: 1, fontFamily: 'var(--font-body)' }}>{acc.description}</p>}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--c-brand)' }}>{formatPrix(acc.prix)}</span>
                        {acc.stock > 0
                          ? <span style={{ color: '#34d399', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>En stock</span>
                          : <span style={{ color: '#f87171', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>Rupture</span>
                        }
                      </div>
                      {acc.stock > 0 && (
                        <Link to="/commander-accessoires" style={{ display: 'block', textAlign: 'center', padding: '9px', borderRadius: '10px', background: 'var(--c-brand-dim)', color: 'var(--c-brand)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.83rem', textDecoration: 'none', border: '1px solid rgba(249,124,10,0.2)', marginTop: '4px' }}>
                          Ajouter au panier →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{ marginTop: '64px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(249,124,10,0.08), var(--c-surface))', border: '1px solid rgba(249,124,10,0.18)', padding: 'clamp(24px,5vw,40px)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--c-text)', fontSize: '1.1rem', marginBottom: '8px' }}>
              💡 Livraison groupée avec votre gaz
            </h3>
            <p style={{ color: 'var(--c-muted)', fontSize: '0.88rem', fontFamily: 'var(--font-body)' }}>
              Commandez en même temps votre gaz et vos accessoires — même livreur, même délai de 30 min.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/commander-accessoires" className="btn-primary" style={{ fontSize: '0.9rem' }}>🛒 Commander accessoires</Link>
            <Link to="/commander" className="btn-secondary" style={{ fontSize: '0.9rem' }}>⛽ Commander gaz</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
