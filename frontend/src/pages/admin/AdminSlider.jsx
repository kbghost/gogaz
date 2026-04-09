import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sliderAPI, getImageUrl } from '../../services/api'
import toast from 'react-hot-toast'

const EMPTY = { titre:'', sousTitre:'', lien:'/commander', labelBouton:'Commander maintenant', ordre:0, actif:true }

const inputSt = {
  width:'100%', padding:'11px 13px', borderRadius:'11px',
  border:'1px solid var(--c-border2)', background:'var(--c-surface2)',
  color:'var(--c-text)', fontFamily:'var(--font-body)', fontSize:'14px', outline:'none',
}
const labelSt = {
  display:'block', color:'var(--c-muted)', fontSize:'0.7rem', fontWeight:600,
  marginBottom:'5px', fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.05em',
}

function SlideForm({ initial, onSubmit, onCancel, isPending }) {
  const [form, setForm]     = useState(initial ? { titre:initial.titre||'', sousTitre:initial.sousTitre||'', lien:initial.lien||'/commander', labelBouton:initial.labelBouton||'Commander', ordre:initial.ordre||0, actif:initial.actif!==false } : { ...EMPTY })
  const [file, setFile]     = useState(null)
  const [preview, setPreview] = useState(initial?.imageUrl ? getImageUrl(initial.imageUrl) : null)
  const [extUrl, setExtUrl] = useState('')
  const fileRef = useRef()

  const set = (k,v) => setForm(f => ({ ...f, [k]:v }))

  const handleFile = e => {
    const f = e.target.files[0]; if (!f) return
    setFile(f); setExtUrl(''); setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!file && !extUrl && !preview) { toast.error('Image requise.'); return }
    const fd = new FormData()
    if (file) fd.append('image', file)
    else if (extUrl) fd.append('imageUrl', extUrl)
    else if (initial?.imageUrl) fd.append('imageUrl', initial.imageUrl) // keep existing
    Object.entries(form).forEach(([k,v]) => fd.append(k, String(v)))
    onSubmit(fd)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

      {/* Image picker */}
      <div>
        <span style={labelSt}>Image du slide *</span>
        <div
          onClick={() => fileRef.current.click()}
          style={{
            height:'170px', borderRadius:'14px',
            border: preview ? '2px solid var(--c-brand)' : '2px dashed var(--c-border2)',
            background:'var(--c-surface2)', cursor:'pointer', overflow:'hidden',
            display:'flex', alignItems:'center', justifyContent:'center', position:'relative',
          }}
        >
          {preview
            ? <img src={preview} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { e.target.style.display='none' }} />
            : <div style={{ textAlign:'center', color:'var(--c-muted)' }}>
                <div style={{ fontSize:'2rem', marginBottom:'8px' }}>🖼️</div>
                <div style={{ fontSize:'0.82rem', fontFamily:'var(--font-body)' }}>Cliquez pour choisir</div>
                <div style={{ fontSize:'0.7rem', color:'var(--c-dim)', marginTop:'3px', fontFamily:'var(--font-mono)' }}>JPG, PNG, WebP — max 5 Mo</div>
              </div>
          }
          {preview && (
            <button type="button" onClick={e => { e.stopPropagation(); setPreview(null); setFile(null); setExtUrl('') }}
              style={{ position:'absolute', top:'8px', right:'8px', width:'26px', height:'26px', borderRadius:'50%', background:'rgba(0,0,0,0.65)', color:'#fff', border:'none', cursor:'pointer', fontSize:'0.8rem' }}>✕</button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display:'none' }} />

        {/* External URL */}
        <div style={{ marginTop:'8px' }}>
          <span style={{ ...labelSt, textTransform:'none', letterSpacing:0 }}>ou URL externe :</span>
          <input type="url" style={inputSt} placeholder="https://images.unsplash.com/..."
            value={extUrl}
            onChange={e => { setExtUrl(e.target.value); if (e.target.value) { setPreview(e.target.value); setFile(null) } else setPreview(null) }}
          />
        </div>
      </div>

      {/* Row: Titre + Label bouton */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
        <div>
          <span style={labelSt}>Titre</span>
          <input type="text" style={inputSt} placeholder="Livraison rapide de gaz" value={form.titre} onChange={e => set('titre', e.target.value)} />
        </div>
        <div>
          <span style={labelSt}>Label bouton</span>
          <input type="text" style={inputSt} placeholder="Commander maintenant" value={form.labelBouton} onChange={e => set('labelBouton', e.target.value)} />
        </div>
      </div>

      {/* Sous-titre */}
      <div>
        <span style={labelSt}>Sous-titre</span>
        <input type="text" style={inputSt} placeholder="Description courte visible sur le slide" value={form.sousTitre} onChange={e => set('sousTitre', e.target.value)} />
      </div>

      {/* Row: Lien + Ordre + Actif */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 80px 90px', gap:'12px', alignItems:'end' }}>
        <div>
          <span style={labelSt}>Lien du bouton</span>
          <input type="text" style={inputSt} placeholder="/commander" value={form.lien} onChange={e => set('lien', e.target.value)} />
        </div>
        <div>
          <span style={labelSt}>Ordre</span>
          <input type="number" min="0" style={inputSt} value={form.ordre} onChange={e => set('ordre', Number(e.target.value))} />
        </div>
        <div>
          <span style={labelSt}>Actif</span>
          <div
            onClick={() => set('actif', !form.actif)}
            style={{
              width:'44px', height:'24px', borderRadius:'12px', cursor:'pointer', position:'relative',
              background: form.actif ? 'var(--c-brand)' : 'var(--c-border2)',
              transition:'background 0.2s', marginTop:'10px',
            }}
          >
            <div style={{ width:'20px', height:'20px', borderRadius:'50%', background:'#fff', position:'absolute', top:'2px', left: form.actif ? '22px' : '2px', transition:'left 0.2s' }} />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display:'flex', gap:'10px', paddingTop:'4px' }}>
        <button type="button" onClick={onCancel} className="btn-secondary" style={{ flex:1 }}>Annuler</button>
        <button type="submit" className="btn-primary" style={{ flex:2 }} disabled={isPending}>
          {isPending ? '⏳ Envoi…' : (initial ? 'Mettre à jour' : 'Créer le slide')}
        </button>
      </div>
    </form>
  )
}

export default function AdminSlider() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editSlide, setEditSlide] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['slider-admin'],
    queryFn: () => sliderAPI.getAll({ all: true }),
  })
  const slides = (data?.data?.slides || []).sort((a,b) => a.ordre - b.ordre)

  const refresh = () => { qc.invalidateQueries(['slider-admin']); qc.invalidateQueries(['slider-public']) }

  const createMut = useMutation({
    mutationFn: sliderAPI.create,
    onSuccess: () => { refresh(); toast.success('Slide créé ✓'); setShowForm(false) },
    onError: e => toast.error(e.response?.data?.message || 'Erreur'),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, fd }) => sliderAPI.update(id, fd),
    onSuccess: () => { refresh(); toast.success('Slide mis à jour ✓'); setShowForm(false); setEditSlide(null) },
    onError: e => toast.error(e.response?.data?.message || 'Erreur'),
  })
  const deleteMut = useMutation({
    mutationFn: sliderAPI.delete,
    onSuccess: () => { refresh(); toast.success('Slide supprimé') },
    onError: e => toast.error(e.message),
  })

  const openCreate = () => { setEditSlide(null); setShowForm(true); window.scrollTo(0,0) }
  const openEdit   = (s)  => { setEditSlide(s); setShowForm(true); window.scrollTo(0,0) }
  const closeForm  = ()   => { setShowForm(false); setEditSlide(null) }
  const handleDelete = s  => { if (window.confirm(`Supprimer "${s.titre||'ce slide'}" ?`)) deleteMut.mutate(s._id) }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }} className="animate-fade-in">

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'clamp(1.3rem,4vw,1.8rem)', color:'var(--c-text)', letterSpacing:'-0.02em' }}>Slider / Carousel</h1>
          <p style={{ color:'var(--c-muted)', fontSize:'0.82rem', fontFamily:'var(--font-body)', marginTop:'4px' }}>Images du carousel de la page d'accueil — défilement auto toutes les 10s</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Ajouter un slide</button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'18px', padding:'24px' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--c-text)', marginBottom:'18px', fontSize:'1rem' }}>
            {editSlide ? '✏️ Modifier le slide' : '➕ Nouveau slide'}
          </h3>
          <SlideForm
            initial={editSlide}
            onSubmit={fd => editSlide ? updateMut.mutate({ id:editSlide._id, fd }) : createMut.mutate(fd)}
            onCancel={closeForm}
            isPending={createMut.isPending || updateMut.isPending}
          />
        </div>
      )}

      {/* Slides grid */}
      {isLoading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'14px' }}>
          {Array(3).fill(0).map((_,i) => <div key={i} className="skeleton" style={{ height:'220px', borderRadius:'16px' }} />)}
        </div>
      ) : slides.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px', background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'18px' }}>
          <div style={{ fontSize:'3rem', marginBottom:'12px' }}>🖼️</div>
          <p style={{ color:'var(--c-muted)', fontFamily:'var(--font-body)' }}>Aucun slide. Ajoutez des images pour activer le carousel.</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'14px' }}>
          {slides.map(slide => {
            const imgUrl = getImageUrl(slide.imageUrl)
            return (
              <div key={slide._id} style={{ background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'16px', overflow:'hidden' }}>
                {/* Image preview */}
                <div style={{ height:'160px', position:'relative', background:'var(--c-surface2)' }}>
                  {imgUrl
                    ? <img src={imgUrl} alt={slide.titre||'Slide'} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { e.target.style.display='none' }} />
                    : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--c-dim)', fontSize:'2rem' }}>🖼️</div>
                  }
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.65),transparent)' }} />
                  {/* Badges */}
                  <div style={{ position:'absolute', top:'8px', left:'10px', display:'flex', gap:'6px' }}>
                    <span style={{ background:'rgba(0,0,0,0.65)', color:'#fff', padding:'3px 8px', borderRadius:'99px', fontSize:'0.65rem', fontFamily:'var(--font-mono)' }}>Ordre #{slide.ordre}</span>
                    <span style={{
                      padding:'3px 8px', borderRadius:'99px', fontSize:'0.65rem', fontFamily:'var(--font-mono)', fontWeight:700,
                      background: slide.actif ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)',
                      color: slide.actif ? '#4ade80' : '#f87171',
                      border: `1px solid ${slide.actif ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
                    }}>
                      {slide.actif ? '● Actif' : '● Inactif'}
                    </span>
                  </div>
                  {slide.titre && (
                    <div style={{ position:'absolute', bottom:'8px', left:'10px', right:'10px', color:'#fff', fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.88rem', textShadow:'0 1px 6px rgba(0,0,0,0.7)' }}>
                      {slide.titre}
                    </div>
                  )}
                </div>

                {/* Info + actions */}
                <div style={{ padding:'12px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'8px' }}>
                  <div style={{ minWidth:0, flex:1 }}>
                    {slide.sousTitre && <div style={{ color:'var(--c-muted)', fontSize:'0.75rem', fontFamily:'var(--font-body)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{slide.sousTitre}</div>}
                    <div style={{ color:'var(--c-dim)', fontSize:'0.68rem', fontFamily:'var(--font-mono)', marginTop:'2px' }}>→ {slide.lien}</div>
                  </div>
                  <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
                    <button onClick={() => openEdit(slide)} title="Modifier"
                      style={{ width:'32px', height:'32px', borderRadius:'8px', background:'var(--c-surface2)', border:'1px solid var(--c-border)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem' }}>✏️</button>
                    <button onClick={() => handleDelete(slide)} disabled={deleteMut.isPending} title="Supprimer"
                      style={{ width:'32px', height:'32px', borderRadius:'8px', background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem' }}>🗑️</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tip */}
      {slides.length > 0 && (
        <div style={{ padding:'12px 16px', background:'rgba(249,124,10,0.06)', border:'1px solid rgba(249,124,10,0.15)', borderRadius:'12px', fontSize:'0.8rem', color:'var(--c-muted)', fontFamily:'var(--font-body)' }}>
          💡 <strong style={{ color:'var(--c-text)' }}>Ordre :</strong> le champ "Ordre" contrôle la séquence — 1 = premier. Images recommandées : 1400×580px format paysage.
        </div>
      )}
    </div>
  )
}
