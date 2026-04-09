import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../../components/ui/Navbar'
import { commandeAccAPI } from '../../services/api'
import { formatPrix, formatDate, formatDateRelative, statutLabel, getBadgeClass } from '../../utils/helpers'

const STEPS = ['en_attente','validee','en_livraison','livree']

export default function SuiviAccessoires() {
  const { numero } = useParams()
  const navigate = useNavigate()
  const [searchNum, setSearchNum] = useState(numero || '')
  const [commandeNum, setCommandeNum] = useState(numero || '')

  const { data, isLoading, error } = useQuery({
    queryKey: ['track-acc', commandeNum],
    queryFn: () => commandeAccAPI.track(commandeNum),
    enabled: !!commandeNum,
    refetchInterval: 30000,
  })
  const commande = data?.data?.commande

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchNum.trim()) return
    const n = searchNum.trim().toUpperCase()
    setCommandeNum(n)
    navigate(`/suivi-accessoires/${n}`, { replace: true })
  }

  const currentStep = commande ? (commande.statut === 'annulee' ? -1 : STEPS.indexOf(commande.statut)) : -1

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>
      <Navbar />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'clamp(90px,14vw,110px) 20px 80px' }}>

        <div className="animate-fade-in" style={{ marginBottom: '28px' }}>
          <div className="pill" style={{ marginBottom: '12px', display: 'inline-flex' }}>Suivi accessoires</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.6rem,5vw,2.2rem)', color: 'var(--c-text)', letterSpacing: '-0.02em' }}>
            Suivre ma commande
          </h1>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <input type="text" style={{ flex: 1, padding: '13px 16px', borderRadius: '14px', border: '1px solid var(--c-border2)', background: 'var(--c-surface2)', color: 'var(--c-text)', fontFamily: 'var(--font-mono)', fontSize: '16px', outline: 'none' }}
            placeholder="Ex: ACC-260321-0001" value={searchNum}
            onChange={e => setSearchNum(e.target.value.toUpperCase())} />
          <button type="submit" className="btn-primary" style={{ padding: '13px 20px' }}>🔍</button>
        </form>

        {isLoading && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--c-muted)' }}>Recherche…</div>}
        {error && (
          <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>❌</div>
            <p style={{ color: '#f87171', fontFamily: 'var(--font-body)' }}>Commande introuvable. Vérifiez le numéro.</p>
          </div>
        )}

        {commande && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-slide-up">
            {/* Header */}
            <div style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '18px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-brand)', fontSize: '0.78rem', marginBottom: '4px' }}>{commande.numeroCommande}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-text)', fontSize: '1rem' }}>{commande.nomClient}</div>
                  <div style={{ color: 'var(--c-muted)', fontSize: '0.82rem', marginTop: '2px' }}>{formatDateRelative(commande.createdAt)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={getBadgeClass(commande.statut)} style={{ display: 'inline-flex' }}>{statutLabel[commande.statut]?.icon} {statutLabel[commande.statut]?.label}</span>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--c-brand)', fontSize: '1.3rem', marginTop: '8px' }}>{formatPrix(commande.prixTotal)}</div>
                </div>
              </div>

              {/* Items */}
              <div style={{ borderTop: '1px solid var(--c-border)', paddingTop: '14px' }}>
                <div style={{ color: 'var(--c-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Articles commandés</div>
                {commande.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '4px 0', color: 'var(--c-muted)' }}>
                    <span>{item.nom} ×{item.quantite}</span>
                    <span style={{ color: 'var(--c-text)', fontWeight: 600 }}>{formatPrix(item.prix * item.quantite)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress */}
            {commande.statut !== 'annulee' && (
              <div style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '18px', padding: '20px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-text)', fontSize: '0.9rem', marginBottom: '20px' }}>Progression</div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {STEPS.map((s, i) => {
                    const done   = currentStep > i
                    const active = currentStep === i
                    return (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length-1 ? 1 : 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', transition: 'all 0.3s', background: done ? '#16a34a22' : active ? 'rgba(249,124,10,0.15)' : 'var(--c-surface2)', border: `2px solid ${done ? '#16a34a' : active ? 'var(--c-brand)' : 'var(--c-border2)'}` }}>
                            {statutLabel[s]?.icon}
                          </div>
                          <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-body)', color: active ? 'var(--c-brand)' : done ? '#16a34a' : 'var(--c-dim)', textAlign: 'center', width: '56px', lineHeight: 1.3 }}>{statutLabel[s]?.label}</span>
                        </div>
                        {i < STEPS.length-1 && (
                          <div style={{ flex: 1, height: '2px', margin: '0 4px 20px', background: done ? '#16a34a' : 'var(--c-border2)', transition: 'all 0.5s' }} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {commande.livreur && (
              <div style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '18px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(249,124,10,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>🚚</div>
                <div>
                  <div style={{ color: 'var(--c-muted)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>Livreur assigné</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-text)' }}>{commande.livreur.nom}</div>
                  <div style={{ color: 'var(--c-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{commande.livreur.telephone}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
