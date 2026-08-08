import { useQuery } from '@tanstack/react-query'
import { statsAPI, commandeAPI, commandeAccAPI } from '../../services/api'
import { formatPrix, formatDateRelative, statutLabel, getBadgeClass } from '../../utils/helpers'
import Icon from '../../components/ui/Icons'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

// Custom tooltip pour les graphiques
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'12px', padding:'10px 14px', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}>
      <div style={{ fontFamily:'var(--font-mono)', color:'var(--c-muted)', fontSize:'0.7rem', marginBottom:'6px' }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'2px' }}>
          <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:p.color, flexShrink:0 }} />
          <span style={{ fontFamily:'var(--font-display)', color:'var(--c-text)', fontSize:'0.82rem' }}>{p.name}:</span>
          <span style={{ fontFamily:'var(--font-mono)', fontWeight:700, color:p.color, fontSize:'0.82rem' }}>
            {typeof p.value === 'number' && p.value > 100 ? formatPrix(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['stats-dashboard'],
    queryFn: () => statsAPI.dashboard(),
    refetchInterval: 30000,
  })
  const { data: recentGaz } = useQuery({
    queryKey: ['dashboard-recent-gaz'],
    queryFn: () => commandeAPI.getAll({ limit: 5 }),
    refetchInterval: 30000,
  })
  const { data: recentAcc } = useQuery({
    queryKey: ['dashboard-recent-acc'],
    queryFn: () => commandeAccAPI.getAll({ limit: 5 }),
    refetchInterval: 30000,
  })

  const stats = statsData?.data?.stats
  const chartData = stats?.chartData || []
  const statutsData = stats?.statutsData || []
  const latestGaz = recentGaz?.data?.commandes?.slice(0,5) || []
  const latestAcc = recentAcc?.data?.commandes?.slice(0,5) || []

  const CARDS = [
    { label:'Commandes totales', val: stats?.totalCommandes ?? '—', icon:'package',   color:'#f97c0a', bg:'rgba(249,124,10,0.1)',  border:'rgba(249,124,10,0.2)' },
    { label:'En attente',        val: stats?.enAttente      ?? '—', icon:'clock',      color:'#fbbf24', bg:'rgba(251,191,36,0.1)',  border:'rgba(251,191,36,0.2)' },
    { label:'En livraison',      val: stats?.enLivraison    ?? '—', icon:'truck',      color:'#60a5fa', bg:'rgba(96,165,250,0.1)',  border:'rgba(96,165,250,0.2)' },
    { label:'Livrées',           val: stats?.livrees        ?? '—', icon:'check',      color:'#34d399', bg:'rgba(52,211,153,0.1)',  border:'rgba(52,211,153,0.2)' },
    { label:"CA aujourd'hui",    val: stats?.caJour  != null ? formatPrix(stats.caJour) : '—', icon:'dollar', color:'#a78bfa', bg:'rgba(167,139,250,0.1)', border:'rgba(167,139,250,0.2)' },
    { label:'CA ce mois',        val: stats?.caMois  != null ? formatPrix(stats.caMois) : '—', icon:'bar-chart', color:'#f97c0a', bg:'rgba(249,124,10,0.08)', border:'rgba(249,124,10,0.15)' },
    { label:'Clients',           val: stats?.totalClients   ?? '—', icon:'users',      color:'#34d399', bg:'rgba(52,211,153,0.08)', border:'rgba(52,211,153,0.15)' },
    { label:'Livreurs',          val: stats?.totalLivreurs  ?? '—', icon:'truck',      color:'#fbbf24', bg:'rgba(251,191,36,0.08)', border:'rgba(251,191,36,0.15)' },
  ]

  const axisStyle = { fill:'var(--c-muted)', fontSize:'0.65rem', fontFamily:'var(--font-mono)' }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'24px' }} className="animate-fade-in">

      <div>
        <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'clamp(1.3rem,4vw,1.8rem)', color:'var(--c-text)', letterSpacing:'-0.02em' }}>Dashboard</h1>
        <p style={{ color:'var(--c-muted)', fontSize:'0.85rem', fontFamily:'var(--font-body)', marginTop:'4px' }}>Vue d'ensemble GoGaz</p>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:'12px' }}>
        {CARDS.map((c,i) => (
          <div key={i} style={{ background:c.bg, border:`1px solid ${c.border}`, borderRadius:'16px', padding:'16px' }}>
            {isLoading
              ? <div className="skeleton" style={{ height:'48px', borderRadius:'8px' }} />
              : <>
                  <div style={{ display:'flex', marginBottom:'8px' }}><Icon name={c.icon} size={24} color={c.color} /></div>
                  <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.4rem', color:c.color, lineHeight:1 }}>{c.val}</div>
                  <div style={{ color:'var(--c-muted)', fontSize:'0.72rem', fontFamily:'var(--font-body)', marginTop:'5px' }}>{c.label}</div>
                </>
            }
          </div>
        ))}
      </div>

      {/* ── Area Chart : CA 7 jours ── */}
      <div style={{ background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'18px', padding:'20px 16px' }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--c-text)', fontSize:'0.95rem', marginBottom:'4px', display:'flex', alignItems:'center', gap:'8px' }}><Icon name="bar-chart" size={18} color="var(--c-brand)" /> Chiffre d'affaires — 7 derniers jours</h2>
        <p style={{ color:'var(--c-muted)', fontSize:'0.75rem', fontFamily:'var(--font-body)', marginBottom:'20px' }}>Gaz + Accessoires</p>
        {isLoading || chartData.length === 0 ? (
          <div className="skeleton" style={{ height:'200px', borderRadius:'12px' }} />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top:5, right:10, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="gradGaz" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f97c0a" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97c0a" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gradAcc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" vertical={false} />
              <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => v > 0 ? `${(v/1000).toFixed(0)}k` : '0'} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontFamily:'var(--font-body)', fontSize:'0.75rem', paddingTop:'12px' }} />
              <Area type="monotone" dataKey="gaz" name="Gaz" stroke="#f97c0a" strokeWidth={2} fill="url(#gradGaz)" dot={{ fill:'#f97c0a', r:3 }} activeDot={{ r:5 }} />
              <Area type="monotone" dataKey="acc" name="Accessoires" stroke="#60a5fa" strokeWidth={2} fill="url(#gradAcc)" dot={{ fill:'#60a5fa', r:3 }} activeDot={{ r:5 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Bar Chart commandes + Pie Chart statuts ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'16px' }}>

        {/* Nombre de commandes par jour */}
        <div style={{ background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'18px', padding:'20px 16px' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--c-text)', fontSize:'0.95rem', marginBottom:'4px', display:'inline-flex', alignItems:'center', gap:'8px' }}><Icon name="package" size={18} color="var(--c-brand)" /> Commandes / jour</h2>
          <p style={{ color:'var(--c-muted)', fontSize:'0.75rem', fontFamily:'var(--font-body)', marginBottom:'20px' }}>7 derniers jours</p>
          {isLoading || chartData.length === 0 ? (
            <div className="skeleton" style={{ height:'180px', borderRadius:'12px' }} />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top:0, right:10, left:-20, bottom:0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" vertical={false} />
                <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontFamily:'var(--font-body)', fontSize:'0.75rem', paddingTop:'8px' }} />
                <Bar dataKey="cmdGaz" name="Gaz" fill="#f97c0a" radius={[4,4,0,0]} maxBarSize={28} />
                <Bar dataKey="cmdAcc" name="Accessoires" fill="#60a5fa" radius={[4,4,0,0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Répartition statuts */}
        <div style={{ background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'18px', padding:'20px 16px' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--c-text)', fontSize:'0.95rem', marginBottom:'4px', display:'flex', alignItems:'center', gap:'8px' }}><Icon name="chart" size={18} color="var(--c-brand)" /> Répartition des statuts</h2>
          <p style={{ color:'var(--c-muted)', fontSize:'0.75rem', fontFamily:'var(--font-body)', marginBottom:'12px' }}>Commandes gaz en cours</p>
          {isLoading || statutsData.length === 0 ? (
            <div className="skeleton" style={{ height:'180px', borderRadius:'12px' }} />
          ) : (
            <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={statutsData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {statutsData.map((s, i) => <Cell key={i} fill={s.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'10px', fontFamily:'var(--font-body)', fontSize:'0.8rem' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'6px' }}>
                {statutsData.map((s,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:s.color, flexShrink:0 }} />
                    <span style={{ color:'var(--c-muted)', fontSize:'0.75rem', fontFamily:'var(--font-body)', flex:1 }}>{s.name}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontWeight:700, color:s.color, fontSize:'0.8rem' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent orders ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'16px' }}>
        {[
          { title:'Dernières commandes gaz',        titleIcon:'fuel',   list: latestGaz, type:'gaz' },
          { title:'Dernières commandes accessoires', titleIcon:'wrench',  list: latestAcc, type:'acc' },
        ].map(({ title, titleIcon, list, type }) => (
          <div key={type} style={{ background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'18px', overflow:'hidden' }}>
            <div style={{ padding:'16px 18px', borderBottom:'1px solid var(--c-border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--c-text)', fontSize:'0.92rem', display:'flex', alignItems:'center', gap:'8px' }}><Icon name={titleIcon} size={16} color="var(--c-brand)" /> {title}</h2>
              <a href="/admin/commandes" style={{ color:'var(--c-brand)', fontSize:'0.75rem', fontFamily:'var(--font-display)', fontWeight:600, textDecoration:'none' }}>Voir tout →</a>
            </div>
            {list.length === 0
              ? <div style={{ padding:'28px', textAlign:'center', color:'var(--c-muted)', fontSize:'0.85rem' }}>Aucune commande</div>
              : list.map(c => (
                <div key={c._id} style={{ padding:'11px 18px', borderBottom:'1px solid var(--c-border)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px' }}>
                  <div style={{ minWidth:0, flex:1 }}>
                    <div style={{ fontFamily:'var(--font-mono)', color: type==='gaz' ? 'var(--c-brand)' : '#60a5fa', fontSize:'0.66rem' }}>{c.numeroCommande}</div>
                    <div style={{ fontFamily:'var(--font-display)', fontWeight:600, color:'var(--c-text)', fontSize:'0.84rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.nomClient}</div>
                    <div style={{ color:'var(--c-muted)', fontSize:'0.72rem', fontFamily:'var(--font-body)' }}>
                      {type==='gaz' ? `${c.marque} ${c.poids}kg` : `${c.items?.length} article(s)`} · {formatDateRelative(c.createdAt)}
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <span className={getBadgeClass(c.statut)} style={{ display:'inline-flex', fontSize:'0.62rem' }}>{statutLabel[c.statut]?.icon}</span>
                    <div style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--c-brand)', fontSize:'0.82rem', marginTop:'3px' }}>{formatPrix(c.prixTotal)}</div>
                  </div>
                </div>
              ))
            }
          </div>
        ))}
      </div>
    </div>
  )
}
