/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Zico Perfume Brand Colors - Beige & Burgundy Theme
        burgundy: {
          50: '#fdf2f4',   // Very light burgundy
          100: '#fce7ea',  // Light burgundy
          200: '#f9d0d6',  // Soft burgundy
          300: '#f4a8b4',  // Medium light burgundy
          400: '#ec7085',  // Medium burgundy
          500: '#de4a5f',  // Base burgundy
          600: '#c4314a',  // Strong burgundy
          700: '#a91b47',  // Dark burgundy
          800: '#8b1538',  // Very dark burgundy
          900: '#4a0e1a',  // Deep burgundy
        },
        beige: {
          50: '#fdfcfa',   // Very light beige
          100: '#f8f5f0',  // Light beige
          200: '#f5f1eb',  // Soft beige
          300: '#ede6d9',  // Medium light beige
          400: '#e0d4c1',  // Medium beige
          500: '#c4a484',  // Base beige
          600: '#b8956b',  // Strong beige
          700: '#a08052',  // Dark beige
          800: '#8a6b42',  // Very dark beige
          900: '#6b5235',  // Deep beige
        },
        // Zico Brand Specific Colors
        zico: {
          primary: '#8B1538',    // Main burgundy
          secondary: '#A91B47',  // Secondary burgundy
          accent: '#C4A484',     // Warm beige
          light: '#F5F1EB',      // Cream beige
          dark: '#4A0E1A',       // Deep burgundy
          gold: '#D4AF37',       // Luxury gold accent
          rose: '#E8B4B8',       // Soft rose
          cream: '#FAF8F5',      // Warm cream
        },
        // Remove old cream and gold colors
      },
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'Almarai', 'sans-serif'],
        english: ['Cormorant Garamond', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      fontSize: {
        'responsive-xs': 'clamp(0.75rem, 2vw, 0.875rem)',
        'responsive-sm': 'clamp(0.875rem, 2.5vw, 1rem)',
        'responsive-base': 'clamp(1rem, 3vw, 1.125rem)',
        'responsive-lg': 'clamp(1.125rem, 3.5vw, 1.25rem)',
        'responsive-xl': 'clamp(1.25rem, 4vw, 1.5rem)',
        'responsive-2xl': 'clamp(1.5rem, 5vw, 2rem)',
        'responsive-3xl': 'clamp(1.875rem, 6vw, 2.5rem)',
        'responsive-4xl': 'clamp(2.25rem, 7vw, 3rem)',
        'responsive-5xl': 'clamp(3rem, 8vw, 4rem)',
      },
      maxWidth: {
        'container-sm': '640px',
        'container-md': '768px',
        'container-lg': '1024px',
        'container-xl': '1280px',
        'container-2xl': '1536px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(139, 21, 56, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(139, 21, 56, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      backgroundImage: {
        'gradient-zico': 'linear-gradient(135deg, #8B1538 0%, #A91B47 50%, #C4A484 100%)',
        'gradient-beige': 'linear-gradient(135deg, #F5F1EB 0%, #C4A484 100%)',
        'gradient-burgundy': 'linear-gradient(135deg, #4A0E1A 0%, #8B1538 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      },
      boxShadow: {
        'zico': '0 4px 20px rgba(139, 21, 56, 0.15)',
        'zico-lg': '0 8px 30px rgba(139, 21, 56, 0.2)',
        'zico-xl': '0 12px 40px rgba(139, 21, 56, 0.25)',
        'beige': '0 4px 20px rgba(196, 164, 132, 0.15)',
        'beige-lg': '0 8px 30px rgba(196, 164, 132, 0.2)',
        'inner-glow': 'inset 0 2px 4px rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [
    function({ addUtilities, addComponents }) {
      const newUtilities = {
        '.container-responsive': {
          'width': '100%',
          'margin-left': 'auto',
          'margin-right': 'auto',
          'padding-left': '1rem',
          'padding-right': '1rem',
          '@screen sm': {
            'padding-left': '1.5rem',
            'padding-right': '1.5rem',
            'max-width': '640px',
          },
          '@screen md': {
            'padding-left': '2rem',
            'padding-right': '2rem',
            'max-width': '768px',
          },
          '@screen lg': {
            'padding-left': '2rem',
            'padding-right': '2rem',
            'max-width': '1024px',
          },
          '@screen xl': {
            'padding-left': '2.5rem',
            'padding-right': '2.5rem',
            'max-width': '1280px',
          },
          '@screen 2xl': {
            'max-width': '1536px',
          },
        },
        '.text-responsive': {
          'font-size': 'clamp(1rem, 2.5vw, 1.125rem)',
          'line-height': '1.6',
        },
        '.heading-responsive': {
          'font-size': 'clamp(1.5rem, 5vw, 2.5rem)',
          'line-height': '1.2',
          'font-weight': '700',
        },
        '.card-responsive': {
          'padding': '1rem',
          'border-radius': '0.75rem',
          '@screen sm': {
            'padding': '1.5rem',
            'border-radius': '1rem',
          },
          '@screen lg': {
            'padding': '2rem',
            'border-radius': '1.5rem',
          },
        },
        '.grid-responsive': {
          'display': 'grid',
          'grid-template-columns': 'repeat(1, minmax(0, 1fr))',
          'gap': '1rem',
          '@screen sm': {
            'grid-template-columns': 'repeat(2, minmax(0, 1fr))',
            'gap': '1.5rem',
          },
          '@screen md': {
            'grid-template-columns': 'repeat(3, minmax(0, 1fr))',
          },
          '@screen lg': {
            'grid-template-columns': 'repeat(4, minmax(0, 1fr))',
            'gap': '2rem',
          },
        },
      }

      const newComponents = {
        '.btn-zico': {
          '@apply bg-gradient-to-r from-zico-primary to-zico-secondary text-white font-semibold py-3 px-6 rounded-xl hover:shadow-zico-lg transition-all duration-300 transform hover:scale-105': {},
        },
        '.btn-zico-outline': {
          '@apply border-2 border-zico-primary text-zico-primary bg-transparent font-semibold py-3 px-6 rounded-xl hover:bg-zico-primary hover:text-white transition-all duration-300': {},
        },
        '.card-zico': {
          '@apply bg-white rounded-2xl shadow-zico border border-beige-200 overflow-hidden hover:shadow-zico-lg transition-all duration-300': {},
        },
        '.perfume-bottle': {
          '@apply relative overflow-hidden rounded-2xl bg-gradient-to-br from-beige-50 to-beige-100 p-6 hover:shadow-zico-xl transition-all duration-500 transform hover:-translate-y-2': {},
        },
      }

      addUtilities(newUtilities)
      addComponents(newComponents)
    }
  ],
}