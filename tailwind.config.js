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
        // Legacy alias for backwards compatibility
        page: 'hsl(var(--background))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontSize: {
        title: ['1.5rem', { lineHeight: '1.3' }],     // 24px - page titles
        h1: ['1.375rem', { lineHeight: '1.4' }],      // 22px - article h1
        h2: ['1.125rem', { lineHeight: '1.4' }],      // 18px - h2
        h3: ['1rem', { lineHeight: '1.5' }],          // 16px - h3
        section: ['1.125rem', { lineHeight: '1.4' }], // 18px - section headers
        body: ['1rem', { lineHeight: '1.6' }],        // 16px - bio, subtitles
        table: ['0.875rem', { lineHeight: '1.5' }],   // 14px - table cells, dense data
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    // Only apply hover styles on devices that support hover (not touch)
    // Usage: can-hover:hover:bg-accent instead of hover:bg-accent
    function({ addVariant }) {
      addVariant('can-hover', '@media (hover: hover)')
    },
  ],
}
