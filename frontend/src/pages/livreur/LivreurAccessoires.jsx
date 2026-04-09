import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commandeAccAPI } from '../../services/api'
import { formatPrix, formatDateRelative, getBadgeClass, statutLabel } from '../../utils/helpers'
import { useSocket } from '../../context/SocketContext'
import toast from 'react-hot-toast'

export default function LivreurAccessoires() {
  const qc = useQueryClient()
  const { updatePosition } = useSocket()
  const [statut, setStatut] = useState('en_attente')
  const [trackingId, setTrackingId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['lv-acc-list', statut],
    queryFn: () => commandeAccAPI.getAll({ statut: statut || undefined }),
    refetchInterval: 15000,
  })
  const commandes = data?.data?.commandes || []

  const updateMut = useMutation({
    mutationFn: ({ id, s }) => commandeAccAPI.updateStatut(id, { statut: s }),
    onSuccess: () => { qc.invalidateQueries(['lv-acc-list']); qc.invalidateQueries(['lv-acc']); toast.success('Statut mis à jour ✓') },
    onError: e => toast.error(e.response?.data?.message || 'Erreur'),
  })

  useEffect(() => {
    if (!trackingId) return
    const interval = setInterval(() => {
      navigator.geolocation?.getCurrentPosition(pos => {
        updatePosition(trackingId, pos.coords.latitude, pos.coords.longitude)
      })
    }, 10000)
    toast.success('📍 GPS actif', { id: 'gps-acc' })
    return () => { clearInterval(interval); toast.dismiss('gps-acc') }
  }, [trackingId])

  const TABS = [
    { val: 'en_attente', label: '⏳ En attente' },
    { val: 'validee',    label: '✅ Validées' },
    { val: 'en_livraison', label: '🚚 En cours' },
    { val: 'livree',     label: '🎉 Livrées' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.3rem,4vw,1.8rem)', color: 'var(--c-text)', letterSpacing: '-0.02em' }}>
        🔧 Commandes accessoires
      </h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {TABS.map(t => (
          <button key={t.val} onClick={() => setStatut(t.val)} style={{ flexShrink: 0, padding: '8px 16px', borderRadius: '99px', border: '1px solid var(--c-border)', background: statut === t.val ? 'var(--c-brand)' : 'var(--c-surface2)', color: statut === t.val ? '#fff' : 'var(--c-muted)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', boxShadow: statut === t.val ? '0 0 16px rgba(249,124,10,0.3)' : 'none' }}>
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--c-muted)' }}>Chargement…</div>}
      {!isLoading && commandes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', background: 'var(--c-surface)', borderRadius: '18px', border: '1px solid var(--c-border)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '14px' }}>📭</div>
          <p style={{ color: 'var(--c-muted)', fontFamily: 'var(--font-body)' }}>Aucune commande dans cette catégorie.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {commandes.map(c => (
          <div key={c._id} style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '18px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', color: '#3b82f6', fontSize: '0.72rem', marginBottom: '3px' }}>{c.numeroCommande}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-text)', fontSize: '1rem' }}>{c.nomClient}</div>
                <div style={{ color: 'var(--c-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{c.telephoneClient}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={getBadgeClass(c.statut)} style={{ display: 'inline-flex' }}>{statutLabel[c.statut]?.icon} {statutLabel[c.statut]?.label}</span>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--c-brand)', fontSize: '1.1rem', marginTop: '6px' }}>{formatPrix(c.prixTotal)}</div>
              </div>
            </div>

            {/* Items */}
            <div style={{ background: 'var(--c-surface2)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ color: 'var(--c-muted)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Articles ({c.items?.length})</div>
              {c.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem' }}>
                  <span style={{ color: 'var(--c-muted)' }}>🔧 {item.nom} ×{item.quantite}</span>
                  <span style={{ color: 'var(--c-text)', fontWeight: 600 }}>{formatPrix(item.prix * item.quantite)}</span>
                </div>
              ))}
              {c.adresseLivraison && (
                <div style={{ color: 'var(--c-muted)', fontSize: '0.78rem', marginTop: '4px' }}>📍 {c.adresseLivraison}</div>
              )}
              {c.description && (
                <div style={{ color: 'var(--c-dim)', fontSize: '0.75rem', fontStyle: 'italic' }}>💬 {c.description}</div>
              )}
              <div style={{ color: 'var(--c-dim)', fontSize: '0.72rem', marginTop: '2px' }}>🕐 {formatDateRelative(c.createdAt)}</div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {c.statut === 'validee' && (
                <button onClick={() => { updateMut.mutate({ id: c._id, s: 'en_livraison' }); setTrackingId(c._id) }}
                  disabled={updateMut.isPending}
                  style={{ width: '100%', padding: '13px', borderRadius: '14px', border: '1px solid rgba(249,124,10,0.3)', background: 'rgba(249,124,10,0.08)', color: 'var(--c-brand)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  🚚 Démarrer la livraison
                </button>
              )}
              {c.statut === 'en_livraison' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button onClick={() => updateMut.mutate({ id: c._id, s: 'livree' })} disabled={updateMut.isPending}
                    style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)', color: '#22c55e', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                    🎉 Marquer livrée
                  </button>
                  <button onClick={() => setTrackingId(prev => prev === c._id ? null : c._id)}
                    style={{ padding: '12px', borderRadius: '12px', border: `1px solid ${trackingId === c._id ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)'}`, background: trackingId === c._id ? 'rgba(239,68,68,0.08)' : 'rgba(59,130,246,0.08)', color: trackingId === c._id ? '#ef4444' : '#3b82f6', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                    {trackingId === c._id ? '⏹ Stop GPS' : '📍 GPS'}
                  </button>
                </div>
              )}
              {c.localisation && (
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${c.localisation.lat},${c.localisation.lng}`}
                  target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '12px', border: '1px solid var(--c-border2)', background: 'var(--c-surface2)', color: 'var(--c-muted)', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.85rem' }}>
                  🗺️ Ouvrir l'itinéraire
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
