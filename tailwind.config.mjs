/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ─── Ink — deep navy spectrum (CrestHaven primary dark) ────
        // Sourced from the deck theme: dk1/dk2 = #07283B
        ink: {
          0: "#051826", // deepest — page background
          50: "#07283B", // primary navy (theme dk1)
          100: "#0E3349", // panel
          200: "#143E54", // raised panel
          300: "#1F4D63", // borders / dividers
          400: "#2E5E73", // hairline emphasis
        },
        // ─── Bone — warm cream text (theme lt2 = #FAF3E8) ──────────
        bone: {
          DEFAULT: "#FAF3E8",
          parchment: "#FFF8EE", // hlink-derived warm off-white
          muted: "#B8C4CC", // cool slate, sub-labels
          dim: "#6B7B8D", // deeper slate-blue
        },
        // ─── Accent — burnt terracotta (theme accent1 = #C4551E) ───
        // Replaces the gold accent. Same role: used sparingly for
        // key numbers, section markers, hover state on interactive.
        accent: {
          DEFAULT: "#C4551E",
          dim: "#A14416",
          glow: "#EC9C6B", // theme accent2 — soft peach
        },
        // ─── Data semantics ─────────────────────────────────────────
        positive: "#4A8C3F", // theme accent5 — forest green
        warning: "#EC9C6B", // muted peach (warmer than coral, fits the palette)
      },
      fontFamily: {
        // Headings — Roboto Slab Variable (Apache 2.0, self-hosted).
        // Stand-in for Adelle until a TypeTogether license is in place.
        serif: [
          '"Roboto Slab Variable"',
          '"Roboto Slab"',
          "Georgia",
          "ui-serif",
          "serif",
        ],
        // Body — DM Sans (Google Fonts, OFL). Self-hosted variable woff2.
        sans: [
          '"DM Sans Variable"',
          '"DM Sans"',
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        // Numbers — system mono until JetBrains Mono is licensed/dropped in
        mono: [
          "ui-monospace",
          '"SF Mono"',
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        "stat-sm": ["clamp(3.5rem, 8vw, 6rem)", { lineHeight: "0.9", letterSpacing: "-0.04em" }],
        "stat-md": ["clamp(4.5rem, 10vw, 8rem)", { lineHeight: "0.9", letterSpacing: "-0.045em" }],
        "stat-lg": ["clamp(5rem, 12vw, 11.25rem)", { lineHeight: "0.85", letterSpacing: "-0.05em" }],
        "display": ["clamp(3rem, 7vw, 6.5rem)", { lineHeight: "0.95", letterSpacing: "-0.035em" }],
        "headline": ["clamp(2rem, 4vw, 3.25rem)", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
      },
      letterSpacing: {
        "tightest": "-0.05em",
        "label": "0.18em",
      },
      maxWidth: {
        "shell": "1440px",
        "prose-tight": "62ch",
      },
      transitionTimingFunction: {
        "expo-out": "cubic-bezier(0.16, 1, 0.3, 1)",
        "power3-out": "cubic-bezier(0.215, 0.61, 0.355, 1)",
      },
    },
  },
  plugins: [],
};
