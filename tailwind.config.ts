import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0",
          300: "#86efac", 400: "#4ade80", 500: "#22c55e",
          600: "#16a34a", 700: "#15803d", 800: "#166534",
          900: "#064E3B", 950: "#022c22",
        },
        gold: { 400: "#fbbf24", 500: "#f59e0b", 600: "#d97706" },
      },
      fontFamily: {
        sans:    ["Plus Jakarta Sans", "sans-serif"],
        display: ["Fraunces", "serif"],
      },
      boxShadow: {
        card: "0 2px 16px rgba(0,0,0,0.06)",
        "card-lg": "0 4px 32px rgba(0,0,0,0.10)",
      },
    },
  },
  plugins: [],
};
export default config;
