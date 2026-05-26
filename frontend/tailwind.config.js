export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        radar: {
          bg: '#0a1f1a',
          surface: '#0f2b24',
          border: '#1a4035',
          accent: '#ff6b2b',
          glow: '#ffb347',
          text: '#e8f0ed',
          muted: '#7a9e92',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      animation: {
        'radar-sweep': 'radar-sweep 4s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-in': 'slide-in 0.5s ease-out',
      },
      keyframes: {
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(255,107,43,0.4)' },
          '50%': { boxShadow: '0 0 24px rgba(255,107,43,0.8)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
