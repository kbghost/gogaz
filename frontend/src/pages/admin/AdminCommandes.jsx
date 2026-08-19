import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commandeAPI, commandeAccAPI, userAPI } from '../../services/api'
import { formatPrix, formatDateRelative, getBadgeClass, statutLabel } from '../../utils/helpers'
import Icon from '../../components/ui/Icons'
import toast from 'react-hot-toast'

const STATUTS = ['', 'en_attente', 'validee', 'en_livraison', 'livree', 'annulee']

const S = {
  wrap: { display:'flex', flexDirection:'column', gap:'16px' },
  tabs: { display:'flex', gap:'6px', overflowX:'auto', paddingBottom:'4px', flexWrap:'nowrap' },
  tab: (active) => ({
    flexShrink:0, padding:'8px 14px', borderRadius:'99px', border:'1px solid var(--c-border)',
    background: active ? 'var(--c-brand)' : 'var(--c-surface2)',
    color: active ? '#fff' : 'var(--c-muted)',
    fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.8rem', cursor:'pointer',
    boxShadow: active ? '0 0 14px rgba(249,124,10,0.3)' : 'none', whiteSpace:'nowrap',
  }),
  card: { background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'16px', overflow:'hidden' },
  tHead: { color:'var(--c-dim)', fontSize:'0.68rem', fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.06em', padding:'10px 14px', textAlign:'left', whiteSpace:'nowrap', borderBottom:'1px solid var(--c-border)' },
  tCell: { padding:'12px 14px', borderBottom:'1px solid var(--c-border)', verticalAlign:'middle' },
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)', zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' },
  modal: { width:'100%', maxWidth:'480px', background:'var(--c-surface)', borderRadius:'24px 24px 0 0', borderTop:'1px solid var(--c-border)', padding:'24px', maxHeight:'90dvh', overflowY:'auto' },
}

function ActionBtn({ onClick, disabled, color, label }) {
  const bg = { green:'rgba(52,211,153,0.08)', orange:'rgba(249,124,10,0.08)', red:'rgba(248,113,113,0.08)' }
  const border = { green:'rgba(52,211,153,0.25)', orange:'rgba(249,124,10,0.25)', red:'rgba(248,113,113,0.25)' }
  const text = { green:'#34d399', orange:'#f97c0a', red:'#f87171' }
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:'100%', padding:'13px', borderRadius:'14px', border:`1px solid ${border[color]}`,
      background:bg[color], color:text[color], fontFamily:'var(--font-display)', fontWeight:700,
      fontSize:'0.88rem', cursor:'pointer', marginBottom:'8px', transition:'opacity 0.15s',
      opacity: disabled ? 0.5 : 1,
    }}>{label}</button>
  )
}

export default function AdminCommandes() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('gaz')
  const [statut, setStatut] = useState('')
  const [sel, setSel] = useState(null)

  const { data: gazData, isLoading: loadingGaz } = useQuery({
    queryKey: ['cmd-admin-gaz', statut],
    queryFn: () => commandeAPI.getAll(statut ? { statut } : {}),
    refetchInterval: 15000,
  })

  const { data: accData, isLoading: loadingAcc } = useQuery({
    queryKey: ['cmd-admin-acc', statut],
    queryFn: () => commandeAccAPI.getAll(statut ? { statut } : {}),
    refetchInterval: 15000,
  })

  const { data: livreursData } = useQuery({
    queryKey: ['livreurs'],
    queryFn: () => userAPI.getAll({ role: 'livreur' }),
  })

  const gazCommandes = gazData?.data?.commandes || []
  const accCommandes = accData?.data?.commandes || []
  const livreurs = livreursData?.data?.users || []
  const isLoading = tab === 'gaz' ? loadingGaz : loadingAcc
  const commandes = tab === 'gaz' ? gazCommandes : accCommandes

  const updateGazMut = useMutation({
    mutationFn: ({ id, data }) => commandeAPI.updateStatut(id, data),
    onSuccess: () => { qc.invalidateQueries(['cmd-admin-gaz']); toast.success('Mis à jour ✓'); setSel(null) },
    onError: e => toast.error(e.response?.data?.message || 'Erreur'),
  })

  const updateAccMut = useMutation({
    mutationFn: ({ id, data }) => commandeAccAPI.updateStatut(id, data),
    onSuccess: () => { qc.invalidateQueries(['cmd-admin-acc']); toast.success('Mis à jour ✓'); setSel(null) },
    onError: e => toast.error(e.response?.data?.message || 'Erreur'),
  })

  const handleStatut = (newStatut, livreurId) => {
    if (!sel) return
    const payload = { statut: newStatut, ...(livreurId && { livreurId }) }
    if (tab === 'gaz') updateGazMut.mutate({ id: sel._id, data: payload })
    else updateAccMut.mutate({ id: sel._id, data: payload })
  }

  const isPending = updateGazMut.isPending || updateAccMut.isPending

  return (
    <div style={S.wrap} className="animate-fade-in">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'10px' }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'clamp(1.3rem,4vw,1.8rem)', color:'var(--c-text)', letterSpacing:'-0.02em' }}>
          Commandes
        </h1>
        <div style={{ display:'flex', gap:'8px' }}>
          {['gaz','acc'].map(t => (
            <button key={t} onClick={() => { setTab(t); setSel(null) }} style={{
              padding:'8px 18px', borderRadius:'10px', border:'1px solid var(--c-border)',
              background: tab===t ? 'var(--c-brand)' : 'var(--c-surface2)',
              color: tab===t ? '#fff' : 'var(--c-muted)',
              fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.82rem', cursor:'pointer',
            }}>
              {t==='gaz' ? '⛽ Gaz' : '🔧 Accessoires'}
            </button>
          ))}
        </div>
      </div>

      <div style={S.tabs}>
        {STATUTS.map(s => (
          <button key={s||'all'} onClick={() => setStatut(s)} style={S.tab(statut===s)}>
            {s ? <><Icon name={statutLabel[s]?.icon} size={14} /> {statutLabel[s]?.label}</> : 'Toutes'}
          </button>
        ))}
      </div>

      <div style={{ color:'var(--c-muted)', fontSize:'0.78rem', fontFamily:'var(--font-mono)' }}>
        {commandes.length} résultat(s)
      </div>

      {isLoading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {Array(3).fill(0).map((_,i) => <div key={i} className="skeleton" style={{ height:'80px', borderRadius:'14px' }} />)}
        </div>
      ) : (
        <div style={S.card}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:'560px' }}>
              <thead>
                <tr>
                  {['N°','Client','Détail','Total','Statut','Date',''].map(h => (
                    <th key={h} style={S.tHead}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {commandes.map(c => (
                  <tr key={c._id} onClick={() => setSel(c)}
                    style={{ cursor:'pointer', transition:'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--c-surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background=''}>
                    <td style={S.tCell}><span style={{ fontFamily:'var(--font-mono)', color:'var(--c-brand)', fontSize:'0.72rem' }}>{c.numeroCommande}</span></td>
                    <td style={S.tCell}>
                      <div style={{ fontFamily:'var(--font-display)', fontWeight:600, color:'var(--c-text)', fontSize:'0.88rem' }}>{c.nomClient}</div>
                      <div style={{ fontFamily:'var(--font-mono)', color:'var(--c-muted)', fontSize:'0.72rem' }}>{c.telephoneClient}</div>
                    </td>
                    <td style={S.tCell}>
                      {tab==='gaz' ? `${c.marque} ${c.poids}kg ×${c.quantite}` : (
                        <div style={{ display:'flex', flexDirection:'column', gap:'3px' }}>
                          {c.items?.slice(0, 2).map(item => (
                            <span key={`${item.nom}-${item.quantite}`} style={{ color:'var(--c-text)', fontSize:'0.78rem' }}>
                              {item.nom} ×{item.quantite}
                            </span>
                          ))}
                          {(c.items?.length || 0) > 2 && <span style={{ color:'var(--c-muted)', fontSize:'0.7rem' }}>+{c.items.length - 2} autre(s)</span>}
                        </div>
                      )}
                    </td>
                    <td style={S.tCell}><span style={{ fontFamily:'var(--font-display)', fontWeight:800, color:'var(--c-brand)', fontSize:'0.9rem' }}>{formatPrix(c.prixTotal)}</span></td>
                    <td style={S.tCell}><span className={getBadgeClass(c.statut)}>{statutLabel[c.statut]?.label}</span></td>
                    <td style={S.tCell}><span style={{ color:'var(--c-dim)', fontSize:'0.75rem' }}>{formatDateRelative(c.createdAt)}</span></td>
                    <td style={S.tCell}><span style={{ color:'var(--c-brand)', fontWeight:700, display:'inline-flex', alignItems:'center', gap:'6px' }}>Gérer <Icon name="arrow-right" size={14} /></span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sel && (
        <div style={S.overlay} onClick={e => { if (e.target===e.currentTarget) setSel(null) }}>
          <div style={S.modal}>
            <div style={{ width:'36px', height:'4px', borderRadius:'4px', background:'var(--c-border2)', margin:'0 auto 18px' }} />
            
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'16px' }}>
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:800 }}>Détails Commande</h3>
              <button onClick={() => setSel(null)} style={{ border:'none', background:'none', cursor:'pointer' }}><Icon name="x" size={18} /></button>
            </div>

            <div style={{ background:'var(--c-surface2)', borderRadius:'16px', padding:'16px', marginBottom:'12px', fontSize:'0.85rem' }}>
               <p><strong>Client:</strong> {sel.nomClient}</p>
               <p><strong>Tel:</strong> {sel.telephoneClient}</p>
               <p><strong>Total:</strong> {formatPrix(sel.prixTotal)}</p>
               {sel.adresseLivraison && <p><strong>Adresse:</strong> {sel.adresseLivraison}</p>}
            </div>

            {tab === 'acc' && (
              <div style={{ background:'var(--c-surface2)', borderRadius:'16px', padding:'16px', marginBottom:'12px' }}>
                <div style={{ color:'var(--c-muted)', fontFamily:'var(--font-mono)', fontSize:'0.68rem', textTransform:'uppercase', marginBottom:'10px' }}>
                  Articles commandés
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'9px' }}>
                  {(sel.items || []).map(item => (
                    <div key={`${item.nom}-${item.quantite}`} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', fontSize:'0.82rem' }}>
                      <div style={{ minWidth:0 }}>
                        <div style={{ color:'var(--c-text)', fontWeight:700 }}>{item.nom}</div>
                        <div style={{ color:'var(--c-muted)', fontSize:'0.72rem' }}>{formatPrix(item.prix)} × {item.quantite}</div>
                      </div>
                      <span style={{ color:'var(--c-brand)', fontWeight:800, whiteSpace:'nowrap' }}>
                        {formatPrix(item.prix * item.quantite)}
                      </span>
                    </div>
                  ))}
                </div>
                {sel.description && (
                  <div style={{ borderTop:'1px solid var(--c-border)', marginTop:'12px', paddingTop:'10px', color:'var(--c-muted)', fontSize:'0.78rem' }}>
                    <strong style={{ color:'var(--c-text)' }}>Note:</strong> {sel.description}
                  </div>
                )}
              </div>
            )}

            {/* SECTION ITINÉRAIRE GPS */}
            {sel.localisation?.lat && (
              <div style={{ background:'rgba(96,165,250,0.1)', border:'1px solid rgba(96,165,250,0.2)', borderRadius:'14px', padding:'14px', marginBottom:'12px' }}>
                <div style={{ color:'#60a5fa', fontSize:'0.7rem', fontWeight:700, marginBottom:'8px' }}>📍 LOCALISATION CLIENT</div>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${sel.localisation.lat},${sel.localisation.lng}`}
                  target="_blank" 
                  rel="noreferrer"
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', padding:'12px', borderRadius:'10px', background:'#60a5fa', color:'#fff', textDecoration:'none', fontWeight:700 }}
                >
                  🚗 Lancer l'itinéraire (Maps)
                </a>
              </div>
            )}

            {/* ACTIONS */}
            <div style={{ marginTop:'12px' }}>
              {sel.statut === 'en_attente' && (
                <ActionBtn onClick={() => handleStatut('validee')} disabled={isPending} color="green" label="✅ Valider la commande" />
              )}
              {sel.statut === 'validee' && (
                <>
                  <select id="lv-sel" style={{ width:'100%', padding:'12px', borderRadius:'12px', marginBottom:'8px' }}>
                    <option value="">Assigner un livreur...</option>
                    {livreurs.map(l => <option key={l._id} value={l._id}>{l.nom}</option>)}
                  </select>
                  <ActionBtn onClick={() => handleStatut('en_livraison', document.getElementById('lv-sel').value)} disabled={isPending} color="orange" label="🚚 Envoyer en livraison" />
                </>
              )}
              {sel.statut === 'en_livraison' && (
                <ActionBtn onClick={() => handleStatut('livree')} disabled={isPending} color="green" label="🎉 Marquer comme livrée" />
              )}
              {!['livree','annulee'].includes(sel.statut) && (
                <ActionBtn onClick={() => handleStatut('annulee')} disabled={isPending} color="red" label="❌ Annuler" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
