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
        // Мягкий оранжевый: акцент без кислотности. Текст — от 700 (контраст ≥ 4.5 на белом).
        accent: {
          50:  '#fff8f1',
          100: '#ffefdf',
          200: '#fddcbd',
          300: '#f9c291',
          400: '#f4a466',
          500: '#ee8b45',
          600: '#dc7530',
          700: '#b35b22',
          800: '#8c471d',
          900: '#6f3a1a'
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
