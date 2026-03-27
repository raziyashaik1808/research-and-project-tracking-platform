/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f0f0f7',
          100: '#e0e1ef',
          200: '#c2c3df',
          300: '#9fa2ca',
          400: '#7c7fb4',
          500: '#5c60a0',
          600: '#494d88',
          700: '#3a3d6e',
          800: '#2b2e54',
          900: '#1c1e38',
          950: '#0e0f1c',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
};
