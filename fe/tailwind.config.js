/** @type {import('tailwindcss').Config} */
import flowbite from 'flowbite-react/tailwind'
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    flowbite.content(),
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
  plugins: [
    flowbite.plugin(),
  ],
}
