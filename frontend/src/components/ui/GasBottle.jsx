/**
 * GasBottle — Illustration SVG réaliste d'une bouteille de gaz
 * Props:
 *   color      : string  — couleur principale hex
 *   poids      : number  — 6 | 12.5 | 25
 *   size       : number  — largeur en px (défaut 80)
 *   marque     : string  — nom de la marque affiché sur l'étiquette
 *   className  : string
 */
export default function GasBottle({ color = '#F97C0A', poids = 12.5, size = 80, marque = '', className = '' }) {
  // Proportions selon poids
  const scaleW = poids === 6 ? 0.80 : poids === 25 ? 1.12 : 1
  const scaleH = poids === 6 ? 0.85 : poids === 25 ? 1.10 : 1

  const darken = (hex, amt = 55) => {
    const n = parseInt(hex.replace('#',''), 16)
    const r = Math.max(0, (n >> 16) - amt)
    const g = Math.max(0, ((n >> 8) & 0xff) - amt)
    const b = Math.max(0, (n & 0xff) - amt)
    return `rgb(${r},${g},${b})`
  }
  const lighten = (hex, amt = 50) => {
    const n = parseInt(hex.replace('#',''), 16)
    const r = Math.min(255, (n >> 16) + amt)
    const g = Math.min(255, ((n >> 8) & 0xff) + amt)
    const b = Math.min(255, (n & 0xff) + amt)
    return `rgb(${r},${g},${b})`
  }

  const light = lighten(color, 55)
  const dark  = darken(color, 65)
  const mid   = darken(color, 25)
  const uid   = `b${color.replace('#','')}-${poids}-${Math.random().toString(36).slice(2,6)}`

  const W  = 80 * scaleW
  const H  = 132 * scaleH
  const cx = W / 2

  // Short brand label for the bottle
  const brandShort = marque === 'TotalEnergies' ? 'Total' :
                     marque === 'Bénin Petro'   ? 'BéninP.' :
                     marque === 'Autres'         ? 'Gaz' :
                     marque || ''

  return (
    <svg
      width={size}
      height={size * (H / W)}
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-xl ${className}`}
      aria-label={`Bouteille de gaz ${poids}kg${marque ? ' ' + marque : ''}`}
    >
      <defs>
        <linearGradient id={`gb-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={dark}  />
          <stop offset="28%"  stopColor={color} />
          <stop offset="62%"  stopColor={light} />
          <stop offset="100%" stopColor={mid}   />
        </linearGradient>
        <linearGradient id={`gc-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#888" />
          <stop offset="100%" stopColor="#2c2c2c" />
        </linearGradient>
        <linearGradient id={`gv-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#d0d0d0" />
          <stop offset="100%" stopColor="#444" />
        </linearGradient>
        <linearGradient id={`gs-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="white" stopOpacity="0.38" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`gsh-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="black" stopOpacity="0.40" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`cc-${uid}`}>
          <rect x={cx - W*0.38} y={H*0.175} width={W*0.76} height={H*0.755} rx={W*0.13} />
        </clipPath>
      </defs>

      {/* Shadow */}
      <ellipse cx={cx} cy={H*0.975} rx={W*0.30} ry={H*0.022} fill={`url(#gsh-${uid})`} />

      {/* Foot ring */}
      <ellipse cx={cx} cy={H*0.942} rx={W*0.40} ry={H*0.038} fill={darken(color, 85)} />
      <ellipse cx={cx} cy={H*0.930} rx={W*0.37} ry={H*0.026} fill={darken(color, 70)} />

      {/* Body */}
      <rect x={cx - W*0.38} y={H*0.175} width={W*0.76} height={H*0.755} rx={W*0.13} fill={`url(#gb-${uid})`} />

      {/* Shine strip */}
      <rect x={cx - W*0.07} y={H*0.21} width={W*0.11} height={H*0.68}
        rx={W*0.055} fill={`url(#gs-${uid})`} clipPath={`url(#cc-${uid})`} />

      {/* White label band */}
      <rect x={cx - W*0.38} y={H*0.40} width={W*0.76} height={H*0.28}
        fill="white" fillOpacity="0.11" clipPath={`url(#cc-${uid})`} />

      {/* Brand name on label */}
      {brandShort && (
        <text x={cx} y={H*0.495}
          textAnchor="middle"
          fontFamily="'Outfit', sans-serif"
          fontWeight="800"
          fontSize={W * 0.155}
          fill="white"
          fillOpacity="0.92"
          clipPath={`url(#cc-${uid})`}
        >
          {brandShort}
        </text>
      )}

      {/* Weight */}
      <text x={cx} y={H*0.61}
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontWeight="700"
        fontSize={W * 0.195}
        fill="white"
        fillOpacity="0.80"
        clipPath={`url(#cc-${uid})`}
      >
        {poids}kg
      </text>

      {/* Shoulder */}
      <path d={`M${cx - W*0.38},${H*0.255}
          Q${cx - W*0.38},${H*0.14} ${cx - W*0.17},${H*0.115}
          L${cx + W*0.17},${H*0.115}
          Q${cx + W*0.38},${H*0.14} ${cx + W*0.38},${H*0.255}Z`}
        fill={`url(#gb-${uid})`} />

      {/* Neck */}
      <rect x={cx - W*0.13} y={H*0.065} width={W*0.26} height={H*0.075}
        rx={W*0.045} fill={`url(#gc-${uid})`} />

      {/* Handle ring */}
      <rect x={cx - W*0.20} y={H*0.125} width={W*0.40} height={H*0.032}
        rx={W*0.016} fill={darken(color, 50)} />

      {/* Top cap */}
      <ellipse cx={cx} cy={H*0.066} rx={W*0.18} ry={H*0.020} fill="#999" />
      <rect x={cx - W*0.13} y={H*0.052} width={W*0.26} height={H*0.022}
        rx={W*0.022} fill={`url(#gc-${uid})`} />

      {/* Valve body */}
      <rect x={cx - W*0.065} y={H*0.018} width={W*0.13} height={H*0.046}
        rx={W*0.018} fill={`url(#gv-${uid})`} />
      <ellipse cx={cx} cy={H*0.018} rx={W*0.075} ry={H*0.015} fill="#c8c8c8" />

      {/* Valve knob */}
      <rect x={cx - W*0.038} y={H*0.002} width={W*0.076} height={H*0.018}
        rx={W*0.014} fill="#e0e0e0" />
    </svg>
  )
}
