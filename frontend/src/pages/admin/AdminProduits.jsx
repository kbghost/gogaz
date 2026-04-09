import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { produitAPI, getImageUrl } from '../../services/api'
import { formatPrix, marqueColors } from '../../utils/helpers'
import GasBottle from '../../components/ui/GasBottle'
import ProductImage from '../../components/ui/ProductImage'
import toast from 'react-hot-toast'

const POIDS = [6, 12.5, 25]
const MARQUES_DEFAULT = ['Oryx', 'Bénin Petro', 'PUMA GAZ', 'PRO GAZ']
const EMPTY_FORM = { marque: '', poids: 6, prix: '', stock: 0, disponible: true, description: '', couleur: '#f97c0a' }

const inputStyle = {
  padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--c-border2)',
  background: 'var(--c-surface2)', color: 'var(--c-text)', fontFamily: 'var(--font-body)',
  fontSize: '14px', outline: 'none', width: '100%',
}
const labelStyle = {
  display: 'block', color: 'var(--c-muted)', fontSize: '0.72rem', fontWeight: 600,
  marginBottom: '6px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em',
}

export default function AdminProduits() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editProduit, setEditProduit] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [file, setFile] = useState(null)
  const [imgPreview, setImgPreview] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const fileRef = useRef()

  const { data, isLoading } = useQuery({
    queryKey: ['produits-admin'],
    queryFn: () => produitAPI.getAll(),
  })
  const produits = data?.data?.produits || []

  const createMut = useMutation({
    mutationFn: (fd) => produitAPI.create(fd),
    onSuccess: () => { qc.invalidateQueries(['produits-admin']); toast.success('Produit créé ✓'); resetForm() },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, fd }) => produitAPI.update(id, fd),
    onSuccess: () => { qc.invalidateQueries(['produits-admin']); toast.success('Mis à jour ✓'); resetForm() },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })
  const deleteMut = useMutation({
    mutationFn: (id) => produitAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries(['produits-admin']); toast.success('Supprimé') },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur'),
  })

  const resetForm = () => {
    setForm(EMPTY_FORM); setEditProduit(null); setShowForm(false)
    setFile(null); setImgPreview(null); setImageUrl('')
  }

  const handleEdit = (p) => {
    setForm({ marque: p.marque, poids: p.poids, prix: p.prix, stock: p.stock, disponible: p.disponible, description: p.description || '', couleur: p.couleur || '#f97c0a' })
    setEditProduit(p)
    setImgPreview(p.imageUrl ? getImageUrl(p.imageUrl) : null)
    setImageUrl(p.imageUrl && p.imageUrl.startsWith('http') ? p.imageUrl : '')
    setFile(null)
    setShowForm(true)
    window.scrollTo(0, 0)
  }

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setImgPreview(URL.createObjectURL(f))
    setImageUrl('') // File takes priority
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.marque || !form.prix) { toast.error('Marque et prix requis.'); return }
    const fd = new FormData()
    if (file) fd.append('image', file)
    else if (imageUrl) fd.append('imageUrl', imageUrl)
    else if (editProduit?.imageUrl) fd.append('imageUrl', editProduit.imageUrl) // Keep existing
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
    if (editProduit) updateMut.mutate({ id: editProduit._id, fd })
    else createMut.mutate(fd)
  }

  const handleDelete = (p) => {
    if (window.confirm(`Supprimer ${p.marque} ${p.poids}kg ?`)) deleteMut.mutate(p._id)
  }

  const grouped = produits.reduce((acc, p) => {
    if (!acc[p.marque]) acc[p.marque] = []
    acc[p.marque].push(p)
    return acc
  }, {})

  const currentPreview = imgPreview || (imageUrl || null)
  const currentColor = form.marque ? (marqueColors[form.marque] || form.couleur || '#f97c0a') : form.couleur || '#f97c0a'

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header">
        <h1 className="section-title">Produits & Tarifs</h1>
        <button className="btn-primary" style={{ fontSize: '0.875rem', padding: '10px 18px' }}
          onClick={() => { resetForm(); setShowForm(true) }}>
          + Ajouter un produit
        </button>
      </div>

      {/* ── FORM ── */}
      {showForm && (
        <div style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '18px', padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-text)', marginBottom: '20px' }}>
            {editProduit ? '✏️ Modifier le produit' : '➕ Nouveau produit'}
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Image upload section */}
            <div>
              <span style={labelStyle}>Photo du produit (recommandé)</span>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {/* Preview */}
                <div
                  onClick={() => fileRef.current.click()}
                  style={{
                    width: '110px', height: '130px', borderRadius: '14px',
                    border: '2px dashed var(--c-border2)', background: 'var(--c-surface2)',
                    cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                  }}
                >
                  {currentPreview ? (
                    <>
                      <img src={currentPreview} alt="preview"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={e => { e.target.style.display = 'none' }}
                      />
                      <button type="button"
                        onClick={e => { e.stopPropagation(); setImgPreview(null); setFile(null); setImageUrl('') }}
                        style={{ position: 'absolute', top: '4px', right: '4px', width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.7rem' }}>
                        ✕
                      </button>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                      <GasBottle color={currentColor} poids={form.poids || 12.5} size={60} marque={form.marque} />
                      <div style={{ color: 'var(--c-dim)', fontSize: '0.65rem', marginTop: '6px' }}>Cliquer pour ajouter</div>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />

                <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button type="button" onClick={() => fileRef.current.click()} className="btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '9px 16px', justifyContent: 'flex-start' }}>
                    📤 Uploader une photo
                  </button>
                  <div>
                    <span style={{ ...labelStyle, textTransform: 'none', letterSpacing: 0, fontSize: '0.72rem' }}>ou coller une URL externe :</span>
                    <input type="url" style={inputStyle} placeholder="https://exemple.com/bouteille.jpg"
                      value={imageUrl} onChange={e => { setImageUrl(e.target.value); if (e.target.value) { setImgPreview(e.target.value); setFile(null) } else setImgPreview(null) }} />
                  </div>
                  <p style={{ color: 'var(--c-dim)', fontSize: '0.72rem', fontFamily: 'var(--font-body)', lineHeight: 1.4 }}>
                    JPG, PNG, WebP — max 5 Mo.<br />
                    Sans photo, l'illustration SVG sera utilisée.
                  </p>
                </div>
              </div>
            </div>

            {/* Marque */}
            <div>
              <span style={labelStyle}>Marque *</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {MARQUES_DEFAULT.map(m => (
                  <button key={m} type="button"
                    onClick={() => setForm(f => ({ ...f, marque: m, couleur: marqueColors[m] || '#f97c0a' }))}
                    style={{
                      padding: '7px 14px', borderRadius: '99px', border: '1px solid var(--c-border)',
                      background: form.marque === m ? 'var(--c-brand)' : 'var(--c-surface2)',
                      color: form.marque === m ? '#fff' : 'var(--c-muted)',
                      fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                    }}>{m}</button>
                ))}
              </div>
              <input type="text" style={inputStyle} placeholder="Ou tapez une marque personnalisée"
                value={form.marque} onChange={e => setForm(f => ({ ...f, marque: e.target.value }))} />
            </div>

            {/* Poids */}
            <div>
              <span style={labelStyle}>Format *</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                {POIDS.map(p => (
                  <button key={p} type="button" onClick={() => setForm(f => ({ ...f, poids: p }))}
                    style={{
                      padding: '12px', borderRadius: '12px',
                      border: form.poids === p ? `2px solid ${currentColor}` : '1px solid var(--c-border2)',
                      background: form.poids === p ? `${currentColor}14` : 'var(--c-surface2)',
                      fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: 'var(--c-text)', cursor: 'pointer',
                      boxShadow: form.poids === p ? `0 0 12px ${currentColor}30` : 'none',
                    }}>{p} kg</button>
                ))}
              </div>
            </div>

            {/* Prix / Stock */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={labelStyle}>Prix (FCFA) *</span>
                <input type="number" style={inputStyle} placeholder="3500" min="0"
                  value={form.prix} onChange={e => setForm(f => ({ ...f, prix: e.target.value }))} required />
              </div>
              <div>
                <span style={labelStyle}>Stock</span>
                <input type="number" style={inputStyle} min="0"
                  value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} />
              </div>
            </div>

            {/* Description */}
            <div>
              <span style={labelStyle}>Description</span>
              <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '72px' }}
                placeholder="Description du produit..."
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            {/* Couleur + Disponible */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <span style={labelStyle}>Couleur de la marque</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="color" value={form.couleur}
                    onChange={e => setForm(f => ({ ...f, couleur: e.target.value }))}
                    style={{ width: '44px', height: '44px', borderRadius: '10px', border: '1px solid var(--c-border)', padding: '2px', background: 'var(--c-surface2)', cursor: 'pointer' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-muted)', fontSize: '0.82rem' }}>{form.couleur}</span>
                </div>
              </div>
              <div>
                <span style={labelStyle}>Disponible</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', paddingTop: '10px' }}>
                  <div style={{ width: '44px', height: '24px', borderRadius: '12px', background: form.disponible ? 'var(--c-brand)' : 'var(--c-border2)', position: 'relative', transition: 'background 0.2s', cursor: 'pointer' }}
                    onClick={() => setForm(f => ({ ...f, disponible: !f.disponible }))}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: form.disponible ? '22px' : '2px', transition: 'left 0.2s' }} />
                  </div>
                  <span style={{ color: 'var(--c-muted)', fontSize: '0.85rem' }}>{form.disponible ? 'Oui' : 'Non'}</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
              <button type="button" onClick={resetForm} className="btn-secondary" style={{ flex: 1 }}>Annuler</button>
              <button type="submit" className="btn-primary" style={{ flex: 2 }}
                disabled={createMut.isPending || updateMut.isPending}>
                {editProduit ? 'Mettre à jour' : 'Créer le produit'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── PRODUCT LIST ── */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '18px' }} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Object.entries(grouped).map(([marque, items]) => {
            const color = marqueColors[marque] || items[0]?.couleur || '#f97c0a'
            return (
              <div key={marque} style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '18px', overflow: 'hidden' }}>
                {/* Brand header */}
                <div style={{
                  padding: '14px 20px', borderBottom: '1px solid var(--c-border)',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: `linear-gradient(90deg, ${color}12, transparent)`,
                }}>
                  <div style={{ width: '4px', height: '32px', borderRadius: '4px', background: color, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--c-text)', fontSize: '1rem' }}>{marque}</span>
                  <span style={{ color: 'var(--c-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{items.length} format(s)</span>
                </div>
                {/* Items */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
                  {items.sort((a, b) => a.poids - b.poids).map((p, idx) => (
                    <div key={p._id} style={{
                      padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                      borderRight: idx < items.length - 1 ? '1px solid var(--c-border)' : 'none',
                    }}>
                      {/* Real image or SVG fallback */}
                      <ProductImage
                        imageUrl={p.imageUrl}
                        couleur={color}
                        poids={p.poids}
                        marque={marque}
                        size={72}
                        objectFit="contain"
                      />
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--c-text)' }}>
                          {p.poids} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--c-muted)' }}>kg</span>
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color }}>
                          {formatPrix(p.prix)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--c-dim)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                          Stock: {p.stock} · {p.disponible ? '✅' : '❌'}
                        </div>
                        {p.imageUrl ? (
                          <div style={{ fontSize: '0.65rem', color: '#34d399', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>📷 Photo réelle</div>
                        ) : (
                          <div style={{ fontSize: '0.65rem', color: 'var(--c-dim)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>🎨 Illustration SVG</div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleEdit(p)}
                          style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--c-surface2)', border: '1px solid var(--c-border)', color: 'var(--c-muted)', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                          ✏️ Modifier
                        </button>
                        <button onClick={() => handleDelete(p)} disabled={deleteMut.isPending}
                          style={{ padding: '6px 10px', borderRadius: '8px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem' }}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
