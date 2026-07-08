import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces — warm, quiet paper rather than a neon lavender wash
        bg: "#F6F2EC",        // warm off-white backdrop
        card: "#FFFFFF",      // clean surface
        // Ink + lines
        ink: "#241B33",       // ink for text & outlines (kept soft-black grape)
        line: "#ECE6DD",      // hairline / muted border
        // Brand — one confident accent (coral) with a restrained mint support
        coral: "#F0517C",     // slightly deeper, less candy than #FF5C8A
        coralDark: "#D43C68",
        mint: "#37D3AE",
        mintDark: "#1FB897",
        grape: "#2E2440",     // headings / primary text
        grapeLight: "#8C8398", // muted / secondary text
        butter: "#F5C451",
        peri: "#8B7BE8",
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
        // Soft, layered depth instead of hard neobrutalist offsets
        chunky: "0 2px 4px -2px rgba(36,27,51,0.10), 0 8px 22px -12px rgba(36,27,51,0.22)",
        chunkyHover: "0 6px 12px -6px rgba(36,27,51,0.14), 0 20px 40px -16px rgba(36,27,51,0.28)",
        btn: "0 1px 2px rgba(36,27,51,0.10), 0 6px 16px -8px rgba(36,27,51,0.30)",
        pill: "0 1px 2px rgba(36,27,51,0.08), 0 4px 12px -6px rgba(36,27,51,0.22)",
        glow: "0 14px 34px -14px rgba(240,81,124,0.55)",
        glass: "0 8px 32px rgba(36,27,51,0.10), inset 0 0 0 1px rgba(255,255,255,0.5)",
        fab: "0 8px 20px -6px rgba(240,81,124,0.45), 0 3px 8px -2px rgba(36,27,51,0.25)",
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
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        wiggle: {
          "0%,100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        pageIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        heartPop: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.5)" },
          "100%": { transform: "scale(1)" },
        },
        slideRight: {
          "0%": { transform: "translateX(-6px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        heroPulse: {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        floatY: "floatY 6s ease-in-out infinite",
        popIn: "popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
        fadeUp: "fadeUp 0.5s ease both",
        fadeIn: "fadeIn 0.4s ease both",
        wiggle: "wiggle 0.4s ease-in-out",
        pageIn: "pageIn 0.35s cubic-bezier(0.22,1,0.36,1) both",
        heartPop: "heartPop 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        slideRight: "slideRight 0.3s ease both",
      },
      backdropBlur: {
        xs: "4px",
      },
    },
  },
  plugins: [],
};
export default config;
