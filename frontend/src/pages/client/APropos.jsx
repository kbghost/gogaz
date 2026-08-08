import { Link } from 'react-router-dom'
import Navbar from '../../components/ui/Navbar'
import GasBottle from '../../components/ui/GasBottle'

const VALEURS = [
  { icon: '⚡', title: 'Rapidité', desc: 'Livraison garantie en moins de 30 minutes dans Cotonou et ses environs.' },
  { icon: '💯', title: 'Fiabilité', desc: 'Service disponible 24h/7j. Nos livreurs sont formés et professionnels.' },
  { icon: '🔍', title: 'Transparence', desc: 'Prix affichés sans surprise. Paiement uniquement à la réception.' },
  { icon: '🌍', title: 'Local', desc: 'Entreprise béninoise, au service des familles et entreprises du Bénin.' },
]

export default function APropos() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(90px,14vw,120px) 20px 80px' }}>

        {/* Hero */}
        <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '72px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px', alignItems: 'flex-end' }}>
            {[['#E53935', 6, 'Oryx', '12px'], ['#f97c0a', 12.5, 'PUMA GAZ', '0px'], ['#16a34a', 25, 'Bénin Petro', '8px']].map(([c, p, m, o], i) => (
              <div key={i} style={{ transform: `translateY(${o})`, animation: `float ${3+i*0.5}s ease-in-out ${i*0.3}s infinite` }}>
                <GasBottle color={c} poids={p} size={i===1?90:70} marque={m} />
              </div>
            ))}
          </div>
          <div className="pill" style={{ marginBottom: '16px', display: 'inline-flex' }}>Notre histoire</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.8rem,6vw,3rem)', color: 'var(--c-text)', letterSpacing: '-0.02em', marginBottom: '20px' }}>
            Né au Bénin,<br />pour les Béninois
          </h1>
          <p style={{ color: 'var(--c-muted)', fontFamily: 'var(--font-body)', fontSize: '1rem', lineHeight: 1.8, maxWidth: '560px', margin: '0 auto' }}>
            GoGaz est né d'un constat simple : trop de familles béninoises se retrouvaient en panne de gaz au mauvais moment. Nous avons créé un service de livraison rapide, fiable et transparent pour résoudre ce problème une fois pour toutes.
          </p>
        </div>

        {/* Mission */}
        <div className="card animate-slide-up" style={{ padding: '36px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(249,124,10,0.08), transparent)', pointerEvents: 'none' }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#f97c0a', marginBottom: '12px', letterSpacing: '0.08em' }}>NOTRE MISSION</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--c-text)', marginBottom: '16px', letterSpacing: '-0.01em' }}>
            "Rendre le gaz accessible à tous, partout, maintenant."
          </h2>
          <p style={{ color: 'var(--c-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.8, fontSize: '0.95rem' }}>
            Nous connectons les fournisseurs de gaz avec les particuliers et les entreprises à Cotonou. 
            Notre plateforme digitale simplifie la commande, le paiement et le suivi, pour une expérience sans friction.
          </p>
        </div>

        {/* Valeurs */}
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--c-text)', marginBottom: '20px', letterSpacing: '-0.01em' }}>Nos valeurs</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '14px' }}>
            {VALEURS.map((v, i) => (
              <div key={i} className="card" style={{ padding: '22px', animationDelay: `${i*0.1}s` }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '10px' }}>{v.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-text)', marginBottom: '6px' }}>{v.title}</h3>
                <p style={{ color: 'var(--c-muted)', fontSize: '0.85rem', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link to="/commander" className="btn-primary glow" style={{ fontSize: '1rem', padding: '16px 36px' }}>
            Essayer GoGaz →
          </Link>
        </div>
      </div>
    </div>
  )
}
