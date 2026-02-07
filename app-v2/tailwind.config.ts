import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Telegram theme variable integration
        tg: {
          bg: 'var(--tg-theme-bg-color, #0f0f0f)',
          'secondary-bg': 'var(--tg-theme-secondary-bg-color, #1a1a2e)',
          text: 'var(--tg-theme-text-color, #ffffff)',
          hint: 'var(--tg-theme-hint-color, #7d8590)',
          link: 'var(--tg-theme-link-color, #6c5ce7)',
          button: 'var(--tg-theme-button-color, #6c5ce7)',
          'button-text': 'var(--tg-theme-button-text-color, #ffffff)',
          'header-bg': 'var(--tg-theme-header-bg-color, #0f0f0f)',
        },
        // Brand palette
        brand: {
          50: '#f0eeff',
          100: '#d9d4ff',
          200: '#b3a8ff',
          300: '#8c7dff',
          400: '#6c5ce7',
          500: '#5a4bd1',
          600: '#483aba',
          700: '#362aa4',
          800: '#241b8d',
          900: '#130d77',
        },
        // Semantic colors
        surface: {
          DEFAULT: 'rgba(255, 255, 255, 0.05)',
          hover: 'rgba(255, 255, 255, 0.08)',
          active: 'rgba(255, 255, 255, 0.12)',
          raised: 'rgba(255, 255, 255, 0.07)',
        },
        success: { DEFAULT: '#00d68f', light: '#00ff9d' },
        warning: { DEFAULT: '#ffaa00', light: '#ffcc33' },
        danger: { DEFAULT: '#ff3d71', light: '#ff6b8a' },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s ease-out',
        shimmer: 'shimmer 2s infinite linear',
        'pulse-soft': 'pulseSoft 2s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient':
          'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
