/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            keyframes: {
                'pulse-glow': {
                    '0%': { boxShadow: '0 0 0 0 rgba(37, 211, 102, 0.7)' },
                    '70%': { boxShadow: '0 0 0 20px rgba(37, 211, 102, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(37, 211, 102, 0)' },
                }
            },
            animation: {
                'pulse-glow': 'pulse-glow 2s infinite',
            },
            colors: {
                brand: {
                    50: '#fff8ed',
                    100: '#ffeecb',
                    200: '#ffd98a',
                    300: '#ffbe44',
                    400: '#ffa01a',
                    500: '#f97c0a',
                    600: '#e05d00',
                    700: '#ba4102',
                    800: '#973309',
                    900: '#7c2a0b',
                },
                ink: {
                    50: '#f8f6f2',
                    100: '#eeebe3',
                    200: '#dbd5c8',
                    300: '#c0b9aa',
                    400: '#a39a8a',
                    500: '#8a8279',
                    600: '#706960',
                    700: '#5c5750',
                    800: '#3d3a35',
                    900: '#2a2824',
                    950: '#0f0e0c',
                },
                surface: {
                    1: '#080807',
                    2: '#111110',
                    3: '#1a1917',
                },
            },
            fontFamily: {
                display: ['"Poppins"', 'sans-serif'],
                body: ['"Poppins"', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
                poppins: ['"Poppins"', 'sans-serif'],
            },
            borderRadius: {
                'sm': '10px',
                'md': '16px',
                'lg': '22px',
                'xl': '28px',
                '2xl': '36px',
                '3xl': '48px',
            },
            screens: {
                'xs': '375px',
                'sm': '640px',
                'md': '768px',
                'lg': '1024px',
                'xl': '1280px',
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out both',
                'slide-up': 'slideUp 0.45s cubic-bezier(0.16,1,0.3,1) both',
                'scale-in': 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
                'float': 'float 3.5s ease-in-out infinite',
                'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
                'blink': 'blink 1.4s ease-in-out infinite',
                'spin-slow': 'spin 2s linear infinite',
            },
            keyframes: {
                fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
                slideUp: { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
                scaleIn: { from: { opacity: 0, transform: 'scale(0.92)' }, to: { opacity: 1, transform: 'scale(1)' } },
                float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
                glowPulse: {
                    '0%,100%': { boxShadow: '0 0 20px rgba(249,124,10,0.2)' },
                    '50%': { boxShadow: '0 0 40px rgba(249,124,10,0.5)' },
                },
                blink: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
            },
            boxShadow: {
                'brand': '0 0 24px rgba(249,124,10,0.35)',
                'brand-lg': '0 0 48px rgba(249,124,10,0.3), 0 0 96px rgba(249,124,10,0.1)',
                'card': '0 4px 24px rgba(0,0,0,0.4)',
                'card-lg': '0 12px 48px rgba(0,0,0,0.5)',
                'inner': 'inset 0 1px 0 rgba(255,255,255,0.05)',
            },
        },
    },
    plugins: [],
}