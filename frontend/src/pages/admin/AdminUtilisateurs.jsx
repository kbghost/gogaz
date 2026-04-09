import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userAPI } from '../../services/api'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const ROLES = ['', 'client', 'livreur', 'admin']
const ROLE_COLOR = { admin:'#f97c0a', livreur:'#60a5fa', client:'#34d399' }
const ROLE_BG    = { admin:'rgba(249,124,10,0.1)', livreur:'rgba(96,165,250,0.1)', client:'rgba(52,211,153,0.1)' }

const inputSt = { width:'100%', padding:'11px 13px', borderRadius:'11px', border:'1px solid var(--c-border2)', background:'var(--c-surface2)', color:'var(--c-text)', fontFamily:'var(--font-body)', fontSize:'14px', outline:'none' }
const labelSt = { display:'block', color:'var(--c-muted)', fontSize:'0.7rem', fontWeight:600, marginBottom:'5px', fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.05em' }

export default function AdminUtilisateurs() {
  const qc = useQueryClient()
  const [roleFilter, setRoleFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nom:'', telephone:'', email:'', password:'', role:'livreur' })

  const { data, isLoading } = useQuery({
    queryKey: ['users-admin', roleFilter],
    queryFn: () => userAPI.getAll(roleFilter ? { role: roleFilter } : {}),
  })
  const users = data?.data?.users || []

  const toggleMut = useMutation({
    mutationFn: id => userAPI.toggle(id),
    onSuccess: () => { qc.invalidateQueries(['users-admin']); toast.success('Compte mis à jour ✓') },
    onError: e => toast.error(e.message),
  })
  const createMut = useMutation({
    mutationFn: d => userAPI.create(d),
    onSuccess: () => { qc.invalidateQueries(['users-admin']); toast.success('Utilisateur créé ✓'); setShowForm(false); setForm({ nom:'', telephone:'', email:'', password:'', role:'livreur' }) },
    onError: e => toast.error(e.response?.data?.message || 'Erreur'),
  })

  const set = (k,v) => setForm(f => ({ ...f, [k]:v }))

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }} className="animate-fade-in">

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'clamp(1.3rem,4vw,1.8rem)', color:'var(--c-text)', letterSpacing:'-0.02em' }}>Utilisateurs</h1>
          <p style={{ color:'var(--c-muted)', fontSize:'0.82rem', fontFamily:'var(--font-body)', marginTop:'4px' }}>{users.length} compte(s)</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Ajouter</button>
      </div>

      {/* Role filter */}
      <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
        {ROLES.map(r => (
          <button key={r||'all'} onClick={() => setRoleFilter(r)} style={{
            padding:'7px 16px', borderRadius:'99px', border:'1px solid var(--c-border)',
            background: roleFilter===r ? 'var(--c-brand)' : 'var(--c-surface2)',
            color: roleFilter===r ? '#fff' : 'var(--c-muted)',
            fontFamily:'var(--font-display)', fontWeight:600, fontSize:'0.82rem', cursor:'pointer',
          }}>
            {r || 'Tous'}
          </button>
        ))}
      </div>

      {/* Create form modal */}
      {showForm && (
        <div onClick={e => { if(e.target===e.currentTarget) setShowForm(false) }}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div style={{ width:'100%', maxWidth:'440px', background:'var(--c-surface)', borderRadius:'20px', border:'1px solid var(--c-border)', padding:'24px' }} className="animate-scale-in">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--c-text)', fontSize:'1.1rem' }}>Nouvel utilisateur</h3>
              <button onClick={() => setShowForm(false)} style={{ width:'30px', height:'30px', borderRadius:'50%', background:'var(--c-surface2)', border:'1px solid var(--c-border)', cursor:'pointer', color:'var(--c-muted)', fontSize:'0.85rem' }}>✕</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); createMut.mutate(form) }} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              {[
                { k:'nom', label:'Nom *', type:'text', ph:'Jean Dupont' },
                { k:'telephone', label:'Téléphone *', type:'tel', ph:'+229 97 00 00 00' },
                { k:'email', label:'Email', type:'email', ph:'exemple@email.com' },
                { k:'password', label:'Mot de passe *', type:'password', ph:'6 caractères minimum' },
              ].map(f => (
                <div key={f.k}>
                  <span style={labelSt}>{f.label}</span>
                  <input type={f.type} style={inputSt} placeholder={f.ph} value={form[f.k]} onChange={e => set(f.k, e.target.value)} required={f.label.includes('*')} />
                </div>
              ))}
              <div>
                <span style={labelSt}>Rôle *</span>
                <select style={{ ...inputSt, cursor:'pointer' }} value={form.role} onChange={e => set('role', e.target.value)}>
                  <option value="client">Client</option>
                  <option value="livreur">Livreur</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display:'flex', gap:'10px', paddingTop:'4px' }}>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" style={{ flex:1 }}>Annuler</button>
                <button type="submit" className="btn-primary" style={{ flex:2 }} disabled={createMut.isPending}>
                  {createMut.isPending ? '⏳…' : 'Créer le compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users table */}
      {isLoading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {Array(4).fill(0).map((_,i) => <div key={i} className="skeleton" style={{ height:'64px', borderRadius:'12px' }} />)}
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign:'center', padding:'50px', background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'18px' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:'12px' }}>👥</div>
          <p style={{ color:'var(--c-muted)', fontFamily:'var(--font-body)' }}>Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <div style={{ background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'18px', overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:'480px' }}>
              <thead>
                <tr>
                  {['Utilisateur','Rôle','Téléphone','Inscription','Statut',''].map(h => (
                    <th key={h} style={{ padding:'12px 14px', textAlign:'left', color:'var(--c-dim)', fontSize:'0.68rem', fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid var(--c-border)', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}
                    onMouseEnter={e => e.currentTarget.style.background='var(--c-surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background=''}>
                    <td style={{ padding:'12px 14px', borderBottom:'1px solid var(--c-border)' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{ width:'32px', height:'32px', borderRadius:'50%', background: ROLE_BG[u.role]||'var(--c-border)', display:'flex', alignItems:'center', justifyContent:'center', color: ROLE_COLOR[u.role]||'var(--c-muted)', fontFamily:'var(--font-display)', fontWeight:800, fontSize:'0.85rem', flexShrink:0 }}>
                          {u.nom.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontFamily:'var(--font-display)', fontWeight:600, color:'var(--c-text)', fontSize:'0.88rem' }}>{u.nom}</div>
                          {u.email && <div style={{ color:'var(--c-dim)', fontSize:'0.72rem', fontFamily:'var(--font-body)' }}>{u.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:'12px 14px', borderBottom:'1px solid var(--c-border)' }}>
                      <span style={{ padding:'4px 10px', borderRadius:'99px', fontSize:'0.7rem', fontFamily:'var(--font-mono)', fontWeight:700, background: ROLE_BG[u.role]||'var(--c-border)', color: ROLE_COLOR[u.role]||'var(--c-muted)' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding:'12px 14px', borderBottom:'1px solid var(--c-border)', fontFamily:'var(--font-mono)', color:'var(--c-muted)', fontSize:'0.78rem', whiteSpace:'nowrap' }}>{u.telephone}</td>
                    <td style={{ padding:'12px 14px', borderBottom:'1px solid var(--c-border)', color:'var(--c-dim)', fontSize:'0.75rem', fontFamily:'var(--font-body)', whiteSpace:'nowrap' }}>{formatDate(u.createdAt)}</td>
                    <td style={{ padding:'12px 14px', borderBottom:'1px solid var(--c-border)' }}>
                      <span style={{
                        padding:'4px 10px', borderRadius:'99px', fontSize:'0.7rem', fontFamily:'var(--font-mono)', fontWeight:700,
                        background: u.actif ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                        color: u.actif ? '#34d399' : '#f87171',
                      }}>
                        {u.actif ? '● Actif' : '● Désactivé'}
                      </span>
                    </td>
                    <td style={{ padding:'12px 14px', borderBottom:'1px solid var(--c-border)' }}>
                      <button onClick={() => toggleMut.mutate(u._id)} disabled={toggleMut.isPending}
                        style={{
                          padding:'6px 12px', borderRadius:'8px', cursor:'pointer', fontSize:'0.75rem',
                          fontFamily:'var(--font-display)', fontWeight:600,
                          background: u.actif ? 'rgba(248,113,113,0.08)' : 'rgba(52,211,153,0.08)',
                          border: u.actif ? '1px solid rgba(248,113,113,0.2)' : '1px solid rgba(52,211,153,0.2)',
                          color: u.actif ? '#f87171' : '#34d399',
                        }}>
                        {u.actif ? 'Désactiver' : 'Activer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
