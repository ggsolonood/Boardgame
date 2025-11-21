/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',            // <<< เปลี่ยนจากค่า default 'media'
  content: ['./app/**/*.{ts,tsx}', './pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
