/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        "background-muted": "rgb(var(--background-muted) / <alpha-value>)",
        "background-inverse": "rgb(var(--background-inverse) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        "foreground-secondary":
          "rgb(var(--foreground-secondary) / <alpha-value>)",
        "foreground-inverse": "rgb(var(--foreground-inverse) / <alpha-value>)",

        "foreground-secondary-strong":
          "rgb(var(--foreground-secondary-strong) / <alpha-value>)",

        border: "rgb(var(--border) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-secondary": "rgb(var(--accent-secondary) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
