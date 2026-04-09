import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { accessoireAPI, getImageUrl } from '../../services/api'
import { formatPrix } from '../../utils/helpers'
import toast from 'react-hot-toast'

const CATEGORIES = ['Détendeur', 'Tuyau', 'Briquet', 'Gazinière', 'Sécurité', 'Autre']
const CAT_ICONS = { 'Détendeur':'🔧', 'Tuyau':'🟫', 'Briquet':'🔥', 'Gazinière':'🍳', 'Sécurité':'🛡️', 'Autre':'📦' }
const EMPTY_FORM = { nom: '', description: '', categorie: 'Détendeur', prix: '', stock: 0, disponible: true, reference: '' }

const inputStyle = {
  padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--c-border2)',
  background: 'var(--c-surface2)', color: 'var(--c-text)', fontFamily: 'var(--font-body)',
  fontSize: '14px', outline: 'none', width: '100%',
}
const labelStyle = {
  display: 'block', color: 'var(--c-muted)', fontSize: '0.72rem', fontWeight: 600,
  marginBottom: '6px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em',
}

function AccForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(initial ? {
    nom: initial.nom, description: initial.description || '', categorie: initial.categorie,
    prix: initial.prix, stock: initial.stock, disponible: initial.disponible,
    reference: initial.reference || '',
  } : EMPTY_FORM)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(initial?.imageUrl ? getImageUrl(initial.imageUrl) : null)
  const fileRef = useRef()

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nom || !form.prix) { toast.error('Nom et prix requis.'); return }
    const fd = new FormData()
    if (file) fd.append('image', file)
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
    onSubmit(fd)
  }

  const F = (key, label, rest = {}) => (
    <div>
      <span style={labelStyle}>{label}</span>
      <input style={inputStyle} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} {...rest} />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Image */}
      <div>
        <span style={labelStyle}>Photo du produit</span>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div
            onClick={() => fileRef.current.click()}
            style={{
              width: '100px', height: '100px', borderRadius: '12px',
              border: '2px dashed var(--c-border2)', background: 'var(--c-surface2)',
              cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {preview ? (
              <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '2rem' }}>{CAT_ICONS[form.categorie] || '📦'}</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <button type="button" onClick={() => fileRef.current.click()} className="btn-secondary" style={{ marginBottom: '8px', fontSize: '0.82rem', padding: '8px 14px' }}>
              📤 Choisir un fichier
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
            <p style={{ color: 'var(--c-dim)', fontSize: '0.75rem', fontFamily: 'var(--font-body)' }}>JPG, PNG, WebP — max 5 Mo</p>
            <p style={{ color: 'var(--c-dim)', fontSize: '0.72rem', marginTop: '4px', fontFamily: 'var(--font-body)' }}>Ou URL externe :</p>
            <input style={{ ...inputStyle, padding: '6px 10px', fontSize: '0.75rem', marginTop: '4px' }}
              placeholder="https://..." type="url"
              onChange={e => { if (e.target.value) setPreview(e.target.value) }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
        {F('nom', 'Nom *', { placeholder: 'Ex: Détendeur universel', required: true })}
        <div>
          <span style={labelStyle}>Catégorie *</span>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))}>
            {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <span style={labelStyle}>Description</span>
        <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '72px' }}
          placeholder="Description du produit..."
          value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', alignItems: 'end' }}>
        {F('prix', 'Prix (FCFA) *', { type: 'number', min: 0, placeholder: '2500' })}
        {F('stock', 'Stock', { type: 'number', min: 0, placeholder: '100' })}
        {F('reference', 'Référence', { placeholder: 'DET-001' })}
        <div>
          <span style={labelStyle}>Disponible</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', paddingTop: '12px' }}>
            <div style={{ width: '44px', height: '24px', borderRadius: '12px', background: form.disponible ? 'var(--c-brand)' : 'var(--c-border2)', position: 'relative', transition: 'background 0.2s', cursor: 'pointer' }}
              onClick={() => setForm(f => ({ ...f, disponible: !f.disponible }))}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: form.disponible ? '22px' : '2px', transition: 'left 0.2s' }} />
            </div>
            <span style={{ color: 'var(--c-muted)', fontSize: '0.82rem' }}>{form.disponible ? 'Oui' : 'Non'}</span>
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
        <button type="button" onClick={onCancel} className="btn-secondary" style={{ flex: 1 }}>Annuler</button>
        <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={loading}>
          {loading ? '⏳...' : (initial ? 'Mettre à jour' : 'Créer l\'accessoire')}
        </button>
      </div>
    </form>
  )
}

export default function AdminAccessoires() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editAcc, setEditAcc] = useState(null)
  const [catFilter, setCatFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['accessoires-admin', catFilter],
    queryFn: () => accessoireAPI.getAll({ categorie: catFilter || undefined }),
  })
  const accessoires = data?.data?.accessoires || []

  const onSuccess = (msg) => {
    qc.invalidateQueries(['accessoires-admin'])
    qc.invalidateQueries(['accessoires'])
    toast.success(msg)
    setShowForm(false)
    setEditAcc(null)
  }

  const createMut = useMutation({ mutationFn: accessoireAPI.create, onSuccess: () => onSuccess('Accessoire créé ✓'), onError: e => toast.error(e.response?.data?.message || 'Erreur') })
  const updateMut = useMutation({ mutationFn: ({ id, fd }) => accessoireAPI.update(id, fd), onSuccess: () => onSuccess('Accessoire mis à jour ✓'), onError: e => toast.error(e.response?.data?.message || 'Erreur') })
  const deleteMut = useMutation({
    mutationFn: accessoireAPI.delete,
    onSuccess: () => { qc.invalidateQueries(['accessoires-admin']); toast.success('Accessoire supprimé') },
    onError: e => toast.error(e.message),
  })

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header">
        <div>
          <h1 className="section-title">Accessoires</h1>
          <p style={{ color: 'var(--c-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            {accessoires.length} article(s) — gestion complète de la boutique
          </p>
        </div>
        <button className="btn-primary" onClick={() => { setEditAcc(null); setShowForm(true) }}>+ Ajouter</button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '18px', padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-text)', marginBottom: '20px' }}>
            {editAcc ? '✏️ Modifier l\'accessoire' : '➕ Nouvel accessoire'}
          </h3>
          <AccForm
            initial={editAcc}
            onSubmit={editAcc ? (fd) => updateMut.mutate({ id: editAcc._id, fd }) : (fd) => createMut.mutate(fd)}
            onCancel={() => { setShowForm(false); setEditAcc(null) }}
            loading={createMut.isPending || updateMut.isPending}
          />
        </div>
      )}

      {/* Category filters */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['', ...CATEGORIES].map(cat => (
          <button key={cat || 'all'} onClick={() => setCatFilter(cat)}
            style={{
              padding: '7px 16px', borderRadius: '99px', border: '1px solid var(--c-border)',
              background: catFilter === cat ? 'var(--c-brand)' : 'var(--c-surface2)',
              color: catFilter === cat ? '#fff' : 'var(--c-muted)',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
            }}>
            {cat ? `${CAT_ICONS[cat]} ${cat}` : 'Tous'}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: '72px', borderRadius: '12px' }} />)}
        </div>
      ) : accessoires.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'var(--c-surface)', borderRadius: '18px', border: '1px solid var(--c-border)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔧</div>
          <p style={{ color: 'var(--c-muted)' }}>Aucun accessoire. Cliquez sur "Ajouter" pour commencer.</p>
        </div>
      ) : (
        <div style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '18px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--c-border)' }}>
                  {['Produit', 'Catégorie', 'Prix', 'Stock', 'Statut', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--c-muted)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accessoires.map(acc => {
                  const imgUrl = getImageUrl(acc.imageUrl)
                  return (
                    <tr key={acc._id} style={{ borderBottom: '1px solid var(--c-border)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--c-surface2)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--c-surface2)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                            {imgUrl ? <img src={imgUrl} alt={acc.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display='none' }} /> : CAT_ICONS[acc.categorie] || '📦'}
                          </div>
                          <div>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--c-text)', fontSize: '0.88rem' }}>{acc.nom}</div>
                            {acc.reference && <div style={{ color: 'var(--c-dim)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>{acc.reference}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--c-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                        {CAT_ICONS[acc.categorie]} {acc.categorie}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-brand)', whiteSpace: 'nowrap' }}>
                        {formatPrix(acc.prix)}
                      </td>
                      <td style={{ padding: '12px 16px', color: acc.stock < 5 ? '#f87171' : 'var(--c-muted)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
                        {acc.stock}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '99px', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 700,
                          background: acc.disponible ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                          color: acc.disponible ? '#34d399' : '#f87171',
                          border: `1px solid ${acc.disponible ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
                        }}>
                          {acc.disponible ? '● Dispo' : '● Indispo'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => { setEditAcc(acc); setShowForm(true); window.scrollTo(0, 0) }}
                            style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--c-surface2)', border: '1px solid var(--c-border)', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            ✏️
                          </button>
                          <button onClick={() => { if (window.confirm(`Supprimer "${acc.nom}" ?`)) deleteMut.mutate(acc._id) }}
                            disabled={deleteMut.isPending}
                            style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
