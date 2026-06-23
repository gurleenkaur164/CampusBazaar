import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces
        bg: "#F4EEFF",        // lavender mist backdrop
        card: "#FFFBF5",      // warm cream surface
        // Ink + lines
        ink: "#2E1A47",       // deep grape — text & chunky borders
        line: "#E7DBFB",      // hairline / muted border
        // Brand pops
        coral: "#FF5C8A",
        coralDark: "#E03D72",
        mint: "#5BE9C2",
        mintDark: "#27C7A0",
        grape: "#3D2167",
        grapeLight: "#8A6FB0",
        butter: "#FFD66B",
        peri: "#A78BFA",
      },
      fontFamily: {
        display: ["var(--font-display)", "Baloo 2", "sans-serif"],
        body: ["var(--font-body)", "Plus Jakarta Sans", "sans-serif"],
        data: ["var(--font-data)", "Space Grotesk", "monospace"],
      },
      spacing: {
        "4.5": "1.125rem",
      },
      boxShadow: {
        chunky: "5px 6px 0px rgba(46,26,71,0.14)",
        chunkyHover: "8px 10px 0px rgba(46,26,71,0.20)",
        btn: "3px 3px 0px #2E1A47",
        pill: "2px 2px 0px #2E1A47",
        glow: "0 18px 40px -16px rgba(255,92,138,0.45)",
      },
      borderRadius: {
        chunky: "22px",
        blob: "28px",
      },
      keyframes: {
        floatY: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        popIn: {
          "0%": { transform: "scale(0.92) translateY(6px)", opacity: "0" },
          "100%": { transform: "scale(1) translateY(0)", opacity: "1" },
        },
        fadeUp: {
          "0%": { transform: "translateY(14px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        wiggle: {
          "0%,100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        floatY: "floatY 6s ease-in-out infinite",
        popIn: "popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
        fadeUp: "fadeUp 0.5s ease both",
        wiggle: "wiggle 0.4s ease-in-out",
      },
    },
  },
  plugins: [],
};
export default config;
