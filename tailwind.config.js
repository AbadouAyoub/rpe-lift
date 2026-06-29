/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4 preset
  presets: [require('nativewind/preset')],
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // RPE Lift Design System — "Instrument de précision sombre"
        base: '#14140F',
        surface: '#1F1F17',
        border: '#3A3A30',
        accent: '#5DCAA5',
        'accent-text': '#04342C',
        'text-primary': '#F1EFE8',
        'text-secondary': '#888780',
        'text-muted': '#5F5E5A',
      },
      fontFamily: {
        sans: ['Inter', 'System'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      borderRadius: {
        card: '12px',
      },
      minHeight: {
        touch: '56px',
      },
    },
  },
  plugins: [],
};


