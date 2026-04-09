export default function Logo({ height = 36, showText = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
      
      {/* Votre Image à la place du SVG */}
      <img 
        src="/logo.png"  // <-- Changez ici le nom si votre fichier s'appelle différemment
        alt="Logo GazLivraison" 
        style={{ 
          height: `${height}px`, 
          width: 'auto',
          objectFit: 'contain' 
        }} 
      />

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: `${height * 0.55}px`,
            letterSpacing: '-0.03em',
            color: 'var(--c-text)',
          }}>
            Gaz<span style={{ color: 'var(--c-brand)' }}>Express</span>
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: `${height * 0.25}px`,
            color: 'var(--c-muted)',
            letterSpacing: '0.08em',
            marginTop: '1px',
          }}>
            BÉNIN · LIVRAISON
          </span>
        </div>
      )}
    </div>
  )
}