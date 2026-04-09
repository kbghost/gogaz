import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { accessoireAPI, getImageUrl } from '../../services/api'
import { formatPrix } from '../../utils/helpers'

/**
 * UpsellModal - shown after a gas order to upsell accessories
 * Props:
 *   numeroCommande : string
 *   onClose        : fn   — called when user dismisses (navigate is handled externally)
 *   redirectTo     : string (default: /suivi/:numero)
 */
export default function UpsellModal({ numeroCommande, onClose, redirectTo }) {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  const { data } = useQuery({
    queryKey: ['upsell-acc'],
    queryFn: () => accessoireAPI.getAll({ disponible: true, limit: 3 }),
    staleTime: 5 * 60 * 1000,
  })
  const featured = (data?.data?.accessoires || []).slice(0, 3)

  const handleGoAccessoires = () => {
    setVisible(false)
    setTimeout(() => { onClose(); navigate('/accessoires') }, 200)
  }

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => {
      onClose()
      if (redirectTo) navigate(redirectTo)
      else if (numeroCommande) navigate(`/suivi/${numeroCommande}`)
    }, 250)
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) handleClose() }}
      style={{
        position:'fixed', inset:0, zIndex:200,
        background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)',
        display:'flex', alignItems:'flex-end', justifyContent:'center',
        opacity: visible ? 1 : 0, transition:'opacity 0.3s ease',
      }}
    >
      <div style={{
        width:'100%', maxWidth:'520px',
        background:'var(--c-surface)',
        borderRadius:'24px 24px 0 0',
        borderTop:'1px solid var(--c-border)',
        padding:'24px 24px 32px',
        maxHeight:'85dvh', overflowY:'auto',
        transform: visible ? 'translateY(0)' : 'translateY(60px)',
        transition:'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Handle */}
        <div style={{ width:'36px', height:'4px', borderRadius:'4px', background:'var(--c-border2)', margin:'0 auto 20px' }} />

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'20px' }}>
          <div style={{
            width:'56px', height:'56px', borderRadius:'50%',
            background:'rgba(52,211,153,0.12)', border:'1px solid rgba(52,211,153,0.25)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'1.6rem', margin:'0 auto 12px',
          }}>🎉</div>
          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.15rem', color:'var(--c-text)', marginBottom:'6px' }}>
            Commande passée !
          </h2>
          {numeroCommande && (
            <p style={{ color:'var(--c-muted)', fontSize:'0.82rem', fontFamily:'var(--font-body)' }}>
              N° <span style={{ fontFamily:'var(--font-mono)', color:'var(--c-brand)' }}>{numeroCommande}</span>
            </p>
          )}
        </div>

        {/* Upsell prompt */}
        <div style={{
          background:'linear-gradient(135deg,rgba(249,124,10,0.08),rgba(249,124,10,0.03))',
          border:'1px solid rgba(249,124,10,0.2)',
          borderRadius:'14px', padding:'14px 16px', marginBottom:'16px',
          display:'flex', alignItems:'center', gap:'12px',
        }}>
          <span style={{ fontSize:'1.4rem', flexShrink:0 }}>🔧</span>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--c-text)', fontSize:'0.92rem', marginBottom:'3px' }}>
              Voulez-vous ajouter des accessoires ?
            </div>
            <div style={{ color:'var(--c-muted)', fontSize:'0.78rem', fontFamily:'var(--font-body)' }}>
              Livraison groupée avec votre gaz — même délai !
            </div>
          </div>
        </div>

        {/* Featured accessories */}
        {featured.length > 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'16px' }}>
            {featured.map(acc => {
              const imgUrl = getImageUrl(acc.imageUrl)
              return (
                <div key={acc._id} style={{
                  display:'flex', alignItems:'center', gap:'12px', padding:'10px 12px',
                  background:'var(--c-surface2)', borderRadius:'12px', border:'1px solid var(--c-border)',
                }}>
                  <div style={{ width:'44px', height:'44px', borderRadius:'10px', background:'var(--c-border)', flexShrink:0, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {imgUrl
                      ? <img src={imgUrl} alt={acc.nom} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { e.target.style.display='none' }} />
                      : <span style={{ fontSize:'1.3rem' }}>🔧</span>
                    }
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:'var(--font-display)', fontWeight:600, color:'var(--c-text)', fontSize:'0.85rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{acc.nom}</div>
                    <div style={{ color:'var(--c-muted)', fontSize:'0.72rem', fontFamily:'var(--font-mono)' }}>{acc.categorie}</div>
                  </div>
                  <div style={{ fontFamily:'var(--font-display)', fontWeight:800, color:'var(--c-brand)', fontSize:'0.9rem', flexShrink:0 }}>
                    {formatPrix(acc.prix)}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Actions */}
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          <button className="btn-primary" style={{ width:'100%' }} onClick={handleGoAccessoires}>
            🛒 Voir tous les accessoires
          </button>
          <button className="btn-ghost" style={{ width:'100%' }} onClick={handleClose}>
            Non merci, suivre ma commande
          </button>
        </div>
      </div>
    </div>
  )
}
