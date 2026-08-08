import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { commandeAPI, commandeAccAPI } from '../../services/api'
import { formatPrix, formatDateRelative, getBadgeClass, statutLabel, marqueColors } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import Icon from '../../components/ui/Icons'

export default function LivreurDashboard() {
  const { user } = useAuth()

  const { data: gaz } = useQuery({
    queryKey: ['lv-gaz-all'],
    queryFn: () => commandeAPI.getAll({}),
    refetchInterval: 15000,
  })
  const { data: acc } = useQuery({
    queryKey: ['lv-acc-all'],
    queryFn: () => commandeAccAPI.getAll({}),
    refetchInterval: 15000,
  })

  const toutes    = gaz?.data?.commandes || []
  const toutesAcc = acc?.data?.commandes || []

  const enAttenteGaz     = toutes.filter(c => c.statut === 'en_attente')
  const enLivraisonGaz   = toutes.filter(c => c.statut === 'en_livraison')
  const livreesGaz       = toutes.filter(c => c.statut === 'livree')
  const enAttenteAcc     = toutesAcc.filter(c => c.statut === 'en_attente')
  const enLivraisonAcc   = toutesAcc.filter(c => c.statut === 'en_livraison')
  const livreesAcc       = toutesAcc.filter(c => c.statut === 'livree')

  const totalAttente    = enAttenteGaz.length + enAttenteAcc.length
  const totalEnCours    = enLivraisonGaz.length + enLivraisonAcc.length
  const totalLivrees    = livreesGaz.length + livreesAcc.length

  // Urgentes = en_attente + en_livraison, triées par date
  const urgentes = [
    ...enAttenteGaz.map(c => ({ ...c, type:'gaz' })),
    ...enLivraisonGaz.map(c => ({ ...c, type:'gaz' })),
    ...enAttenteAcc.map(c => ({ ...c, type:'acc' })),
    ...enLivraisonAcc.map(c => ({ ...c, type:'acc' })),
  ].sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)).slice(0, 8)

  const STATS = [
    { label:'En attente',  val:totalAttente,  icon:'clock',     color:'#fbbf24', bg:'rgba(251,191,36,0.1)',  border:'rgba(251,191,36,0.2)' },
    { label:'En livraison', val:totalEnCours,  icon:'truck',    color:'#f97c0a', bg:'rgba(249,124,10,0.1)',  border:'rgba(249,124,10,0.2)' },
    { label:'Livrées',     val:totalLivrees,  icon:'check',     color:'#34d399', bg:'rgba(52,211,153,0.1)',   border:'rgba(52,211,153,0.2)' },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px', paddingTop:'8px' }}>

      {/* Greeting */}
      <div>
        <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'clamp(1.4rem,5vw,1.8rem)', color:'var(--c-text)', letterSpacing:'-0.02em' }}>
          Bonjour, {user?.nom?.split(' ')[0]} 👋
        </h1>
        <p style={{ color:'var(--c-muted)', fontSize:'0.85rem', fontFamily:'var(--font-body)', marginTop:'4px' }}>
          Vos livraisons du jour
        </p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px' }}>
        {STATS.map(s => (
          <div key={s.label} style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:'16px', padding:'16px 10px', textAlign:'center' }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:'6px' }}>
              <Icon name={s.icon} size={26} color={s.color} />
            </div>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.8rem', color:s.color, lineHeight:1 }}>{s.val}</div>
            <div style={{ color:'var(--c-muted)', fontSize:'0.68rem', fontFamily:'var(--font-body)', marginTop:'4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
        <Link to="/livreur/commandes" style={{
          display:'flex', alignItems:'center', gap:'12px', padding:'16px',
          background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'14px',
          textDecoration:'none', transition:'border-color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor='var(--c-brand)'}
          onMouseLeave={e => e.currentTarget.style.borderColor='var(--c-border)'}>
          <div style={{ width:'42px', height:'42px', borderRadius:'10px', background:'rgba(249,124,10,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name="fuel" size={22} color="var(--c-brand)" />
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--c-text)', fontSize:'0.9rem' }}>Gaz</div>
            <div style={{ color:'var(--c-muted)', fontSize:'0.72rem', fontFamily:'var(--font-body)' }}>{enAttenteGaz.length + enLivraisonGaz.length} en cours</div>
          </div>
        </Link>
        <Link to="/livreur/accessoires" style={{
          display:'flex', alignItems:'center', gap:'12px', padding:'16px',
          background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'14px',
          textDecoration:'none', transition:'border-color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor='#60a5fa'}
          onMouseLeave={e => e.currentTarget.style.borderColor='var(--c-border)'}>
          <div style={{ width:'42px', height:'42px', borderRadius:'10px', background:'rgba(96,165,250,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name="wrench" size={22} color="#60a5fa" />
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--c-text)', fontSize:'0.9rem' }}>Accessoires</div>
            <div style={{ color:'var(--c-muted)', fontSize:'0.72rem', fontFamily:'var(--font-body)' }}>{enAttenteAcc.length + enLivraisonAcc.length} en cours</div>
          </div>
        </Link>
      </div>

      {/* Urgent list */}
      {urgentes.length > 0 && (
        <div>
          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--c-text)', fontSize:'1rem', marginBottom:'12px', display:'flex', alignItems:'center', gap:'8px' }}>
            <Icon name="alert" size={18} color="#f87171" /> À traiter en priorité
          </h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {urgentes.map(c => {
              const color = c.type==='gaz' ? (marqueColors[c.marque]||'#f97c0a') : '#60a5fa'
              return (
                <Link
                  key={c._id}
                  to={c.type==='gaz' ? '/livreur/commandes' : '/livreur/accessoires'}
                  style={{
                    display:'flex', alignItems:'center', gap:'14px', padding:'14px 16px',
                    background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'14px',
                    textDecoration:'none', transition:'border-color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor=color}
                  onMouseLeave={e => e.currentTarget.style.borderColor='var(--c-border)'}
                >
                  <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:color, flexShrink:0, boxShadow:`0 0 8px ${color}` }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'2px' }}>
                      <span style={{ fontFamily:'var(--font-mono)', color, fontSize:'0.7rem' }}>{c.numeroCommande}</span>
                      <span style={{ background: c.type==='gaz' ? 'rgba(249,124,10,0.1)' : 'rgba(96,165,250,0.1)', color: c.type==='gaz' ? '#f97c0a' : '#60a5fa', fontSize:'0.6rem', fontFamily:'var(--font-mono)', padding:'1px 6px', borderRadius:'99px', display:'inline-flex', alignItems:'center', gap:'3px' }}>
                        {c.type==='gaz'
                          ? <><Icon name="fuel" size={10} /> GAZ</>
                          : <><Icon name="wrench" size={10} /> ACC</>
                        }
                      </span>
                    </div>
                    <div style={{ fontFamily:'var(--font-display)', fontWeight:600, color:'var(--c-text)', fontSize:'0.88rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.nomClient}</div>
                    <div style={{ color:'var(--c-muted)', fontSize:'0.72rem', fontFamily:'var(--font-body)' }}>
                      {c.type==='gaz' ? `${c.marque} ${c.poids}kg · ` : `${c.items?.length} article(s) · `}
                      {formatDateRelative(c.createdAt)}
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <span className={getBadgeClass(c.statut)} style={{ display:'inline-flex' }}>{statutLabel[c.statut]?.icon}</span>
                    <div style={{ fontFamily:'var(--font-display)', fontWeight:800, color, fontSize:'0.88rem', marginTop:'4px' }}>{formatPrix(c.prixTotal)}</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {urgentes.length === 0 && !gaz && (
        <div style={{ textAlign:'center', padding:'40px', background:'var(--c-surface)', borderRadius:'18px', border:'1px solid var(--c-border)' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'12px' }}>
            <Icon name="check" size={48} color="#34d399" />
          </div>
          <p style={{ color:'var(--c-muted)', fontFamily:'var(--font-body)' }}>Aucune livraison urgente pour le moment</p>
        </div>
      )}
    </div>
  )
}
