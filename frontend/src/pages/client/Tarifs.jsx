import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/ui/Navbar'
import { produitAPI } from '../../services/api'
import ProductImage from '../../components/ui/ProductImage'
import Icon from '../../components/ui/Icons'
import { formatPrix, marqueColors, MARQUES } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'

const POIDS_INFO = {
  6:    { label:'Petite',   icon: { name: 'circle', color: '#f1c40f' }, usage:'Studio, célibataire' },
  12.5: { label:'Standard', icon: { name: 'circle', color: '#f97316' }, usage:'Famille 2-4 personnes' },
  25:   { label:'Grande',   icon: { name: 'circle', color: '#ef4444' }, usage:'Grande famille, resto' },
}

const BADGES = [
  { icon: 'dollar', text: 'Cash à la livraison' },
  { icon: 'truck', text: 'Livraison < 30 min' },
  { icon: 'check', text: 'Prix fixes garantis' },
]

export default function Tarifs() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['produits-public'],
    queryFn: () => produitAPI.getAll({ disponible: true }),
  })
  const produits = data?.data?.produits || []
  const grouped = produits.reduce((acc, p) => {
    if (!acc[p.marque]) acc[p.marque] = []
    acc[p.marque].push(p)
    return acc
  }, {})

  const handleCommander = () => {
    if (!user) navigate('/login')
    else navigate('/commander')
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--c-bg)' }}>
      <Navbar />
      <div style={{ maxWidth:'1040px', margin:'0 auto', padding:'clamp(90px,14vw,120px) 20px 80px' }}>

        {/* Hero header */}
        <div className="animate-fade-in" style={{ marginBottom:'52px' }}>
          <div className="pill" style={{ marginBottom:'14px', display:'inline-flex' }}>Nos tarifs</div>
          <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'clamp(2rem,6vw,3.2rem)', color:'var(--c-text)', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:'14px' }}>
            Des prix clairs,<br/>
            <span style={{ background:'linear-gradient(135deg,#f97c0a,#ff4500)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>zéro surprise</span>
          </h1>
          <p style={{ color:'var(--c-muted)', fontFamily:'var(--font-body)', fontSize:'1rem', maxWidth:'480px', lineHeight:1.7 }}>
            Paiement uniquement à la livraison. Le prix affiché est le prix final.
          </p>
          {/* Badges de confiance */}
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', marginTop:'20px' }}>
            {BADGES.map(b => (
              <span key={b.text} style={{ padding:'6px 14px', borderRadius:'99px', background:'var(--c-surface2)', border:'1px solid var(--c-border)', color:'var(--c-muted)', fontFamily:'var(--font-body)', fontSize:'0.8rem', display:'inline-flex', alignItems:'center', gap:8 }}>
                <Icon name={b.icon} size={16} color='var(--c-muted)' />
                <span>{b.text}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Format legend */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'36px' }}>
          {Object.entries(POIDS_INFO).map(([poids, info]) => (
            <div key={poids} style={{ background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'14px', padding:'14px 16px', display:'flex', alignItems:'center', gap:'12px' }}>
              <span style={{ fontSize:'1.5rem' }}><Icon name={info.icon.name} size={20} color={info.icon.color} /></span>
              <div>
                <div style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--c-text)', fontSize:'0.88rem' }}>{poids}kg — {info.label}</div>
                <div style={{ color:'var(--c-muted)', fontSize:'0.72rem', fontFamily:'var(--font-body)' }}>{info.usage}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Products */}
        {isLoading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {Array(4).fill(0).map((_,i) => <div key={i} className="skeleton" style={{ height:'160px', borderRadius:'20px' }} />)}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {Object.entries(grouped).map(([marque, items], mi) => {
              const color = marqueColors[marque] || '#f97c0a'
              const sorted = items.sort((a,b) => a.poids - b.poids)
              return (
                <div key={marque} className="animate-slide-up" style={{ animationDelay:`${mi*0.07}s`, background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'20px', overflow:'hidden', position:'relative' }}>
                  {/* Left color bar */}
                  <div style={{ position:'absolute', top:0, left:0, bottom:0, width:'4px', background:color }} />

                  <div style={{ paddingLeft:'20px' }}>
                    {/* Brand header */}
                    <div style={{ padding:'18px 20px 18px 0', borderBottom:'1px solid var(--c-border)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                        <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:`${color}18`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <ProductImage imageUrl={sorted[0]?.imageUrl} couleur={color} poids={12.5} marque={marque} size={32} objectFit="contain" />
                        </div>
                        <div>
                          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, color:'var(--c-text)', fontSize:'1.05rem', letterSpacing:'-0.01em' }}>{marque}</h2>
                          <div style={{ color:'var(--c-muted)', fontSize:'0.72rem', fontFamily:'var(--font-mono)', marginTop:'2px' }}>{items.length} format(s) · Disponible maintenant</div>
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                        <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#34d399' }} />
                        <span style={{ color:'#34d399', fontSize:'0.72rem', fontFamily:'var(--font-mono)' }}>En stock</span>
                      </div>
                    </div>

                    {/* Price grid */}
                    <div style={{ display:'grid', gridTemplateColumns:`repeat(${sorted.length}, 1fr)` }}>
                      {sorted.map((p, i) => {
                        const info = POIDS_INFO[p.poids] || {}
                        const isMiddle = sorted.length === 3 && i === 1
                        return (
                          <div key={p._id} style={{
                            padding:'20px 20px 20px 0',
                            borderRight: i < sorted.length-1 ? '1px solid var(--c-border)' : 'none',
                            display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'10px',
                            position:'relative',
                            background: isMiddle ? `${color}05` : 'transparent',
                          }}>
                            {isMiddle && (
                              <div style={{ position:'absolute', top:'10px', right:'10px', padding:'2px 8px', borderRadius:'99px', background:`${color}20`, color, fontFamily:'var(--font-mono)', fontSize:'0.72rem' }}>Populaire</div>
                            )}
                            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                              <span style={{ fontSize:'1rem' }}><Icon name={info.icon?.name || 'circle'} size={18} color={info.icon?.color || 'var(--c-muted)'} /></span>
                              <div>
                                <div style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--c-text)', fontSize:'0.95rem' }}>{p.poids} kg</div>
                                <div style={{ color:'var(--c-muted)', fontSize:'0.7rem', fontFamily:'var(--font-body)' }}>{info.label}</div>
                              </div>
                            </div>
                            <div style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'clamp(1.3rem,3vw,1.8rem)', color, letterSpacing:'-0.02em', lineHeight:1 }}>
                              {formatPrix(p.prix)}
                            </div>
                            <div style={{ color:'var(--c-dim)', fontSize:'0.7rem', fontFamily:'var(--font-body)' }}>
                              Stock : {p.stock} bouteille{p.stock>1?'s':''}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* CTA bottom */}
        <div style={{ marginTop:'48px', borderRadius:'24px', overflow:'hidden', position:'relative', background:'linear-gradient(135deg, var(--c-surface) 0%, var(--c-surface2) 100%)', border:'1px solid var(--c-border)', padding:'20px' }}>
          <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'200px', height:'200px', borderRadius:'50%', background:'radial-gradient(circle, rgba(249,124,10,0.12), transparent 70%)' }} />
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:'24px' }}>
            <div>
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:800, color:'var(--c-text)', fontSize:'clamp(1.2rem,4vw,1.6rem)', letterSpacing:'-0.02em', marginBottom:'8px' }}>
                Prêt à commander ? <Icon name="truck" size={18} />
              </h3>
              <p style={{ color:'var(--c-muted)', fontFamily:'var(--font-body)', fontSize:'0.9rem', lineHeight:1.6 }}>
                Livraison express en moins de 30 min · Paiement cash à la réception
              </p>
            </div>
            <button onClick={handleCommander} className="btn-primary glow" style={{ fontSize:'1rem', padding:'15px 32px', flexShrink:0 }}>
              Commander maintenant →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
