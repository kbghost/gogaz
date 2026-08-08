import { useState, useEffect, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Navbar from '../../components/ui/Navbar'
import { accessoireAPI, commandeAccAPI, getImageUrl } from '../../services/api'
import { formatPrix, getUserPosition } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'

const GoogleMapPicker = lazy(() => import('../../components/ui/GoogleMapPicker'))
const CAT_ICONS = { 'Détendeur':'🔧','Tuyau':'🟫','Briquet':'🔥','Gazinière':'🍳','Sécurité':'🛡️','Autre':'📦' }

/* ── Confirmation après commande ── */
function SuccessOverlay({ numeroCommande, onClose }) {
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 60); return () => clearTimeout(t) }, [])
  return (
    <div onClick={e => { if(e.target===e.currentTarget) { setVis(false); setTimeout(onClose, 250) } }}
      style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.82)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', opacity:vis?1:0, transition:'opacity 0.3s' }}>
      <div style={{ width:'100%', maxWidth:'380px', background:'var(--c-surface)', borderRadius:'24px', border:'1px solid var(--c-border)', padding:'36px 28px', textAlign:'center', transform:vis?'scale(1)':'scale(0.92)', transition:'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div style={{ width:'68px', height:'68px', borderRadius:'50%', background:'rgba(52,211,153,0.12)', border:'2px solid rgba(52,211,153,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', margin:'0 auto 18px' }}>🎉</div>
        <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.25rem', color:'var(--c-text)', marginBottom:'10px' }}>Commande confirmée !</h2>
        <p style={{ color:'var(--c-muted)', fontFamily:'var(--font-body)', fontSize:'0.86rem', marginBottom:'10px' }}>Votre commande d'accessoires est enregistrée.</p>
        <div style={{ background:'var(--c-surface2)', borderRadius:'12px', padding:'9px 16px', marginBottom:'20px', display:'inline-block' }}>
          <span style={{ fontFamily:'var(--font-mono)', color:'var(--c-brand)', fontSize:'0.84rem', fontWeight:700 }}>{numeroCommande}</span>
        </div>
        <p style={{ color:'var(--c-muted)', fontSize:'0.8rem', fontFamily:'var(--font-body)', marginBottom:'22px' }}>💵 Paiement cash · 🚚 Livreur en route</p>
        <button className="btn-primary" style={{ width:'100%' }} onClick={() => { setVis(false); setTimeout(onClose, 250) }}>
          📍 Suivre ma commande →
        </button>
      </div>
    </div>
  )
}

/* ── Mini panier sheet mobile ── */
function PanierSheet({ panierItems, panierTotal, panierCount, onClose, onValidate }) {
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 40); return () => clearTimeout(t) }, [])
  const close = () => { setVis(false); setTimeout(onClose, 300) }
  return (
    <div onClick={e => { if(e.target===e.currentTarget) close() }}
      style={{ position:'fixed', inset:0, zIndex:150, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', display:'flex', alignItems:'flex-end', justifyContent:'center', opacity:vis?1:0, transition:'opacity 0.25s' }}>
      <div style={{ width:'100%', maxWidth:'520px', background:'var(--c-surface)', borderRadius:'24px 24px 0 0', borderTop:'1px solid var(--c-border)', padding:'20px 20px 32px', maxHeight:'70dvh', overflowY:'auto', transform:vis?'translateY(0)':'translateY(50%)', transition:'transform 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
        <div style={{ width:'36px', height:'4px', borderRadius:'4px', background:'var(--c-border2)', margin:'0 auto 16px' }} />
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontWeight:800, color:'var(--c-text)', fontSize:'1.05rem' }}>🛒 Votre panier ({panierCount})</h3>
          <button onClick={close} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--c-muted)', fontSize:'1.2rem' }}>✕</button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'16px' }}>
          {panierItems.map(a => (
            <div key={a._id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 12px', background:'var(--c-surface2)', borderRadius:'12px' }}>
              <div style={{ width:'40px', height:'40px', borderRadius:'9px', background:'var(--c-border)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                {getImageUrl(a.imageUrl)
                  ? <img src={getImageUrl(a.imageUrl)} alt={a.nom} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { e.target.style.display='none' }} />
                  : <span style={{ fontSize:'1.2rem' }}>{CAT_ICONS[a.categorie]||'📦'}</span>
                }
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:'var(--font-display)', fontWeight:600, color:'var(--c-text)', fontSize:'0.85rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.nom}</div>
                <div style={{ color:'var(--c-muted)', fontSize:'0.72rem', fontFamily:'var(--font-mono)' }}>×{a.qty} · {formatPrix(a.prix)}</div>
              </div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:800, color:'var(--c-brand)', fontSize:'0.9rem', flexShrink:0 }}>{formatPrix(a.prix * a.qty)}</div>
            </div>
          ))}
        </div>
        <div style={{ borderTop:'1px solid var(--c-border)', paddingTop:'14px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--c-text)' }}>Total</span>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.4rem', color:'var(--c-brand)' }}>{formatPrix(panierTotal)}</span>
        </div>
        <button className="btn-primary" style={{ width:'100%' }} onClick={() => { close(); setTimeout(onValidate, 320) }}>
          Commander ({panierCount} article{panierCount>1?'s':''}) →
        </button>
        <div style={{ textAlign:'center', marginTop:'8px', color:'var(--c-dim)', fontSize:'0.72rem', fontFamily:'var(--font-body)' }}>💵 Paiement cash à la livraison</div>
      </div>
    </div>
  )
}

export default function CommanderAccessoires() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [panier, setPanier] = useState({})
  const [form, setForm] = useState({ nomClient: user?.nom||'', telephoneClient: user?.telephone||'', description:'', localisation:null, adresseLivraison:'' })
  const [loading, setLoading] = useState(false)
  const [successNum, setSuccessNum] = useState(null)
  const [catFilter, setCatFilter] = useState('')
  const [showPanierSheet, setShowPanierSheet] = useState(false)

  // Auth guard
  useEffect(() => {
    if (!user) { toast('Connectez-vous pour commander', { icon:'🔒' }); navigate('/login') }
  }, [])

  // Auto-fill
  useEffect(() => {
    if (user) setForm(f => ({ ...f, nomClient: user.nom||f.nomClient, telephoneClient: user.telephone||f.telephoneClient }))
  }, [user?.nom])

  const { data: catsData } = useQuery({ queryKey:['acc-cats'], queryFn: accessoireAPI.getCategories })
  const { data: accData, isLoading } = useQuery({
    queryKey:['acc-shop', catFilter],
    queryFn: () => accessoireAPI.getAll({ disponible:true, categorie: catFilter||undefined }),
  })
  const categories  = catsData?.data?.categories || []
  const accessoires = accData?.data?.accessoires  || []

  const panierItems = accessoires.filter(a => panier[a._id] > 0).map(a => ({ ...a, qty: panier[a._id] }))
  const panierTotal = panierItems.reduce((s, a) => s + a.prix * a.qty, 0)
  const panierCount = Object.values(panier).reduce((s, q) => s + (q||0), 0)

  const setQty = (id, q) => setPanier(p => ({ ...p, [id]: Math.max(0, q) }))
  const inc = id => setQty(id, (panier[id]||0)+1)
  const dec = id => setQty(id, (panier[id]||0)-1)

  const handleGPS = async () => {
    const tid = toast.loading('Récupération GPS…')
    try { const pos = await getUserPosition(); setForm(f => ({ ...f, localisation: pos })); toast.success('Position récupérée !', { id:tid }) }
    catch { toast.error('GPS indisponible.', { id:tid }) }
  }

  const handleSubmit = async () => {
    if (!form.nomClient || !form.telephoneClient) { toast.error('Nom et téléphone requis.'); return }
    if (!form.localisation) { toast.error('Indiquez votre position.'); return }
    if (panierItems.length === 0) { toast.error('Panier vide.'); return }
    setLoading(true)
    try {
      const items = panierItems.map(a => ({ accessoireId: a._id, quantite: a.qty }))
      const res = await commandeAccAPI.create({ ...form, items })
      toast.success('Commande passée ! 🎉')
      setSuccessNum(res.data.commande.numeroCommande)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur lors de la commande.')
    } finally { setLoading(false) }
  }

  const S_INPUT = { padding:'12px 14px', borderRadius:'12px', border:'1px solid var(--c-border2)', background:'var(--c-surface2)', color:'var(--c-text)', fontFamily:'var(--font-body)', fontSize:'16px', outline:'none', width:'100%' }
  const S_LABEL = { display:'block', color:'var(--c-muted)', fontSize:'0.7rem', fontWeight:600, marginBottom:'5px', fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.05em' }
  const S_CARD  = { background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'16px', overflow:'hidden' }

  return (
    <div style={{ minHeight:'100vh', background:'var(--c-bg)' }}>
      <Navbar />

      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'clamp(76px,11vw,100px) 16px clamp(80px,12vw,100px)' }}>

        {/* Header */}
        <div className="animate-fade-in" style={{ marginBottom:'24px' }}>
          <div className="pill" style={{ marginBottom:'10px', display:'inline-flex' }}>Boutique</div>
          <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'clamp(1.5rem,5vw,2.2rem)', color:'var(--c-text)', letterSpacing:'-0.02em', marginBottom:'4px' }}>
            Commander des accessoires
          </h1>
          <p style={{ color:'var(--c-muted)', fontSize:'0.88rem', fontFamily:'var(--font-body)' }}>
            Ajoutez au panier, puis confirmez votre livraison.
          </p>
        </div>

        {/* ─── STEP 1 : Catalogue + panier ─── */}
        {step === 1 && (
          <div>
            {/* Category pills */}
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'20px', overflowX:'auto' }}>
              {['', ...categories].map(cat => (
                <button key={cat||'all'} onClick={() => setCatFilter(cat)} style={{
                  padding:'7px 14px', borderRadius:'99px', border:'1px solid var(--c-border)',
                  background: catFilter===cat ? 'var(--c-brand)' : 'var(--c-surface2)',
                  color: catFilter===cat ? '#fff' : 'var(--c-muted)',
                  fontFamily:'var(--font-display)', fontWeight:600, fontSize:'0.8rem', cursor:'pointer', whiteSpace:'nowrap',
                  boxShadow: catFilter===cat ? '0 0 12px rgba(249,124,10,0.3)' : 'none',
                }}>
                  {cat ? `${CAT_ICONS[cat]||'📦'} ${cat}` : 'Tous'}
                </button>
              ))}
            </div>

            {/* Layout responsive : grille produits + sidebar panier desktop */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'20px' }}>

              {/* === Grille produits === */}
              {isLoading ? (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'12px' }}>
                  {Array(6).fill(0).map((_,i) => <div key={i} className="skeleton" style={{ height:'240px', borderRadius:'16px' }} />)}
                </div>
              ) : accessoires.length === 0 ? (
                <div style={{ textAlign:'center', padding:'48px 20px', ...S_CARD }}>
                  <div style={{ fontSize:'2.5rem', marginBottom:'12px' }}>🔧</div>
                  <p style={{ color:'var(--c-muted)', fontFamily:'var(--font-body)' }}>Aucun accessoire disponible.</p>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'12px' }}>
                  {accessoires.map(acc => {
                    const qty = panier[acc._id] || 0
                    const imgUrl = getImageUrl(acc.imageUrl)
                    const added  = qty > 0
                    return (
                      <div key={acc._id} style={{
                        ...S_CARD, display:'flex', flexDirection:'column',
                        outline: added ? '2px solid var(--c-brand)' : '2px solid transparent',
                        transition:'outline-color 0.15s',
                      }}>
                        {/* Image */}
                        <div style={{ height:'130px', background:'var(--c-surface2)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', flexShrink:0 }}>
                          {imgUrl
                            ? <img src={imgUrl} alt={acc.nom} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { e.target.style.display='none' }} />
                            : <span style={{ fontSize:'2.2rem' }}>{CAT_ICONS[acc.categorie]||'📦'}</span>
                          }
                          {acc.stock === 0 && (
                            <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.62)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                              <span style={{ color:'#f87171', fontWeight:700, fontSize:'0.8rem', fontFamily:'var(--font-display)' }}>Rupture</span>
                            </div>
                          )}
                          <div style={{ position:'absolute', top:'7px', left:'7px', background:'rgba(0,0,0,0.6)', backdropFilter:'blur(6px)', padding:'2px 7px', borderRadius:'99px', color:'#fff', fontSize:'0.6rem', fontFamily:'var(--font-mono)' }}>
                            {acc.categorie}
                          </div>
                          {added && (
                            <div style={{ position:'absolute', top:'7px', right:'7px', width:'20px', height:'20px', borderRadius:'50%', background:'var(--c-brand)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', fontWeight:700, color:'#fff' }}>{qty}</div>
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ padding:'11px 12px', flex:1, display:'flex', flexDirection:'column', gap:'7px' }}>
                          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--c-text)', fontSize:'0.83rem', lineHeight:1.3 }}>{acc.nom}</div>
                          <div style={{ fontFamily:'var(--font-display)', fontWeight:800, color:'var(--c-brand)', fontSize:'0.95rem' }}>{formatPrix(acc.prix)}</div>

                          {/* Qty controls */}
                          {acc.stock > 0 ? (
                            qty === 0 ? (
                              <button onClick={() => inc(acc._id)} style={{
                                width:'100%', padding:'8px', borderRadius:'9px', border:'1px solid var(--c-border2)',
                                background:'var(--c-surface2)', color:'var(--c-muted)', cursor:'pointer',
                                fontFamily:'var(--font-display)', fontWeight:600, fontSize:'0.8rem',
                                transition:'all 0.15s',
                              }}
                                onMouseEnter={e => { e.currentTarget.style.background='var(--c-brand)'; e.currentTarget.style.color='#fff'; e.currentTarget.style.border='1px solid var(--c-brand)' }}
                                onMouseLeave={e => { e.currentTarget.style.background='var(--c-surface2)'; e.currentTarget.style.color='var(--c-muted)'; e.currentTarget.style.border='1px solid var(--c-border2)' }}
                              >
                                + Ajouter
                              </button>
                            ) : (
                              <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                                <button onClick={() => dec(acc._id)} style={{ width:'32px', height:'32px', borderRadius:'8px', border:'1px solid var(--c-border2)', background:'var(--c-surface2)', color:'var(--c-text)', cursor:'pointer', fontSize:'1.1rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>−</button>
                                <span style={{ flex:1, textAlign:'center', fontFamily:'var(--font-display)', fontWeight:800, color:'var(--c-brand)', fontSize:'1rem' }}>{qty}</span>
                                <button onClick={() => inc(acc._id)} style={{ width:'32px', height:'32px', borderRadius:'8px', border:'none', background:'var(--c-brand)', color:'#fff', cursor:'pointer', fontSize:'1.1rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>+</button>
                              </div>
                            )
                          ) : (
                            <div style={{ color:'#f87171', fontSize:'0.72rem', fontFamily:'var(--font-mono)', textAlign:'center' }}>Indisponible</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── STEP 2 : Infos client ─── */}
        {step === 2 && (
          <div style={{ maxWidth:'520px', margin:'0 auto' }}>
            <div style={{ ...S_CARD, padding:'26px', display:'flex', flexDirection:'column', gap:'18px' }}>
              <div>
                <button onClick={() => setStep(1)} style={{ background:'none', border:'none', color:'var(--c-brand)', cursor:'pointer', fontFamily:'var(--font-display)', fontWeight:600, fontSize:'0.85rem', padding:0, marginBottom:'14px' }}>← Retour au catalogue</button>
                <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, color:'var(--c-text)', fontSize:'1.15rem' }}>Vos coordonnées</h2>
                {user && <p style={{ color:'#34d399', fontSize:'0.8rem', marginTop:'5px', fontFamily:'var(--font-body)' }}>✅ Informations récupérées depuis votre compte</p>}
              </div>
              <div>
                <span style={S_LABEL}>Nom complet *</span>
                <input style={{ ...S_INPUT, ...(user ? { opacity:0.7, cursor:'not-allowed' } : {}) }} placeholder="Jean Dupont" value={form.nomClient}
                  readOnly={!!user} onChange={e => !user && setForm(f => ({ ...f, nomClient: e.target.value }))} />
              </div>
              <div>
                <span style={S_LABEL}>Téléphone *</span>
                <input style={{ ...S_INPUT, fontFamily:'var(--font-mono)', ...(user ? { opacity:0.7, cursor:'not-allowed' } : {}) }} placeholder="+229 97 00 00 00" value={form.telephoneClient}
                  readOnly={!!user} onChange={e => !user && setForm(f => ({ ...f, telephoneClient: e.target.value }))} />
              </div>
              <div>
                <span style={S_LABEL}>Instructions <span style={{ textTransform:'none', letterSpacing:0, color:'var(--c-dim)' }}>(optionnel)</span></span>
                <textarea style={{ ...S_INPUT, resize:'vertical', minHeight:'68px' }} placeholder="Ex: Sonner 2 fois, 1er étage à gauche…"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              {/* Récap panier */}
              <div style={{ background:'var(--c-surface2)', borderRadius:'12px', padding:'14px' }}>
                <div style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--c-text)', fontSize:'0.85rem', marginBottom:'10px' }}>Récap ({panierCount} article{panierCount>1?'s':''})</div>
                {panierItems.map(a => (
                  <div key={a._id} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.82rem', marginBottom:'4px' }}>
                    <span style={{ color:'var(--c-muted)' }}>{a.nom} ×{a.qty}</span>
                    <span style={{ color:'var(--c-text)', fontWeight:600 }}>{formatPrix(a.prix * a.qty)}</span>
                  </div>
                ))}
                <div style={{ borderTop:'1px solid var(--c-border)', marginTop:'10px', paddingTop:'10px', display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--c-text)' }}>Total</span>
                  <span style={{ fontFamily:'var(--font-display)', fontWeight:800, color:'var(--c-brand)', fontSize:'1.1rem' }}>{formatPrix(panierTotal)}</span>
                </div>
              </div>
              <button className="btn-primary" style={{ width:'100%' }}
                onClick={() => { if (!form.nomClient || !form.telephoneClient) { toast.error('Nom et téléphone requis.'); return }; setStep(3) }}>
                Choisir la livraison →
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3 : Livraison ─── */}
        {step === 3 && (
          <div style={{ maxWidth:'520px', margin:'0 auto' }}>
            <div style={{ ...S_CARD, padding:'26px', display:'flex', flexDirection:'column', gap:'18px' }}>
              <div>
                <button onClick={() => setStep(2)} style={{ background:'none', border:'none', color:'var(--c-brand)', cursor:'pointer', fontFamily:'var(--font-display)', fontWeight:600, fontSize:'0.85rem', padding:0, marginBottom:'14px' }}>← Retour</button>
                <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, color:'var(--c-text)', fontSize:'1.15rem' }}>Point de livraison</h2>
              </div>
              <button onClick={handleGPS} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', padding:'14px', borderRadius:'13px', border:'1px dashed var(--c-border2)', background:'var(--c-surface2)', color:'var(--c-muted)', cursor:'pointer', fontFamily:'var(--font-display)', fontWeight:600, fontSize:'0.9rem' }}>
                <span style={{ fontSize:'1.3rem' }}>📍</span> Détecter ma position GPS
              </button>
              {form.localisation && (
                <div style={{ padding:'9px 13px', borderRadius:'10px', background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.2)', color:'#34d399', fontFamily:'var(--font-mono)', fontSize:'0.73rem' }}>
                  ✓ {form.localisation.lat.toFixed(5)}, {form.localisation.lng.toFixed(5)}
                </div>
              )}
              <Suspense fallback={<div style={{ height:'240px', borderRadius:'16px', background:'var(--c-surface2)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--c-muted)', fontSize:'0.85rem' }}>Chargement carte…</div>}>
                <GoogleMapPicker position={form.localisation || { lat:6.3654, lng:2.4183 }} onPositionChange={pos => setForm(f => ({ ...f, localisation: pos }))} height={240} />
              </Suspense>
              <div>
                <span style={S_LABEL}>Adresse / Repère <span style={{ textTransform:'none', letterSpacing:0, color:'var(--c-dim)' }}>(optionnel)</span></span>
                <input style={S_INPUT} placeholder="Quartier, rue, repère visible…" value={form.adresseLivraison} onChange={e => setForm(f => ({ ...f, adresseLivraison: e.target.value }))} />
              </div>
              <button className="btn-primary glow" style={{ width:'100%' }} onClick={handleSubmit} disabled={loading || !form.localisation}>
                {loading ? '⏳ En cours…' : `🔧 Confirmer — ${formatPrix(panierTotal)}`}
              </button>
              <div style={{ textAlign:'center', color:'var(--c-dim)', fontSize:'0.75rem', fontFamily:'var(--font-body)' }}>💵 Paiement cash à la livraison</div>
            </div>
          </div>
        )}
      </div>

      {/* ── BARRE PANIER FLOTTANTE (mobile) — visible sur step 1 ── */}
      {step === 1 && panierCount > 0 && (
        <div style={{
          position:'sticky', bottom:'calc(68px + env(safe-area-inset-bottom, 0px))', left:0, right:0, zIndex:110,
          padding:'12px 16px', paddingBottom:'calc(12px + env(safe-area-inset-bottom, 0px))',
          background:'rgba(8,8,7,0.97)', backdropFilter:'blur(20px)',
          borderTop:'1px solid var(--c-border)',
          marginTop:'18px',
        }}>
          <button
            className="btn-primary"
            style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px' }}
            onClick={() => setShowPanierSheet(true)}
          >
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <span style={{ background:'rgba(255,255,255,0.25)', borderRadius:'99px', padding:'2px 9px', fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'0.82rem' }}>{panierCount}</span>
              <span style={{ fontWeight:700 }}>Voir mon panier</span>
            </div>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1rem' }}>{formatPrix(panierTotal)}</span>
          </button>
        </div>
      )}

      {/* Panier sheet */}
      {showPanierSheet && (
        <PanierSheet
          panierItems={panierItems}
          panierTotal={panierTotal}
          panierCount={panierCount}
          onClose={() => setShowPanierSheet(false)}
          onValidate={() => { if (panierCount === 0) { toast.error('Panier vide.'); return }; setStep(2) }}
        />
      )}

      {/* Confirmation overlay */}
      {successNum && (
        <SuccessOverlay
          numeroCommande={successNum}
          onClose={() => { setSuccessNum(null); navigate('/suivi-accessoires/' + successNum) }}
        />
      )}
    </div>
  )
}
