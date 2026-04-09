import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { commandeAPI } from '../../services/api'
import { getBadgeClass, statutLabel, marqueColors } from '../../utils/helpers'

const STATUTS = ['en_attente','validee','en_livraison','livree']
const STAT_COLORS = { en_attente:'#fbbf24', validee:'#60a5fa', en_livraison:'#f97c0a', livree:'#34d399' }

export default function AdminCarte() {
  const mapRef = useRef(null)
  const mapInstRef = useRef(null)
  const markersRef = useRef([])
  const [mapReady, setMapReady] = useState(false)
  const [filterStatut, setFilterStatut] = useState('en_attente')

  const { data } = useQuery({
    queryKey: ['commandes-carte', filterStatut],
    queryFn: () => commandeAPI.getAll(filterStatut ? { statut: filterStatut } : {}),
    refetchInterval: 20000,
  })
  const commandes = data?.data?.commandes || []

  // Load Leaflet
  useEffect(() => {
    if (mapInstRef.current) return
    import('leaflet').then(L => {
      if (!mapRef.current || mapInstRef.current) return
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })
      const map = L.map(mapRef.current).setView([6.3654, 2.4183], 12)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map)
      mapInstRef.current = map
      setMapReady(true)
    })
    return () => { if (mapInstRef.current) { mapInstRef.current.remove(); mapInstRef.current = null } }
  }, [])

  // Update markers
  useEffect(() => {
    if (!mapInstRef.current || !mapReady) return
    import('leaflet').then(L => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      commandes.filter(c => c.localisation?.lat).forEach(c => {
        const color = STAT_COLORS[c.statut] || '#f97c0a'
        const icon = L.divIcon({
          html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 6px ${color}"></div>`,
          className: '', iconSize: [14, 14], iconAnchor: [7, 7],
        })
        const m = L.marker([c.localisation.lat, c.localisation.lng], { icon })
          .addTo(mapInstRef.current)
          .bindPopup(`<div style="font-family:sans-serif;font-size:13px;min-width:160px"><b>${c.numeroCommande}</b><br/>${c.nomClient}<br/>${c.marque} ${c.poids}kg<br/><span style="color:${color}">${statutLabel[c.statut]?.label}</span></div>`)
        markersRef.current.push(m)
      })
    })
  }, [commandes, mapReady])

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }} className="animate-fade-in">
      <div>
        <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'clamp(1.3rem,4vw,1.8rem)', color:'var(--c-text)', letterSpacing:'-0.02em' }}>Carte live</h1>
        <p style={{ color:'var(--c-muted)', fontSize:'0.82rem', marginTop:'4px', fontFamily:'var(--font-body)' }}>Positions des commandes en temps réel</p>
      </div>

      {/* Filter */}
      <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
        {STATUTS.map(s => (
          <button key={s} onClick={() => setFilterStatut(s)} style={{
            padding:'7px 15px', borderRadius:'99px', border:`1px solid ${filterStatut===s ? STAT_COLORS[s] : 'var(--c-border)'}`,
            background: filterStatut===s ? `${STAT_COLORS[s]}18` : 'var(--c-surface2)',
            color: filterStatut===s ? STAT_COLORS[s] : 'var(--c-muted)',
            fontFamily:'var(--font-display)', fontWeight:600, fontSize:'0.82rem', cursor:'pointer',
          }}>
            {statutLabel[s]?.icon} {statutLabel[s]?.label} ({commandes.filter(c => c.statut===s).length})
          </button>
        ))}
      </div>

      {/* Map */}
      <div style={{ borderRadius:'18px', overflow:'hidden', border:'1px solid var(--c-border)', position:'relative', height:'calc(100vh - 280px)', minHeight:'360px' }}>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <div ref={mapRef} style={{ width:'100%', height:'100%' }} />
        {!mapReady && (
          <div style={{ position:'absolute', inset:0, background:'var(--c-surface2)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'12px' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'50%', border:'3px solid var(--c-border2)', borderTopColor:'var(--c-brand)', animation:'spin 1s linear infinite' }} />
            <span style={{ color:'var(--c-muted)', fontSize:'0.85rem', fontFamily:'var(--font-body)' }}>Chargement de la carte…</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display:'flex', gap:'16px', flexWrap:'wrap', padding:'12px 16px', background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'12px' }}>
        {STATUTS.map(s => (
          <div key={s} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:STAT_COLORS[s], boxShadow:`0 0 6px ${STAT_COLORS[s]}` }} />
            <span style={{ color:'var(--c-muted)', fontSize:'0.75rem', fontFamily:'var(--font-body)' }}>{statutLabel[s]?.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
