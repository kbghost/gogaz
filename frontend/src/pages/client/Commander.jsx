import { useState, useEffect, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Navbar from '../../components/ui/Navbar'
import GasBottle from '../../components/ui/GasBottle'
import { produitAPI, commandeAPI } from '../../services/api'
import { formatPrix, getUserPosition, marqueColors } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import UpsellModal from '../../components/ui/UpsellModal'
import ProductImage from '../../components/ui/ProductImage'

const GoogleMapPicker = lazy(() => import('../../components/ui/GoogleMapPicker'))
const POIDS = [6, 12.5, 25]

export default function Commander() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [upsellData, setUpsellData] = useState(null) // { numeroCommande }

  const [form, setForm] = useState({
    nomClient: '', telephoneClient: '', marque: '', poids: '',
    produitId: '', quantite: 1, description: '', localisation: null, adresseLivraison: '',
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      import('react-hot-toast').then(({ default: t }) => t('Connectez-vous pour commander', { icon: '🔒' }))
      navigate('/login')
    }
  }, [])

  // Auto-fill from logged-in user
  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        nomClient: user.nom || f.nomClient,
        telephoneClient: user.telephone || f.telephoneClient,
      }))
    }
  }, [user?.nom, user?.telephone])

  const { data: produitsData } = useQuery({
    queryKey: ['produits'],
    queryFn: () => produitAPI.getAll({ disponible: true }),
  })

  const produits = produitsData?.data?.produits || []
  const marques = [...new Set(produits.map(p => p.marque))]
  const poidsDisponibles = produits.filter(p => p.marque === form.marque).map(p => p.poids)
  const selectedProduit = produits.find(p => p.marque === form.marque && p.poids === Number(form.poids))

  useEffect(() => {
    if (selectedProduit) setForm(f => ({ ...f, produitId: selectedProduit._id }))
  }, [selectedProduit?._id])

  const prixTotal = selectedProduit ? selectedProduit.prix * form.quantite : 0
  const marqueColor = form.marque ? (marqueColors[form.marque] || '#f97c0a') : '#f97c0a'

  const handleGPS = async () => {
    const tid = toast.loading('Récupération GPS…')
    try {
      const pos = await getUserPosition()
      setForm(f => ({ ...f, localisation: pos }))
      toast.success('Position récupérée !', { id: tid })
    } catch {
      toast.error('GPS indisponible. Placez le marqueur sur la carte.', { id: tid })
    }
  }

  const handleSubmit = async () => {
    if (!form.nomClient || !form.telephoneClient) { toast.error('Nom et téléphone requis.'); return }
    if (!form.produitId) { toast.error('Sélectionnez un produit.'); return }
    if (!form.localisation) { toast.error('Indiquez votre position de livraison.'); return }
    setLoading(true)
    try {
      const res = await commandeAPI.create(form)
      toast.success('Commande passée ! 🎉')
      // Show upsell modal instead of navigating immediately
      setUpsellData({ numeroCommande: res.data.commande.numeroCommande })
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur lors de la commande.')
    } finally { setLoading(false) }
  }

  const handleUpsellClose = () => {
    if (upsellData) navigate(`/suivi/${upsellData.numeroCommande}`)
    setUpsellData(null)
  }

  const isLoggedIn = !!user

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>
      <Navbar />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'clamp(80px,12vw,110px) 20px 80px' }}>

        {/* Header */}
        <div className="animate-fade-in" style={{ marginBottom: '28px', paddingTop: '8px' }}>
          <div className="pill" style={{ marginBottom: '12px', display: 'inline-flex' }}>Commander du gaz</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', color: 'var(--c-text)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Votre livraison
          </h1>
          <p style={{ color: 'var(--c-muted)', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>
            {isLoggedIn ? `Bonjour ${user.nom.split(' ')[0]} 👋 — vos infos sont pré-remplies` : 'Livraison rapide · Paiement à la réception'}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px' }}>
          {[1, 2, 3].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: s < 3 ? 1 : 0 }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8rem',
                background: step > s ? '#16a34a' : step === s ? '#f97c0a' : 'var(--c-surface2)',
                color: step >= s ? 'white' : 'var(--c-dim)',
                border: step === s ? '2px solid rgba(249,124,10,0.5)' : '1px solid var(--c-border)',
                boxShadow: step === s ? '0 0 16px rgba(249,124,10,0.3)' : 'none',
                transition: 'all 0.3s ease',
              }}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && (
                <div style={{ flex: 1, height: '2px', margin: '0 6px', background: step > s ? '#16a34a' : 'var(--c-border)', transition: 'background 0.5s ease' }} />
              )}
            </div>
          ))}
          <span style={{ color: 'var(--c-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginLeft: '12px', flexShrink: 0 }}>
            {step === 1 ? 'Infos' : step === 2 ? 'Gaz' : 'Livraison'}
          </span>
        </div>

        {/* Card */}
        <div className="animate-slide-up card" style={{ padding: '28px' }}>

          {/* ─── STEP 1 ─── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-text)', fontSize: '1.1rem' }}>
                {isLoggedIn ? '✅ Infos pré-remplies' : 'Vos coordonnées'}
              </h2>

              {isLoggedIn && (
                <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.1rem' }}>✅</span>
                  <span style={{ color: '#4ade80', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>
                    Nom et téléphone récupérés automatiquement depuis votre compte
                  </span>
                </div>
              )}

              <div>
                <label className="label">Nom complet *</label>
                <input type="text" className="input-field" placeholder="Jean Dupont"
                  value={form.nomClient}
                  readOnly={isLoggedIn}
                  style={isLoggedIn ? { opacity: 0.7, cursor: 'not-allowed', background: 'var(--c-surface)' } : {}}
                  onChange={e => !isLoggedIn && setForm(f => ({ ...f, nomClient: e.target.value }))} />
              </div>
              <div>
                <label className="label">Téléphone *</label>
                <input type="tel" className="input-field" placeholder="+229 97 00 00 00"
                  value={form.telephoneClient}
                  readOnly={isLoggedIn}
                  style={isLoggedIn ? { opacity: 0.7, cursor: 'not-allowed', background: 'var(--c-surface)', fontFamily: 'var(--font-mono)' } : { fontFamily: 'var(--font-mono)' }}
                  onChange={e => !isLoggedIn && setForm(f => ({ ...f, telephoneClient: e.target.value }))} />
              </div>
              <div>
                <label className="label">Instructions livreur <span style={{ color: 'var(--c-dim)', textTransform: 'none', letterSpacing: 0 }}>(optionnel)</span></label>
                <textarea className="input-field" rows={2} style={{ resize: 'none', minHeight: 'auto' }}
                  placeholder="Ex: Maison bleue, portail rouge, 2ème rue à gauche…"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <button className="btn-primary" style={{ width: '100%' }}
                onClick={() => {
                  if (!form.nomClient || !form.telephoneClient) { toast.error('Nom et téléphone requis.'); return }
                  setStep(2)
                }}>
                Choisir le gaz →
              </button>
            </div>
          )}

          {/* ─── STEP 2 ─── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-text)', fontSize: '1.1rem' }}>Choisissez votre gaz</h2>

              {/* Marques */}
              <div>
                <label className="label">Marque *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {marques.map(m => {
                    const mc = marqueColors[m] || '#f97c0a'
                    const sel = form.marque === m
                    return (
                      <button key={m}
                        onClick={() => setForm(f => ({ ...f, marque: m, poids: '', produitId: '' }))}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
                          borderRadius: '14px', border: sel ? `2px solid ${mc}` : '1px solid var(--c-border2)',
                          background: sel ? `${mc}14` : 'var(--c-surface2)',
                          cursor: 'pointer', transition: 'all 0.15s ease',
                          boxShadow: sel ? `0 0 20px ${mc}25` : 'none',
                          textAlign: 'left',
                        }}>
                        <GasBottle color={mc} poids={12.5} size={40} marque={m} />
                        <div>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--c-text)' }}>{m}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--c-muted)', fontFamily: 'var(--font-mono)' }}>6 · 12.5 · 25 kg</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Poids */}
              {form.marque && (
                <div>
                  <label className="label">Format *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {POIDS.map(p => {
                      const avail = poidsDisponibles.includes(p)
                      const prod = produits.find(pr => pr.marque === form.marque && pr.poids === p)
                      const sel = form.poids === p
                      return (
                        <button key={p} disabled={!avail}
                          onClick={() => setForm(f => ({ ...f, poids: p }))}
                          style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                            padding: '16px 8px', borderRadius: '14px',
                            border: sel ? '2px solid #f97c0a' : '1px solid var(--c-border2)',
                            background: sel ? 'rgba(249,124,10,0.1)' : avail ? 'var(--c-surface2)' : 'var(--c-surface)',
                            cursor: avail ? 'pointer' : 'not-allowed',
                            opacity: avail ? 1 : 0.3,
                            boxShadow: sel ? '0 0 20px rgba(249,124,10,0.2)' : 'none',
                            transition: 'all 0.15s ease',
                          }}>
                          <GasBottle color={marqueColor} poids={p} size={p === 25 ? 55 : p === 6 ? 42 : 50} marque={form.marque} />
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: 'var(--c-text)' }}>{p}kg</div>
                            {prod && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#f97c0a' }}>{formatPrix(prod.prix)}</div>}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Quantité */}
              {form.poids && (
                <div>
                  <label className="label">Quantité</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {[-1, null, 1].map((delta, i) => delta === null ? (
                      <span key="val" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--c-text)', width: '36px', textAlign: 'center' }}>{form.quantite}</span>
                    ) : (
                      <button key={delta}
                        onClick={() => setForm(f => ({ ...f, quantite: Math.max(1, Math.min(20, f.quantite + delta)) }))}
                        style={{
                          width: '44px', height: '44px', borderRadius: '12px',
                          background: 'var(--c-surface2)', border: '1px solid var(--c-border2)',
                          color: 'var(--c-text)', fontSize: '1.4rem', fontWeight: 700,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}>
                        {delta === -1 ? '−' : '+'}
                      </button>
                    ))}
                    <span style={{ color: 'var(--c-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>bouteille(s)</span>
                  </div>
                </div>
              )}

              {/* Prix */}
              {selectedProduit && (
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '18px 20px', borderRadius: '14px',
                  background: 'rgba(249,124,10,0.08)', border: '1px solid rgba(249,124,10,0.2)',
                }}>
                  <div>
                    <div style={{ color: 'var(--c-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-body)' }}>{form.marque} · {form.poids}kg × {form.quantite}</div>
                    <div style={{ color: 'var(--c-dim)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{formatPrix(selectedProduit.prix)} / bouteille</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: '#f97c0a' }}>{formatPrix(prixTotal)}</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>← Retour</button>
                <button className="btn-primary" style={{ flex: 2 }}
                  onClick={() => {
                    if (!form.marque || !form.poids) { toast.error('Choisissez la marque et le format.'); return }
                    setStep(3)
                  }}>
                  Livraison →
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3 ─── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-text)', fontSize: '1.1rem' }}>Point de livraison</h2>

              <button onClick={handleGPS} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                padding: '16px', borderRadius: '14px',
                background: 'var(--c-surface2)', border: '1px dashed var(--c-border2)',
                color: 'var(--c-muted)', cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem',
              }}>
                <span style={{ fontSize: '1.3rem' }}>📍</span> Détecter ma position GPS
              </button>

              {form.localisation && (
                <div style={{
                  padding: '10px 14px', borderRadius: '10px',
                  background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span style={{ color: '#4ade80' }}>✓</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#4ade80' }}>
                    GPS: {form.localisation.lat.toFixed(5)}, {form.localisation.lng.toFixed(5)}
                  </span>
                </div>
              )}

              <Suspense fallback={
                <div style={{ height: '280px', borderRadius: '18px', background: 'var(--c-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ color: 'var(--c-muted)', fontSize: '0.85rem' }}>Chargement carte…</div>
                </div>
              }>
                <GoogleMapPicker
                  position={form.localisation || { lat: 6.3654, lng: 2.4183 }}
                  onPositionChange={pos => setForm(f => ({ ...f, localisation: pos }))}
                  height={280}
                />
              </Suspense>

              <div>
                <label className="label">Adresse / Repère <span style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--c-dim)' }}>(optionnel)</span></label>
                <input type="text" className="input-field" placeholder="Quartier, rue, repère visible…"
                  value={form.adresseLivraison}
                  onChange={e => setForm(f => ({ ...f, adresseLivraison: e.target.value }))} />
              </div>

              {/* Récap */}
              <div style={{ background: 'var(--c-surface2)', borderRadius: '16px', padding: '18px', border: '1px solid var(--c-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid var(--c-border)' }}>
                  <GasBottle color={marqueColor} poids={Number(form.poids) || 12.5} size={56} marque={form.marque} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-text)' }}>{form.marque}</div>
                    <div style={{ color: 'var(--c-muted)', fontSize: '0.85rem' }}>{form.poids}kg × {form.quantite} bouteille(s)</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: '#f97c0a' }}>{formatPrix(prixTotal)}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[['Client', form.nomClient], ['Téléphone', form.telephoneClient]].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--c-dim)', fontFamily: 'var(--font-body)' }}>{k}</span>
                      <span style={{ color: 'var(--c-muted)', fontFamily: 'var(--font-mono)' }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ color: '#4ade80', fontSize: '0.82rem', marginTop: '4px', fontFamily: 'var(--font-body)' }}>💵 Paiement cash à la livraison</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>← Retour</button>
                <button className="btn-primary glow" style={{ flex: 2 }}
                  onClick={handleSubmit}
                  disabled={loading || !form.localisation}>
                  {loading ? '⏳ Envoi…' : '🔥 Passer la commande'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upsell modal after order */}
      {upsellData && (
        <UpsellModal
          numeroCommande={upsellData.numeroCommande}
          onClose={handleUpsellClose}
        />
      )}
    </div>
  )
}

