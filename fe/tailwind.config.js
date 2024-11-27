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
        customBlack: '#000000D9',
      },
      backgroundImage: {
        'hero': "url('./src/account/signin/img/Untitled.png')",
        'footer-texture': "url('/img/footer-texture.png')",
      },
      // Input-antd
      height: {
        '30px': '30px',
      },
      borderColor : {
        custom: '#ccc',
      },
      borderRadius: {
        lg: '0.4rem',  // Giữ nguyên giá trị rounded-lg hoặc tùy chỉnh nếu cần
        'custum':'60%/10%'
      }, 
    },
  },
  plugins: [
    flowbite.plugin(),
  ],
}
