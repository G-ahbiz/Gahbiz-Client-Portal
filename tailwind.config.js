/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui'],
        serif: ['"IBM Plex Serif"', 'ui-serif', 'Georgia'],
      },
      colors: {
        border: "#B0B0B0",
        font: "#121212",
        placeholder: "#888888",
        primary: "#005DB5",

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

        'dark-bg': '#0f172a',
        'dark-card': '#1e293b',
        'dark-text': '#e2e8f0',
        'dark-subtext': '#94a3b8',
        'dark-divider': '#334155',
        'dark-input': '#1e293b',
        'dark-border': '#475569',
        'dark-error': '#f87171',
        'dark-primary': '#3b82f6',
        'dark-primary-hover': '#2563eb',
        'dark-disabled': '#475569',
        'dark-toggle': '#1e40af',
      },
    },
  },
  plugins: [],
};
