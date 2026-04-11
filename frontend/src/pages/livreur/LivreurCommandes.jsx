import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commandeAPI } from '../../services/api'
import { formatPrix, formatDateRelative, getBadgeClass, statutLabel, marqueColors } from '../../utils/helpers'
import { useSocket } from '../../context/SocketContext'
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
    onSuccess: (res, variables) => { 
      qc.invalidateQueries(['lv-gaz'])
      qc.invalidateQueries(['lv-gaz-all'])
      toast.success('Statut mis à jour ✓')
      
      // Activer le tracking si on passe en livraison, sinon on l'arrête
      if (variables.s === 'en_livraison') {
        setTrackingId(variables.id)
      } else if (trackingId === variables.id) {
        setTrackingId(null)
      }
    },
    onError: e => toast.error(e.response?.data?.message || 'Erreur'),
  })

  useEffect(() => {
    if (!trackingId) return
    
    const interval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          const { latitude, longitude } = pos.coords
          // Envoi via Socket pour le temps réel (Admin)
          updatePosition(trackingId, latitude, longitude)
          // Mise à jour API pour l'historique
          commandeAPI.updatePosition(trackingId, { lat: latitude, lng: longitude })
        })
      }
    }, 10000)

    toast.success('📍 GPS actif', { id: 'gps' })
    
    return () => { 
      clearInterval(interval)
      toast.dismiss('gps')
    }
  }, [trackingId, updatePosition])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px', margin: '0 auto', padding: '10px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--c-text)' }}>Commandes gaz ⛽</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
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
          <div key={c._id} style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '18px', overflow: 'hidden', marginBottom: '8px' }}>
            
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

            {/* Details */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--c-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                ['Produit', `${c.marque} ${c.poids}kg ×${c.quantite}`],
                ['Commandé', formatDateRelative(c.createdAt)],
                c.adresseLivraison && ['Adresse', c.adresseLivraison],
                c.description && ['Note', c.description],
              ].filter(Boolean).map(([k, v]) => (
                <div key={k}>
                  <div style={{ color: 'var(--c-dim)', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</div>
                  <div style={{ color: 'var(--c-text)', fontSize: '0.82rem', fontFamily: 'var(--font-body)', fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Actions (Indispensable pour faire avancer la commande) */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--c-border)', display: 'flex', gap: '10px' }}>
              {c.statut === 'validee' && (
                <button 
                  onClick={() => updateMut.mutate({ id: c._id, s: 'en_livraison' })}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: 'var(--c-brand)', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                >
                  🚚 Démarrer la livraison
                </button>
              )}
              {c.statut === 'en_livraison' && (
                <button 
                  onClick={() => updateMut.mutate({ id: c._id, s: 'livree' })}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#10b981', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                >
                  🎉 Marquer comme livrée
                </button>
              )}
            </div>

            {/* Historique */}
            {c.historiqueStatuts?.length > 0 && (
              <div style={{ padding: '12px 16px', background: 'var(--c-surface2)' }}>
                <div style={{ color: 'var(--c-dim)', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  🕐 Historique
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {c.historiqueStatuts.slice().reverse().map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.9rem' }}>{statutLabel[h.statut]?.icon || '•'}</span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--c-text)', fontSize: '0.78rem' }}>
                          {
