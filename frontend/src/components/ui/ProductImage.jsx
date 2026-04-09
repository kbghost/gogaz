import { useState } from 'react'
import { getImageUrl } from '../../services/api'
import GasBottle from './GasBottle'

/**
 * ProductImage — displays a real product photo if available,
 * falls back to the SVG GasBottle illustration.
 *
 * Props:
 *   imageUrl : string | null — from DB (upload path or external URL)
 *   couleur  : string        — brand color for SVG fallback
 *   poids    : number        — for SVG fallback sizing
 *   marque   : string        — for SVG label
 *   size     : number        — px dimension for both image and SVG
 *   className: string
 *   style    : object
 */
export default function ProductImage({
  imageUrl,
  couleur = '#f97c0a',
  poids = 12.5,
  marque = '',
  size = 180,
  className = '',
  style = {},
  objectFit = 'contain',
}) {
  const [imgError, setImgError] = useState(false)
  const fullUrl = getImageUrl(imageUrl)

  if (!fullUrl || imgError) {
    return (
      <div className={className} style={{ width: size, height: size * 1.3, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
        <GasBottle color={couleur} poids={poids} size={size} marque={marque} />
      </div>
    )
  }

  return (
    <img
      src={fullUrl}
      alt={`${marque} ${poids}kg`}
      className={className}
      onError={() => setImgError(true)}
      style={{
        width: size,
        height: size,
        objectFit,
        borderRadius: '8px',
        display: 'block',
        ...style,
      }}
    />
  )
}
