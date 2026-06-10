import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../../components/ui/Navbar'
import ProductImage from '../../components/ui/ProductImage'
import { commandeAPI } from '../../services/api'
import { formatPrix, formatDate, formatDateRelative, statutLabel, getBadgeClass, marqueColors } from '../../utils/helpers'
import { useSocket } from '../../context/SocketContext'
import toast from 'react-hot-toast'
import PushNotifier from '../../components/ui/PushNotifier';

const STEPS = ['en_attente', 'validee', 'en_livraison', 'livree']

export default function SuiviCommande() {
  const { numero } = useParams()
  const navigate = useNavigate()
  const { trackCommande, on } = useSocket()
  const [searchNum, setSearchNum] = useState(numero || '')
  const [commandeNum, setCommandeNum] = useState(numero || '')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['track', commandeNum],
    queryFn: () => commandeAPI.track(commandeNum),
    enabled: !!commandeNum,
    refetchInterval: 30000,
  })
  const commande = data?.data?.commande

  useEffect(() => {
    if (commande?._id) trackCommande(commande._id)
  }, [commande?._id])

  useEffect(() => {
    if (!commande?._id) return
    const unsub = on('statut_update', ({ commandeId, statut }) => {
      if (commandeId === commande._id) { refetch(); toast.success(`Statut: ${statutLabel[statut]?.label}`) }
    })
    return () => { if (typeof unsub === 'function') unsub() }
  }, [commande?._id])

  const handleSearch = (e) => {
    e.preventDefault()
    const n = searchNum.trim().toUpperCase()
    if (!n) return
    setCommandeNum(n)
    navigate(`/suivi/${n}`, { replace: true })
  }

  const currentStep = commande ? (commande.statut === 'annulee' ? -1 : STEPS.indexOf(commande.statut)) : -1
  const color = commande ? (marqueColors[commande.marque] || '#f97c0a') : '#f97c0a'

  const inputSt = { flex:1, padding:'12px 16px', borderRadius:'14px', border:'1px solid var(--c-border2)', background:'var(--c-surface2)', color:'var(--c-text)', fontFamily:'var(--font-mono)', fontSize:'16px', outline:'none' }

  return (
    <div style={{ minHeight:'100vh', background:'var(--c-bg)' }}>
      <Navbar />
      <div style={{ maxWidth:'560px', margin:'0 auto', padding:'clamp(90px,14vw,110px) 20px 80px' }}>

        <div className="animate-fade-in" style={{ marginBottom:'24px' }}>
          <div className="pill" style={{ marginBottom:'12px', display:'inline-flex' }}>Suivi de commande</div>
          <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'clamp(1.6rem,5vw,2.2rem)', color:'var(--c-text)', letterSpacing:'-0.02em' }}>
            Où est mon gaz ?
          </h1>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ display:'flex', gap:'10px', marginBottom:'24px' }}>
          <input type="text" style={inputSt} placeholder="Ex: GAZ-260321-0001"
            value={searchNum} onChange={e => setSearchNum(e.target.value.toUpperCase())} />
          <button type="submit" className="btn-primary" style={{ padding:'12px 20px' }}>🔍</button>
        </form>

        {isLoading && (
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {Array(3).fill(0).map((_,i) => <div key={i} className="skeleton" style={{ height:'80px', borderRadius:'16px' }} />)}
          </div>
        )}

        {error && !isLoading && (
          <div style={{ background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:'16px', padding:'32px', textAlign:'center' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'10px' }}>❌</div>
            <p style={{ color:'#f87171', fontFamily:'var(--font-body)', fontSize:'0.9rem' }}>Commande introuvable. Vérifiez le numéro.</p>
          </div>
        )}

        {commande && (
            <>
              <PushNotifier orderId={commande._id} />
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }} className="animate-slide-up">

            {/* Header card */}
            <div style={{ background:'var(--c-surface)', border:`1px solid ${color}30`, borderRadius:'18px', padding:'20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                <ProductImage imageUrl={commande.produit?.imageUrl} couleur={color} poids={commande.poids} marque={commande.marque} size={60} objectFit="contain" />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:'var(--font-mono)', color:'var(--c-brand)', fontSize:'0.7rem', marginBottom:'2px' }}>{commande.numeroCommande}</div>
                  <div style={{ fontFamily:'var(--font-display)', fontWeight:800, color:'var(--c-text)', fontSize:'1.05rem' }}>{commande.marque} · {commande.poids}kg × {commande.quantite}</div>
                  <div style={{ color:'var(--c-muted)', fontSize:'0.78rem', fontFamily:'var(--font-body)', marginTop:'2px' }}>{formatDateRelative(commande.createdAt)}</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <span className={getBadgeClass(commande.statut)} style={{ display:'inline-flex' }}>{statutLabel[commande.statut]?.icon} {statutLabel[commande.statut]?.label}</span>
                  <div style={{ fontFamily:'var(--font-display)', fontWeight:800, color:'var(--c-brand)', fontSize:'1.3rem', marginTop:'6px' }}>{formatPrix(commande.prixTotal)}</div>
                </div>
              </div>
            </div>

            {/* Progress */}
            {commande.statut !== 'annulee' && (
              <div style={{ background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'18px', padding:'20px' }}>
                <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--c-text)', fontSize:'0.9rem', marginBottom:'20px' }}>Progression</h3>
                <div style={{ display:'flex', alignItems:'center' }}>
                  {STEPS.map((s, i) => {
                    const done   = currentStep > i
                    const active = currentStep === i
                    return (
                      <div key={s} style={{ display:'flex', alignItems:'center', flex: i < STEPS.length-1 ? 1 : 0 }}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}>
                          <div style={{
                            width:'38px', height:'38px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', transition:'all 0.3s',
                            background: done ? 'rgba(52,211,153,0.15)' : active ? 'rgba(249,124,10,0.15)' : 'var(--c-surface2)',
                            border: `2px solid ${done ? '#34d399' : active ? 'var(--c-brand)' : 'var(--c-border2)'}`,
                            boxShadow: active ? '0 0 16px rgba(249,124,10,0.3)' : 'none',
                          }}>
                            {statutLabel[s]?.icon}
                          </div>
                          <span style={{ fontSize:'0.62rem', fontFamily:'var(--font-body)', color: active ? 'var(--c-brand)' : done ? '#34d399' : 'var(--c-dim)', textAlign:'center', width:'56px', lineHeight:1.3 }}>
                            {statutLabel[s]?.label}
                          </span>
                        </div>
                        {i < STEPS.length-1 && (
                          <div style={{ flex:1, height:'2px', margin:'0 4px 20px', background: done ? '#34d399' : 'var(--c-border)', transition:'background 0.5s' }} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {commande.statut === 'annulee' && (
              <div style={{ background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:'18px', padding:'24px', textAlign:'center' }}>
                <div style={{ fontSize:'2.5rem', marginBottom:'10px' }}>❌</div>
                <div style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'#f87171' }}>Commande annulée</div>
              </div>
            )}

            {/* Livreur */}
            {commande.livreur && (
              <div style={{ background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'18px', padding:'18px', display:'flex', alignItems:'center', gap:'14px' }}>
                <div style={{ width:'44px', height:'44px', borderRadius:'50%', background:'rgba(249,124,10,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>🚚</div>
                <div>
                  <div style={{ color:'var(--c-muted)', fontSize:'0.7rem', fontFamily:'var(--font-mono)', marginBottom:'2px' }}>Livreur assigné</div>
                  <div style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--c-text)' }}>{commande.livreur.nom}</div>
                  <div style={{ color:'var(--c-muted)', fontFamily:'var(--font-mono)', fontSize:'0.78rem' }}>{commande.livreur.telephone}</div>
                </div>
              </div>
            )}

            {/* Maps link */}
            {commande.localisation && (
              <a href={`https://www.google.com/maps?q=${commande.localisation.lat},${commande.localisation.lng}`}
                target="_blank" rel="noreferrer"
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', padding:'14px', borderRadius:'14px', border:'1px solid var(--c-border2)', background:'var(--c-surface2)', color:'var(--c-muted)', textDecoration:'none', fontFamily:'var(--font-display)', fontWeight:600, fontSize:'0.88rem' }}>
                🗺️ Voir le point de livraison sur la carte
              </a>
            )}

            {/* Historique */}
            <div style={{ background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'18px', padding:'18px' }}>
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--c-text)', fontSize:'0.9rem', marginBottom:'14px' }}>Historique</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {commande.historiqueStatuts?.slice().reverse().map((h, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <span style={{ fontSize:'1.1rem' }}>{statutLabel[h.statut]?.icon || '•'}</span>
                    <div>
                      <div style={{ fontFamily:'var(--font-display)', fontWeight:600, color:'var(--c-text)', fontSize:'0.85rem' }}>{statutLabel[h.statut]?.label || h.statut}</div>
                      <div style={{ color:'var(--c-muted)', fontFamily:'var(--font-mono)', fontSize:'0.72rem' }}>{formatDate(h.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
