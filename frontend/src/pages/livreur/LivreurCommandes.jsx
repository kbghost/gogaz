import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commandeAPI } from '../../services/api'
import { formatPrix, formatDateRelative, getBadgeClass, statutLabel, marqueColors } from '../../utils/helpers'
import { useSocket } from '../../context/SocketContext'
import GasBottle from '../../components/ui/GasBottle'
import ProductImage from '../../components/ui/ProductImage'
import toast from 'react-hot-toast'

const TABS = [
  { val: 'en_attente',   label: 'En attente',  icon: '⏳' },
  { val: 'validee',      label: 'Validées',    icon: '✅' },
  { val: 'en_livraison', label: 'En cours',    icon: '🚚' },
  { val: 'livree',       label: 'Livrées',     icon: '🎉' },
]

export default function LivreurCommandes() {
  const qc = useQueryClient()
  const { updatePosition } = useSocket()
  const [statut, setStatut] = useState('en_attente')
  const [trackingId, setTrackingId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['lv-gaz', statut],
    queryFn: () => commandeAPI.getAll({ statut }),
    refetchInterval: 15000,
  })
  const commandes = data?.data?.commandes || []

  const updateMut = useMutation({
    mutationFn: ({ id, s }) => commandeAPI.updateStatut(id, { statut: s }),
    onSuccess: () => { qc.invalidateQueries(['lv-gaz']); qc.invalidateQueries(['lv-gaz-all']); toast.success('Statut mis à jour ✓') },
    onError: e => toast.error(e.response?.data?.message || 'Erreur'),
  })

  useEffect(() => {
    if (!trackingId) return
    const interval = setInterval(() => {
      navigator.geolocation?.getCurrentPosition(pos => {
        updatePosition(trackingId, pos.coords.latitude, pos.coords.longitude)
        commandeAPI.updatePosition(trackingId, { lat: pos.coords.latitude, lng: pos.coords.longitude })
      })
    }, 10000)
    toast.success('📍 GPS actif', { id: 'gps' })
    return () => { clearInterval(interval); toast.dismiss('gps') }
  }, [trackingId])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--c-text)' }}>Commandes gaz ⛽</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
        {TABS.map(t => (
          <button key={t.val} onClick={() => setStatut(t.val)} style={{
            flexShrink: 0, padding: '8px 14px', borderRadius: '99px', border: 'none', cursor: 'pointer',
            background: statut === t.val ? 'var(--c-brand)' : 'var(--c-surface2)',
            color: statut === t.val ? '#fff' : 'var(--c-muted)',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem',
            boxShadow: statut === t.val ? '0 0 12px rgba(249,124,10,0.3)' : 'none',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {isLoading && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--c-muted)' }}>Chargement…</div>}

      {!isLoading && commandes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--c-surface)', borderRadius: '18px', border: '1px solid var(--c-border)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
          <p style={{ color: 'var(--c-muted)', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>Aucune commande dans cette catégorie</p>
        </div>
      )}

      {commandes.map(c => {
        const color = marqueColors[c.marque] || '#f97c0a'
        return (
          <div key={c._id} style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '18px', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', gap: '12px', background: `${color}08` }}>
              <ProductImage imageUrl={c.produit?.imageUrl} couleur={color} poids={c.poids} marque={c.marque} size={44} objectFit="contain" />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-mono)', color, fontSize: '0.7rem' }}>{c.numeroCommande}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--c-text)', fontSize: '1rem' }}>{c.nomClient}</div>
                <div style={{ color: 'var(--c-muted)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>{c.telephoneClient}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={getBadgeClass(c.statut)} style={{ display: 'inline-flex', marginBottom: '4px' }}>{statutLabel[c.statut]?.icon} {statutLabel[c.statut]?.label}</span>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color, fontSize: '1rem' }}>{formatPrix(c.prixTotal)}</div>
              </div>
            </div>

            {/* ── Détails commande ── */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--c-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                ['Produit',   `${c.marque} ${c.poids}kg ×${c.quantite}`],
                ['Commandé',  formatDateRelative(c.createdAt)],
                c.adresseLivraison && ['Adresse', c.adresseLivraison],
                c.description      && ['Note',    c.description],
              ].filter(Boolean).map(([k, v]) => (
                <div key={k}>
                  <div style={{ color: 'var(--c-dim)', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</div>
                  <div style={{ color: 'var(--c-text)', fontSize: '0.82rem', fontFamily: 'var(--font-body)', fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* ── Itinéraire vers le client ── */}
            {c.localisation && (
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--c-border)', background: 'rgba(96,165,250,0.04)' }}>
                <div style={{ color: 'var(--c-dim)', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  📍 Point de livraison
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-muted)', fontSize: '0.72rem', marginBottom: '8px' }}>
                  {c.localisation.lat?.toFixed(5)}, {c.localisation.lng?.toFixed(5)}
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${c.localisation.lat},${c.localisation.lng}&travelmode=driving`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px', borderRadius: '12px', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem' }}
                >
                  🗺️ Ouvrir l'itinéraire GPS
                </a>
              </div>
            )}

            {/* ── Historique des statuts ── */}
            {c.historiqueStatuts?.length > 0 && (
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--c-border)', background: 'var(--c-surface2)' }}>
                <div style={{ color: 'var(--c-dim)', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  🕐 Historique
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {c.historiqueStatuts.slice().reverse().map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>
                        {statutLabel[h.statut]?.icon || '•'}
                      </span>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--c-text)', fontSize: '0.78rem' }}>
                        {statutLabel[h.statut]?.label || h.statut}
                      </span>
                      <span style={{ color: 'var(--c-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', marginLeft: 'auto' }}>
                        {fmtDate(h.date)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Actions ── */}
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {c.statut === 'validee' && (
                <button
                  className="btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => { updateMut.mutate({ id: c._id, s: 'en_livraison' }); setTrackingId(c._id) }}
                  disabled={updateMut.isPending}
                >
                  🚚 Démarrer la livraison
                </button>
              )}
              {c.statut === 'en_livraison' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    className="btn-primary"
                    onClick={() => { updateMut.mutate({ id: c._id, s: 'livree' }); setTrackingId(null) }}
                    disabled={updateMut.isPending}
                  >
                    🎉 Marquer livrée
                  </button>
                  <button
                    onClick={() => setTrackingId(p => p === c._id ? null : c._id)}
                    style={{
                      padding: '12px', borderRadius: '14px', cursor: 'pointer',
                      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem',
                      border: `1px solid ${trackingId === c._id ? 'rgba(248,113,113,0.3)' : 'rgba(96,165,250,0.3)'}`,
                      background: trackingId === c._id ? 'rgba(248,113,113,0.1)' : 'rgba(96,165,250,0.1)',
                      color: trackingId === c._id ? '#f87171' : '#60a5fa',
                    }}
                  >
                    {trackingId === c._id ? '⏹ Stop GPS' : '📍 Activer GPS'}
                  </button>
                </div>
              )}
            </div>

          </div>
        )
      })}
    </div>
  )
}

