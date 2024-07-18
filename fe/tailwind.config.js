/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        customBlack: '#000000D9'
      },
      backgroundImage: {
        'hero': "url('./src/account/signin/img/Untitled.png')",
        'footer-texture': "url('/img/footer-texture.png')",
      },
    },
  },
  plugins: [],
}
