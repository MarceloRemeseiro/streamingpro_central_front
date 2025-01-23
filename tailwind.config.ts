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
        background: {
          DEFAULT: '#ffffff',
          dark: '#130d44'    // Azul oscuro base
        },
        foreground: {
          DEFAULT: '#1a1a1a',
          dark: '#ffffff'
        },
        card: {
          background: {
            DEFAULT: '#ffffff',
            dark: '#0a0722'   // Azul más oscuro
          }
        },
        // Colores de texto
        text: {
          primary: {
            DEFAULT: '#1a1a1a',
            dark: '#ffffff'
          },
          light: '#ffffff',
          muted: {
            DEFAULT: '#6b7280',
            dark: '#9ca3af'
          }
        },
        // Colores primarios y secundarios de marca
        primary: {
          DEFAULT: '#3B82F6',    // Azul brillante
          light: '#60a5fa',
          dark: '#2563EB',       // Azul más oscuro
          hover: '#2563EB'
        },
        secondary: {
          DEFAULT: '#2563EB',    // Azul más oscuro
          light: '#3B82F6',
          dark: '#1d4ed8',
          hover: '#1d4ed8'
        },
        // Colores de estado
        success: {
          DEFAULT: '#22c55e',
          light: '#bbf7d0',
          dark: '#15803d'
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fde68a',
          dark: '#b45309'
        },
        error: {
          DEFAULT: '#ef4444',
          light: '#fee2e2',
          dark: '#b91c1c',
          hover: '#dc2626'
        },
        // Colores para protocolos
        protocol: {
          srt: {
            background: {
              DEFAULT: '#dbeafe',
              dark: 'rgba(59, 130, 246, 0.2)'   // primary con opacidad
            },
            border: {
              DEFAULT: '#bfdbfe',
              dark: '#2563EB'                    // secondary
            },
            text: {
              DEFAULT: '#1e40af',
              dark: '#93c5fd'
            },
            output: {
              background: {
                DEFAULT: 'rgba(219, 234, 254, 0.6)',
                dark: 'rgba(59, 130, 246, 0.3)'  // primary con opacidad
              },
              border: {
                DEFAULT: '#93c5fd',
                dark: '#2563EB'                   // secondary
              },
              text: {
                DEFAULT: '#1e3a8a',
                dark: '#bfdbfe'
              },
              secondary: {
                DEFAULT: '#2563eb',
                dark: '#60a5fa'
              },
              hover: {
                DEFAULT: '#1d4ed8',
                dark: '#93c5fd'
              }
            }
          },
          rtmp: {
            background: {
              DEFAULT: '#f3e8ff',
              dark: 'rgba(147, 51, 234, 0.2)'
            },
            border: {
              DEFAULT: '#e9d5ff',
              dark: '#6b21a8'
            },
            text: {
              DEFAULT: '#6b21a8',
              dark: '#e9d5ff'
            },
            output: {
              background: {
                DEFAULT: 'rgba(243, 232, 255, 0.6)',
                dark: 'rgba(147, 51, 234, 0.3)'
              },
              border: {
                DEFAULT: '#d8b4fe',
                dark: '#7e22ce'
              },
              text: {
                DEFAULT: '#6b21a8',
                dark: '#f3e8ff'
              },
              secondary: {
                DEFAULT: '#9333ea',
                dark: '#c084fc'
              },
              hover: {
                DEFAULT: '#7e22ce',
                dark: '#e9d5ff'
              }
            }
          }
        },
        // Estados del switch
        switch: {
          off: {
            DEFAULT: '#d1d5db',
            dark: '#4b5563'
          },
          connecting: {
            DEFAULT: '#f97316',
            dark: '#c2410c'
          },
          running: {
            DEFAULT: '#22c55e',
            dark: '#15803d'
          },
          failed: {
            DEFAULT: '#ef4444',
            dark: '#b91c1c'
          }
        },
        // Colores para packet loss
        packetLoss: {
          good: {
            DEFAULT: '#22c55e',
            dark: '#34d399'
          },
          bad: {
            DEFAULT: '#ef4444',
            dark: '#f87171'
          },
          text: {
            DEFAULT: '#9ca3af',
            dark: '#9ca3af'
          }
        },
        // Navegación
        nav: {
          background: {
            DEFAULT: '#ffffff',
            dark: '#0a0722'      // darker
          },
          border: {
            DEFAULT: '#e5e7eb',
            dark: '#130d44'      // dark
          },
          text: {
            DEFAULT: '#4b5563',
            dark: '#9ca3af'
          },
          hover: {
            DEFAULT: '#3B82F6',  // primary
            dark: '#60a5fa'      // primary light
          },
          active: {
            DEFAULT: '#2563EB',  // secondary
            dark: '#3B82F6'      // primary
          }
        },
        // Autenticación
        auth: {
          input: {
            border: {
              DEFAULT: '#d1d5db',
              dark: '#130d44'    // dark
            },
            focus: {
              DEFAULT: '#3B82F6', // primary
              dark: '#2563EB'     // secondary
            }
          },
          button: {
            disabled: {
              DEFAULT: '#60a5fa', // primary light
              dark: '#2563EB'     // secondary
            },
            enabled: {
              DEFAULT: '#3B82F6', // primary
              dark: '#2563EB'     // secondary
            },
            hover: {
              DEFAULT: '#2563EB', // secondary
              dark: '#1d4ed8'     // secondary dark
            }
          }
        },
        // Bordes y otros
        border: {
          DEFAULT: '#e5e7eb',
          dark: '#130d66'        // dark
        },
        info: {
          background: {
            DEFAULT: '#f3f4f6',
            dark: '#130d44'      // dark
          }
        }
      }
    }
  },
  darkMode: 'class',
  plugins: []
} satisfies Config;

