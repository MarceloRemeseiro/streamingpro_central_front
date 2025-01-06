import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          background: "var(--card-background)",
        },
        // Colores del texto
        text: {
          primary: "var(--text-primary)",
          light: "var(--text-light)",
        },
        // Colores principales
        primary: {
          DEFAULT: "var(--primary)",
          light: "var(--primary-light)",
          dark: "var(--primary-dark)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          light: "var(--secondary-light)",
          dark: "var(--secondary-dark)",
        },
        // Colores de protocolos
        protocol: {
          srt: "var(--srt-color)",
          rtmp: "var(--rtmp-color)",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
