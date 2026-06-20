import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F3E8FF",
        card: "#FFF9F0",
        coral: "#FF6B9D",
        coralDark: "#E14F82",
        grape: "#5B2A86",
        grapeLight: "#8B5FBF",
        mint: "#7FFFD4",
        mintDark: "#3DDCA8",
        ink: "#3B1F5C",
        line: "#E6D6FA",
      },
      fontFamily: {
        display: ["Baloo 2", "sans-serif"],
        body: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        chunky: "6px 6px 0px rgba(91,42,134,0.15)",
        chunkyHover: "8px 8px 0px #3B1F5C",
        btn: "3px 3px 0px #3B1F5C",
      },
      borderRadius: {
        chunky: "20px",
      },
    },
  },
  plugins: [],
};
export default config;
