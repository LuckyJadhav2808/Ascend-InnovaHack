/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ascend: {
          bg: "#F7F6F3",
          card: "#FFFFFF",
          cardAlt: "#F1F1EF",
          mint: "#B7D9CF",
          mintLight: "#E8F4F0",
          pink: "#F4C9D6",
          pinkLight: "#FCEBF0",
          lavender: "#D9CFF0",
          lavenderLight: "#F0ECFA",
          yellow: "#F6D67A",
          yellowLight: "#FDF7E2",
          coral: "#FF6B4A",
          coralLight: "#FFEBE6",
          dark: "#1E1E1E",
          muted: "#8A8A8A",
          border: "#E5E5E0"
        }
      },
      fontFamily: {
        sans: ['Poppins', 'DM Sans', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 8px 30px -4px rgba(0, 0, 0, 0.08)',
        'glow-coral': '0 0 15px rgba(255, 107, 74, 0.4)',
      }
    },
  },
  plugins: [],
};
