import { useEffect, useRef, useState } from 'react'

// Dynamic import of Leaflet to avoid SSR issues
export default function MapPicker({ position, onPositionChange }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)

  // Default position: Cotonou, Bénin
  const defaultPos = position || { lat: 6.3654, lng: 2.4183 }

  useEffect(() => {
    if (mapInstanceRef.current) return

    // Dynamically import leaflet
    import('leaflet').then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return

      // Fix default icon
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current).setView([defaultPos.lat, defaultPos.lng], 14)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map)

      const marker = L.marker([defaultPos.lat, defaultPos.lng], { draggable: true }).addTo(map)
      markerRef.current = marker
      marker.bindPopup('📍 Votre position de livraison').openPopup()

      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng()
        onPositionChange({ lat: pos.lat, lng: pos.lng })
      })

      map.on('click', (e) => {
        const { lat, lng } = e.latlng
        marker.setLatLng([lat, lng])
        onPositionChange({ lat, lng })
      })

      setMapReady(true)
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update marker when position changes externally
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && position) {
      markerRef.current.setLatLng([position.lat, position.lng])
      mapInstanceRef.current.setView([position.lat, position.lng], 15)
    }
  }, [position?.lat, position?.lng])

  return (
    <div className="relative rounded-2xl overflow-hidden border border-ink-700" style={{ height: '300px' }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      {!mapReady && (
        <div className="absolute inset-0 bg-ink-800 flex items-center justify-center">
          <div className="text-ink-400 font-body text-sm">Chargement de la carte...</div>
        </div>
      )}
    </div>
  )
}
