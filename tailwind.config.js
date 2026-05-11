/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: "#0b0e11",
          panel: "#12161c",
          border: "#1e2630",
          muted: "#6b7280",
          accent: "#00d4aa",
          warn: "#f5a623",
          danger: "#ff5c5c",
          grid: "#1a222d",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        panel: "0 0 0 1px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};
