/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        page: 'var(--bg-page)',
      },
      fontSize: {
        title: 'var(--font-title)',
        h1: 'var(--font-h1)',
        section: 'var(--font-section)',
        body: 'var(--font-body)',
      },
    },
  },
  plugins: [],
}

