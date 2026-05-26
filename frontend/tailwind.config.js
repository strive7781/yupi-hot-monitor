export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        radar: {
          bg: '#050a0e',
          surface: 'rgba(10, 28, 38, 0.72)',
          border: '#1a3a4a',
          accent: '#00d4ff',
          glow: '#ff6b2b',
          hot: '#ff4757',
          text: '#e8f4f8',
          muted: '#6b8f9e',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
      },
      animation: {
        'radar-sweep': 'radar-sweep 4s linear infinite',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        'slide-in': 'slide-in 0.45s ease-out both',
        'fade-up': 'fade-up 0.5s ease-out both',
        'scan-line': 'scan-line 3s ease-in-out infinite',
        'live-pulse': 'live-pulse 1.8s ease-in-out infinite',
      },
      keyframes: {
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(0,212,255,0.25)' },
          '50%': { boxShadow: '0 0 28px rgba(255,107,43,0.45)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scan-line': {
          '0%, 100%': { transform: 'translateX(-100%)', opacity: '0' },
          '50%': { transform: 'translateX(100%)', opacity: '1' },
        },
        'live-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.15)' },
        },
      },
      boxShadow: {
        glow: '0 0 24px rgba(0, 212, 255, 0.15)',
        'glow-hot': '0 0 20px rgba(255, 107, 43, 0.35)',
      },
    },
  },
  plugins: [],
};
