import { useEffect, useRef, useState } from 'react'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || ''

// Default: Cotonou, Bénin
const DEFAULT_POS = { lat: 6.3654, lng: 2.4183 }

let googleMapsLoaded = false
let loadPromise = null

function loadGoogleMaps(apiKey) {
  if (googleMapsLoaded) return Promise.resolve()
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    if (window.google?.maps) { googleMapsLoaded = true; resolve(); return }

    const script = document.createElement('script')
    script.src = apiKey
      ? `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      : `https://maps.googleapis.com/maps/api/js?libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => { googleMapsLoaded = true; resolve() }
    script.onerror = () => reject(new Error('Google Maps failed to load'))
    document.head.appendChild(script)
  })
  return loadPromise
}

export default function GoogleMapPicker({ position, onPositionChange, height = 300 }) {
  const mapDivRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)

  const pos = position || DEFAULT_POS

  useEffect(() => {
    let cancelled = false

    loadGoogleMaps(GOOGLE_MAPS_API_KEY)
      .then(() => {
        if (cancelled || !mapDivRef.current) return

        const map = new window.google.maps.Map(mapDivRef.current, {
          center: { lat: pos.lat, lng: pos.lng },
          zoom: 15,
          mapTypeId: 'roadmap',
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#1a1917' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1917' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#8a8279' }] },
            { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
            { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#8a8279' }] },
            { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#181816' }] },
            { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c2a26' }] },
            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212121' }] },
            { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
            { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3d3a35' }] },
            { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1a1917' }] },
            { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
            { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
            { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
            { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d4c5a' }] },
            { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#0e1626' }] },
          ],
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false,
        })
        mapRef.current = map

        // Custom flame marker
        const marker = new window.google.maps.Marker({
          position: { lat: pos.lat, lng: pos.lng },
          map,
          draggable: true,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#f97c0a',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          },
          title: '📍 Point de livraison',
          animation: window.google.maps.Animation.DROP,
        })
        markerRef.current = marker

        marker.addListener('dragend', () => {
          const p = marker.getPosition()
          onPositionChange({ lat: p.lat(), lng: p.lng() })
        })

        map.addListener('click', (e) => {
          const lat = e.latLng.lat()
          const lng = e.latLng.lng()
          marker.setPosition({ lat, lng })
          onPositionChange({ lat, lng })
        })

        if (!cancelled) setReady(true)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => { cancelled = true }
  }, [])

  // Update marker on external position change
  useEffect(() => {
    if (mapRef.current && markerRef.current && position) {
      const p = { lat: position.lat, lng: position.lng }
      markerRef.current.setPosition(p)
      mapRef.current.panTo(p)
    }
  }, [position?.lat, position?.lng])

  return (
    <div style={{ position: 'relative', borderRadius: '18px', overflow: 'hidden', border: '1px solid var(--c-border2)', height }}>
      <div ref={mapDivRef} style={{ width: '100%', height: '100%' }} />
      {!ready && !error && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '12px',
          background: 'var(--c-surface2)',
        }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid var(--c-border2)', borderTopColor: '#f97c0a', animation: 'spin 1s linear infinite' }} />
          <span style={{ color: 'var(--c-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>
            {GOOGLE_MAPS_API_KEY ? 'Chargement Google Maps…' : 'Carte non configurée — ajoutez VITE_GOOGLE_MAPS_KEY dans .env'}
          </span>
        </div>
      )}
      {error && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '8px',
          background: 'var(--c-surface2)',
        }}>
          <span style={{ fontSize: '2rem' }}>🗺️</span>
          <span style={{ color: 'var(--c-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-body)', textAlign: 'center', padding: '0 20px' }}>
            Impossible de charger Google Maps.<br/>Vérifiez la clé API dans le fichier .env
          </span>
        </div>
      )}
    </div>
  )
}
