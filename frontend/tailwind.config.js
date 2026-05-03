/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 14px 40px rgba(15, 23, 42, 0.08)',
        card: '0 10px 30px rgba(15, 23, 42, 0.06)',
      },
      colors: {
        background: '#f5f7fb',
        'on-background': '#101828',
        surface: '#ffffff',
        'on-surface': '#101828',
        'on-surface-variant': '#667085',
        'surface-container-low': '#f8fafc',
        'surface-container': '#f3f6fb',
        'surface-container-high': '#edf2f7',
        'surface-container-highest': '#e2e8f0',
        outline: '#d0d5dd',
        'outline-variant': '#e4e7ec',
        primary: '#2b4c7e',
        'on-primary': '#ffffff',
        'primary-container': '#dbe6f7',
        secondary: '#3f5f88',
        'secondary-container': '#d9e7f8',
        tertiary: '#c55b31',
        'tertiary-container': '#f9e1d8',
        error: '#d92d20',
        'on-error': '#ffffff',
        'error-container': '#fee4e2',
        warning: '#b54708',
        success: '#067647',
      }
    },
  },
  plugins: [],
}