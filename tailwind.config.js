/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    // Классы плиток разделов лежат в справочнике.
    './data/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12'
        },
        ink: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          400: '#94a3b8',
          300: '#cbd5e1'
        }
      },
      boxShadow: {
        soft: '0 6px 24px -8px rgba(15, 23, 42, 0.12)',
        card: '0 2px 10px -4px rgba(15, 23, 42, 0.10)'
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Inter', 'sans-serif']
      }
    }
  },
  plugins: []
};
