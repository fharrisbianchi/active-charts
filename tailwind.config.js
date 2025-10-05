/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de colores basada en el icono cripto con mejor contraste
        'crypto': {
          'navy': '#1e3a5f',      // Azul marino del fondo
          'navy-light': '#2d4a6b', // Azul marino más claro
          'navy-dark': '#0f1f35',  // Azul marino más oscuro
          'navy-darker': '#0a1525', // Azul marino aún más oscuro para mejor contraste
          'green': '#4ade80',      // Verde principal de las flechas
          'green-light': '#86efac', // Verde claro
          'green-lighter': '#bbf7d0', // Verde muy claro para mejor contraste
          'green-dark': '#22c55e',  // Verde oscuro
          'green-darker': '#16a34a', // Verde más oscuro para mejor contraste
          'gold': '#fbbf24',       // Amarillo/dorado del Bitcoin
          'gold-light': '#fcd34d',  // Dorado claro
          'gold-lighter': '#fef3c7', // Dorado muy claro para mejor contraste
          'gold-dark': '#f59e0b',   // Dorado oscuro
          'gold-darker': '#d97706',  // Dorado más oscuro para mejor contraste
          'cyan': '#06b6d4',       // Azul cian del diamante
          'cyan-light': '#22d3ee',  // Cian claro
          'cyan-lighter': '#cffafe', // Cian muy claro para mejor contraste
          'cyan-dark': '#0891b2',   // Cian oscuro
          'cyan-darker': '#0e7490', // Cian más oscuro para mejor contraste
          // Colores adicionales para mejor accesibilidad
          'white': '#ffffff',      // Blanco puro para texto
          'gray-light': '#f8fafc', // Gris muy claro
          'gray': '#64748b',       // Gris medio
          'gray-dark': '#334155',  // Gris oscuro
        }
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 15s ease infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        shimmer: {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        glow: {
          '0%': { 'box-shadow': '0 0 5px rgba(74, 222, 128, 0.5)' },
          '100%': { 'box-shadow': '0 0 20px rgba(74, 222, 128, 0.8), 0 0 30px rgba(74, 222, 128, 0.4)' }
        }
      },
      backgroundImage: {
        'crypto-gradient': 'linear-gradient(-45deg, #1e3a5f, #2d4a6b, #4ade80, #06b6d4)',
        'crypto-radial': 'radial-gradient(circle at center, #1e3a5f 0%, #0f1f35 100%)',
        'crypto-button': 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
        'crypto-button-hover': 'linear-gradient(135deg, #86efac 0%, #4ade80 100%)',
      }
    },
  },
  plugins: [],
}

