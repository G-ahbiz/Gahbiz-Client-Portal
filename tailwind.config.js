/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {},
      colors: {
        border: '#B0B0B0',
        font: '#121212',
        placeholder: '#888888',
        primary: '#005DB5',

        'light-bg': '#004D97',
        'light-card': '#ffffff',
        'light-text': '#121212',
        'light-subtext': '#888888',
        'light-divider': '#d0d0d0',
        'light-input': '#ffffff',
        'light-border': '#d0d0d0',
        'light-error': '#c0392b',
        'light-primary': '#004D97',
        'light-primary-hover': '#004080',
        'light-disabled': '#a0c8e8',
        'light-toggle': '#bfe3ff',
      },
    },
  },
  plugins: [],
  // Optimize for production builds
  corePlugins: {
    // Disable unused core plugins to reduce CSS
    preflight: true,
    container: true,
  },
  // Safelist only essential dynamic classes
  safelist: [
    // Add only classes that are dynamically generated
    'pi',
    'pi-*', // PrimeIcons classes
  ],
};
