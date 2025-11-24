import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors from Unlimited Powerhouse
        brand: {
          blue: "#0020C2",
          orange: "#FFA300",
          jet: "#2D2D2D",
          rose: "#F22080",
          ghost: "#F3F6FF",
        },
        // Studio-specific palette - editorial, refined
        studio: {
          bg: "#FAFBFC",
          card: "#FFFFFF",
          border: "#E8ECF0",
          text: {
            primary: "#1A1D21",
            secondary: "#5E6670",
            muted: "#8B919A",
          },
          accent: {
            blue: "#0020C2",
            blueSoft: "#E8ECFF",
            orange: "#FFA300",
            orangeSoft: "#FFF4E0",
            success: "#10B981",
            successSoft: "#D1FAE5",
            warning: "#F59E0B",
            warningSoft: "#FEF3C7",
          },
        },
      },
      fontFamily: {
        // Editorial feel - refined and readable
        display: ["'Fraunces'", "Georgia", "serif"],
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      fontSize: {
        // Refined type scale
        xs: ["0.75rem", { lineHeight: "1.5" }],
        sm: ["0.875rem", { lineHeight: "1.5" }],
        base: ["1rem", { lineHeight: "1.6" }],
        lg: ["1.125rem", { lineHeight: "1.6" }],
        xl: ["1.25rem", { lineHeight: "1.5" }],
        "2xl": ["1.5rem", { lineHeight: "1.4" }],
        "3xl": ["1.875rem", { lineHeight: "1.3" }],
        "4xl": ["2.25rem", { lineHeight: "1.2" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
        card: "0 4px 16px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04)",
        elevated:
          "0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
