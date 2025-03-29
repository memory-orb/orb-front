import { heroui } from "@heroui/theme";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    './node_modules/@heroui/theme/dist/components/(button|toast|modal|select|input).js'
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      backgroundImage: {
        'bg-home': "url('../public/bg-home.png')"
      }
    },
  },
  darkMode: "class",
  plugins: [heroui()],
} satisfies Config;
