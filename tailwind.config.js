// tailwind.config.js

const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'bg-overlay-dark',
    'from-btn-from',
    'to-btn-to',
    'hover:from-btn-hover-from',
    'hover:to-btn-hover-to',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
      },
      backgroundColor: {
        'overlay-dark': 'rgba(0, 0, 0, 0.3)',
      },
      colors: {
        'btn-from': '#0A0DC4',
        'btn-to': '#8B0782',
        'btn-hover-from': '#080aa8',
        'btn-hover-to': '#6d0668',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
};
