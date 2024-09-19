/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
          primary: '#05FF79',
          secondary: '#0E0E0F',
          background: '#09090A'
      },
    },
  },
  plugins: [],
};
