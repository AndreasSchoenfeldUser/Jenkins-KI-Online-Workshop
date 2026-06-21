/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Design-System "Soft Precision" (Comquent GmbH) — verbindliche Tokens.
        navy: '#0E2A4A',
        'navy-2': '#16395F',
        orange: '#E8520A',
        amber: '#F5A623',
        grey: '#55606B',
        light: '#EEF1F4',
        ink: '#1A1A1A',
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Cambria', 'Georgia', 'serif'],
        sans: ['Inter', 'Arial', 'Calibri', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', '"Courier New"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
      },
      boxShadow: {
        soft: '0 1px 3px rgba(14, 42, 74, 0.08), 0 4px 16px rgba(14, 42, 74, 0.06)',
        'soft-lg': '0 4px 24px rgba(14, 42, 74, 0.12)',
      },
      spacing: {
        // 4/8/16/24/32-Raster wird durch die Default-Skala abgedeckt.
      },
    },
  },
  plugins: [],
};
