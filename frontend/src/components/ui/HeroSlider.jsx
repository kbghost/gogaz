import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { sliderAPI, getImageUrl } from '../../services/api'

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const intervalRef = useRef(null)

  const { data } = useQuery({
    queryKey: ['slider-public'],
    queryFn: () => sliderAPI.getAll(),
    staleTime: 5 * 60 * 1000,
  })

  const slides = data?.data?.slides || []

  const goTo = useCallback((index) => {
    if (isTransitioning || slides.length < 2) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrent(index)
      setIsTransitioning(false)
    }, 400)
  }, [isTransitioning, slides.length])

  const next = useCallback(() => {
    goTo((current + 1) % slides.length)
  }, [current, slides.length, goTo])

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length)
  }, [current, slides.length, goTo])

  // Auto-advance every 10 seconds
  useEffect(() => {
    if (slides.length < 2) return
    intervalRef.current = setInterval(next, 10000)
    return () => clearInterval(intervalRef.current)
  }, [next, slides.length])

  // Pause on hover
  const pauseAuto = () => clearInterval(intervalRef.current)
  const resumeAuto = () => {
    if (slides.length < 2) return
    intervalRef.current = setInterval(next, 10000)
  }

  if (!slides.length) {
    return (
      <div style={{ height: 'clamp(300px, 55vw, 580px)', background: 'var(--c-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⛽</div>
          <p style={{ color: 'var(--c-muted)', fontFamily: 'var(--font-body)' }}>Chargement...</p>
        </div>
      </div>
    )
  }

  const slide = slides[current]

  return (
    <div
      onMouseEnter={pauseAuto}
      onMouseLeave={resumeAuto}
      style={{
        position: 'relative',
        height: 'clamp(300px, 55vw, 580px)',
        overflow: 'hidden',
        background: 'var(--c-surface)',
      }}
    >
      {/* Slide image + overlay */}
      {slides.map((s, i) => (
        <div key={s._id} style={{
          position: 'absolute', inset: 0,
          opacity: i === current ? (isTransitioning ? 0 : 1) : 0,
          transition: 'opacity 0.6s ease',
          pointerEvents: i === current ? 'auto' : 'none',
        }}>
          <img
            src={getImageUrl(s.imageUrl)}
            alt={s.titre || `Slide ${i + 1}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            loading={i === 0 ? 'eager' : 'lazy'}
            onError={(e) => { e.target.style.display = 'none' }}
          />
          {/* Dark gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.1) 100%)',
          }} />
        </div>
      ))}

      {/* Content */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        padding: 'clamp(20px, 5vw, 80px)',
        opacity: isTransitioning ? 0 : 1,
        transform: isTransitioning ? 'translateY(12px)' : 'translateY(0)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}>
        <div style={{ maxWidth: '560px' }}>
          {slide.titre && (
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, color: '#fff',
              fontSize: 'clamp(1.4rem, 4vw, 2.8rem)', lineHeight: 1.15,
              letterSpacing: '-0.02em', marginBottom: '12px',
              textShadow: '0 2px 20px rgba(0,0,0,0.5)',
            }}>
              {slide.titre}
            </h2>
          )}
          {slide.sousTitre && (
            <p style={{
              color: 'rgba(255,255,255,0.88)', fontFamily: 'var(--font-body)',
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', lineHeight: 1.6,
              marginBottom: '24px', textShadow: '0 1px 8px rgba(0,0,0,0.5)',
            }}>
              {slide.sousTitre}
            </p>
          )}
          {slide.lien && (
            <Link to={slide.lien} className="btn-primary" style={{ fontSize: '0.95rem' }}>
              {slide.labelBouton || 'En savoir plus'} →
            </Link>
          )}
        </div>
      </div>

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Slide précédent"
            style={{
              position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
              width: '40px', height: '40px', borderRadius: '50%', border: 'none',
              background: 'rgba(0,0,0,0.45)', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', backdropFilter: 'blur(8px)',
              transition: 'background 0.2s',
              zIndex: 10,
            }}
          >‹</button>
          <button
            onClick={next}
            aria-label="Slide suivant"
            style={{
              position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
              width: '40px', height: '40px', borderRadius: '50%', border: 'none',
              background: 'rgba(0,0,0,0.45)', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', backdropFilter: 'blur(8px)',
              transition: 'background 0.2s',
              zIndex: 10,
            }}
          >›</button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div style={{
          position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '8px', zIndex: 10,
        }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Aller au slide ${i + 1}`}
              style={{
                width: i === current ? '24px' : '8px', height: '8px',
                borderRadius: '99px', border: 'none', cursor: 'pointer',
                background: i === current ? '#f97c0a' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.35s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {slides.length > 1 && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
          background: 'rgba(255,255,255,0.15)', zIndex: 10,
        }}>
          <div
            key={current} // Reset animation on slide change
            style={{
              height: '100%', background: '#f97c0a', borderRadius: '0 3px 3px 0',
              animation: 'progressBar 10s linear',
              animationFillMode: 'forwards',
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes progressBar { from { width: 0% } to { width: 100% } }
      `}</style>
    </div>
  )
}
