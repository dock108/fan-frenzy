/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  safelist: [
    'text-teamPrimary',
    'text-teamSecondary',
    'bg-teamPrimary',
    'bg-teamSecondary',
    'border-teamPrimary',
    'border-teamSecondary',
    'hover:text-teamPrimary',
    'hover:text-teamSecondary',
    'hover:bg-teamPrimary',
    'hover:bg-teamSecondary',
    'hover:border-teamPrimary',
    'hover:border-teamSecondary',
  ],
  theme: {
    extend: {
      colors: {
        // Base UI tokens
        background: 'var(--color-bg)',
        foreground: 'var(--color-fg)',
        accent: 'var(--color-accent)',
        
        // Team-based theme colors
        teamPrimary: 'var(--team-primary)',
        teamSecondary: 'var(--team-secondary)',
        teamAccent: 'var(--team-accent)',
        teamOverlay: 'var(--team-overlay)',
      },
      borderRadius: {
        'xs': '0.125rem',
        'sm': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'light': '0 1px 3px rgba(0,0,0,0.08)',
        'medium': '0 4px 6px rgba(0,0,0,0.1)',
        'heavy': '0 10px 15px rgba(0,0,0,0.1)',
        'inner-light': 'inset 0 2px 4px rgba(0,0,0,0.05)',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'bounce-out': 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
        'emphasis': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [],
}; 