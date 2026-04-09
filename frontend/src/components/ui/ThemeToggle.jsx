import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle({ size = 36 }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      aria-label="Changer le thème"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '10px',
        border: '1px solid var(--c-border2)',
        background: 'var(--c-surface2)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${size * 0.5}px`,
        transition: 'all 0.2s ease',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span style={{
        display: 'block',
        transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(180deg) scale(0.9)',
        transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}
