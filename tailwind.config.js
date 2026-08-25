/* ==========================================================================
   KHELZONE — Tailwind Configuration (CDN build)
   Loaded AFTER the Tailwind CDN <script> tag so `tailwind` already exists
   on window. Extends the default theme with KHELZONE's black + orange
   brand tokens so utility classes like `bg-khz-orange` or `font-display`
   are available directly in shop.html, on top of the CSS custom
   properties already used in shop.css.
   ========================================================================== */

tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        khz: {
          bg:        "#0A0A0A",
          "bg-alt":  "#121212",
          "bg-card": "#181818",
          orange:    "#FF6A00",
          "orange-dim": "#CC4E00",
          red:       "#FF3B30",
          gray:      "#A6A6A6",
          "gray-dim": "#6B6B6B",
          line:      "rgba(255,255,255,0.09)"
        }
      },
      fontFamily: {
        display: ["Anton", "sans-serif"],
        body: ["Manrope", "sans-serif"]
      },
      boxShadow: {
        khz: "0 20px 40px -12px rgba(0,0,0,0.55)",
        "khz-glow": "0 12px 28px -6px rgba(255,106,0,0.45)"
      },
      keyframes: {
        "khz-toast-in": {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" }
        },
        "khz-skeleton": {
          "0%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0 50%" }
        }
      },
      animation: {
        "khz-toast-in": "khz-toast-in .28s ease forwards",
        "khz-skeleton": "khz-skeleton 1.4s ease infinite"
      }
    }
  }
};