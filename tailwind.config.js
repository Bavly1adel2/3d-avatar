/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
        '4xl': '1920px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      minHeight: {
        'mobile': '300px',
        'tablet': '400px',
        'desktop': '500px',
      },
      maxWidth: {
        'mobile': '100vw',
        'tablet': '768px',
        'laptop': '1024px',
        'desktop': '1280px',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'mobile': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'tablet': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'desktop': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  darkMode: "class",
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.mobile-first': {
          'min-width': '100%',
          'max-width': '100vw',
        },
        '.tablet-up': {
          '@media (min-width: 768px)': {
            'min-width': 'auto',
            'max-width': '768px',
          },
        },
        '.laptop-up': {
          '@media (min-width: 1024px)': {
            'min-width': 'auto',
            'max-width': '1024px',
          },
        },
        '.desktop-up': {
          '@media (min-width: 1280px)': {
            'min-width': 'auto',
            'max-width': '1280px',
          },
        },
      }
      addUtilities(newUtilities)
    }
  ],
}
