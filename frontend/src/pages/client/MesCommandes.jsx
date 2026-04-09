import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../../components/ui/Navbar'
import GasBottle from '../../components/ui/GasBottle'
import { commandeAPI } from '../../services/api'
import { formatPrix, formatDateRelative, getBadgeClass, statutLabel, marqueColors } from '../../utils/helpers'

export default function MesCommandes() {
  const { data, isLoading } = useQuery({
    queryKey: ['mes-commandes'],
    queryFn: () => commandeAPI.getMesCommandes(),
  })
  const commandes = data?.data?.commandes || []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>
      <Navbar />
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: 'clamp(90px,14vw,120px) 20px 80px' }}>

        <div className="animate-fade-in" style={{ marginBottom: '32px', paddingTop: '8px' }}>
          <div className="pill" style={{ marginBottom: '12px', display: 'inline-flex' }}>Espace client</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.6rem,5vw,2.2rem)', color: 'var(--c-text)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Mes commandes
          </h1>
          <p style={{ color: 'var(--c-muted)', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>
            {commandes.length} commande(s) au total
          </p>
        </div>

        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Array(3).fill(0).map((_,i) => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '18px' }} />)}
          </div>
        )}

        {!isLoading && commandes.length === 0 && (
          <div className="card animate-scale-in" style={{ padding: '56px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>📦</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-text)', marginBottom: '8px' }}>Aucune commande</h3>
            <p style={{ color: 'var(--c-muted)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Vous n'avez pas encore commandé de gaz.
            </p>
            <Link to="/commander" className="btn-primary">Commander maintenant →</Link>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {commandes.map((c, i) => (
            <div key={c._id} className="card animate-slide-up" style={{ padding: '20px', animationDelay: `${i*0.06}s`, overflow: 'visible' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ flexShrink: 0 }}>
                  <GasBottle color={marqueColors[c.marque] || '#f97c0a'} poids={c.poids} size={52} marque={c.marque} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', color: '#f97c0a', fontSize: '0.72rem', marginBottom: '2px' }}>{c.numeroCommande}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-text)', fontSize: '0.95rem' }}>
                        {c.marque} · {c.poids}kg × {c.quantite}
                      </div>
                      <div style={{ color: 'var(--c-dim)', fontSize: '0.8rem', fontFamily: 'var(--font-body)', marginTop: '2px' }}>{formatDateRelative(c.createdAt)}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span className={getBadgeClass(c.statut)} style={{ display: 'inline-flex' }}>{statutLabel[c.statut]?.icon} {statutLabel[c.statut]?.label}</span>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#f97c0a', marginTop: '6px' }}>{formatPrix(c.prixTotal)}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--c-border)' }}>
                    <Link to={`/suivi/${c.numeroCommande}`} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      color: '#f97c0a', fontSize: '0.82rem', textDecoration: 'none',
                      fontFamily: 'var(--font-display)', fontWeight: 600,
                    }}>
                      📍 Suivre la livraison →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
