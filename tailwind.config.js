/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Palette - Professional E-Commerce
        primary: {
          DEFAULT: '#1A1A2E',   // Deep Navy
          50: '#E8E8F0',
          100: '#C5C5D9',
          200: '#9F9FBF',
          300: '#7878A5',
          400: '#5C5C91',
          500: '#1A1A2E',       // Main
          600: '#16162A',
          700: '#121226',
          800: '#0E0E22',
          900: '#0A0A1E',
        },
        accent: {
          DEFAULT: '#E8B86D',   // Warm Gold
          50: '#FDF7EE',
          100: '#FAE9CC',
          200: '#F5D4A0',
          300: '#EFBE74',
          400: '#E8B86D',       // Main
          500: '#D9A24E',
          600: '#B8832A',
          700: '#8E621C',
          800: '#65440F',
          900: '#3C2606',
        },
        secondary: {
          DEFAULT: '#F5F0EB',   // Warm Cream
          50: '#FDFCFB',
          100: '#F8F4F0',
          200: '#F5F0EB',       // Main
          300: '#EDE4D9',
          400: '#DDD1C3',
          500: '#CCBEAC',
          600: '#B5A490',
          700: '#9A8872',
          800: '#7A6B56',
          900: '#574C3B',
        },
        surface: '#FFFFFF',
        danger: {
          DEFAULT: '#C0392B',
          50: '#FDECEA',
          100: '#FBCBC7',
          200: '#F79B93',
          300: '#F36B5F',
          400: '#EF3B2B',
          500: '#C0392B',
          600: '#A53225',
          700: '#8A2A1F',
          800: '#6F2219',
          900: '#541A13',
          light: '#FDECEA',
        },
        success: {
          DEFAULT: '#27AE60',
          50: '#E8F8F0',
          100: '#C5EDDA',
          200: '#8EDCB5',
          300: '#57CA90',
          400: '#27AE60',
          500: '#229352',
          600: '#1C7844',
          700: '#165D36',
          800: '#104228',
          900: '#0A271A',
          light: '#E8F8F0',
        },
        warning: {
          DEFAULT: '#F39C12',
          50: '#FEF9E7',
          100: '#FDEDC0',
          200: '#FBD88A',
          300: '#F9C354',
          400: '#F7AE1E',
          500: '#F39C12',
          600: '#D4870F',
          700: '#B5720C',
          800: '#965D09',
          900: '#774806',
          light: '#FEF9E7',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-hero': 'linear-gradient(135deg, #1A1A2E 0%, #2d2d4e 100%)',
        'gradient-gold': 'linear-gradient(135deg, #E8B86D 0%, #D9A24E 100%)',
        'gradient-cream': 'linear-gradient(135deg, #F5F0EB 0%, #EDE4D9 100%)',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.1), 0 16px 40px rgba(0,0,0,0.12)',
        'nav': '0 2px 20px rgba(26,26,46,0.08)',
        'btn': '0 2px 8px rgba(26,26,46,0.3)',
        'btn-gold': '0 2px 8px rgba(232,184,109,0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [],
}
