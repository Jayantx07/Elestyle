/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F7F1E3",
        charcoal: "#1B2A2E",
        "muted-grey": "#4A5A62",
        "accent-teal": "#0F4C4C",
        "accent-gold": "#C9A05C",
        beige: "#E5DCC8",
      },
      fontFamily: {
        fraunces: ['"Fraunces"', 'serif'],
        serif: ['"Fraunces"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        'section': '160px',
      },
      borderRadius: {
        'lg': '24px',
        'xl': '32px',
      }
    },
  },
  plugins: [],
}

