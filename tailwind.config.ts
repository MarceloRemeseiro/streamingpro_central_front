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
        // Colores base
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          background: "var(--card-background)",
        },
        // Colores de texto
        text: {
          primary: "var(--text-primary)",
          light: "var(--text-light)",
          muted: "var(--text-muted)",
        },
        // Colores primarios
        primary: {
          DEFAULT: "var(--primary)",
          light: "var(--primary-light)",
          dark: "var(--primary-dark)",
          hover: "var(--primary-hover)",
        },
        // Colores secundarios
        secondary: {
          DEFAULT: "var(--secondary)",
          light: "var(--secondary-light)",
          dark: "var(--secondary-dark)",
        },
        // Colores de estado
        success: {
          DEFAULT: "var(--success)",
          light: "var(--success-light)",
          dark: "var(--success-dark)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          light: "var(--warning-light)",
          dark: "var(--warning-dark)",
        },
        // Colores de error
        error: {
          DEFAULT: "var(--error)",
          light: "var(--error-light)",
          dark: "var(--error-dark)",
        },
        // Colores para protocolos
        protocol: {
          srt: {
            background: "var(--srt-background)",
            border: "var(--srt-border)",
            text: "var(--srt-text)",
            output: {
              background: "var(--srt-output-background)",
              border: "var(--srt-output-border)",
              text: "var(--srt-output-text)",
              secondary: "var(--srt-output-text-secondary)",
              hover: "var(--srt-output-text-hover)",
            },
          },
          rtmp: {
            background: "var(--rtmp-background)",
            border: "var(--rtmp-border)",
            text: "var(--rtmp-text)",
            output: {
              background: "var(--rtmp-output-background)",
              border: "var(--rtmp-output-border)",
              text: "var(--rtmp-output-text)",
              secondary: "var(--rtmp-output-text-secondary)",
              hover: "var(--rtmp-output-text-hover)",
            },
          },
        },
        // Estados del switch
        switch: {
          off: "var(--switch-off)",
          connecting: "var(--switch-connecting)",
          running: "var(--switch-running)",
          failed: "var(--switch-failed)",
        },
        // Colores para packet loss
        packetLoss: {
          good: "var(--packet-loss-good)",
          bad: "var(--packet-loss-bad)",
          text: "var(--packet-loss-text)",
        },
        // Navegación
        nav: {
          background: "var(--nav-background)",
          border: "var(--nav-border)",
          text: "var(--nav-text)",
          hover: "var(--nav-text-hover)",
          active: "var(--nav-text-active)",
        },
        // Autenticación
        auth: {
          input: {
            border: "var(--auth-input-border)",
            focus: "var(--auth-input-focus)",
          },
          button: {
            disabled: "var(--auth-button-disabled)",
            enabled: "var(--auth-button-enabled)",
            hover: "var(--auth-button-hover)",
          },
        },
        // Colores específicos
        hover: {
          link: "var(--hover-link)",
        },
        border: {
          DEFAULT: "var(--border-color)",
        },
        // Fondos especiales
        info: {
          background: "var(--info-background)",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
