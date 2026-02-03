/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // 根据你的项目结构调整路径
    "./photo/pages/**/*.{js,jsx,ts,tsx}", // 新增你的 MyGallery.tsx 所在路径
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}