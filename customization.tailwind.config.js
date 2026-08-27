/* ==========================================================================
   KHELZONE — Tailwind config for customization.html
   Load this BEFORE the Tailwind CDN script tag so the CDN build picks it up:

   <script src="customization.tailwind.config.js"></script>
   <script src="https://cdn.tailwindcss.com"></script>
   ========================================================================== */

window.tailwind = window.tailwind || {};
window.tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        kz: {
          bg: "#050505",        // primary background
          bg2: "#0B0B0B",       // secondary background
          card: "#111111",      // card surface
          card2: "#161616",     // raised card surface
          border: "rgba(255,255,255,0.08)",
          borderStrong: "rgba(255,255,255,0.16)",
          text: "#FFFFFF",
          muted: "#A1A1AA",
          muted2: "#71717A",
        },
        orange: {
          DEFAULT: "#FF6A00",
          bright: "#FF7A18",
          soft: "rgba(255,106,0,0.10)",
          border: "rgba(255,106,0,0.35)",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.5rem",
      },
      boxShadow: {
        "kz-card": "0 8px 30px rgba(0,0,0,0.45)",
        "kz-pop": "0 20px 50px rgba(0,0,0,0.55), 0 0 40px rgba(255,106,0,0.08)",
        "kz-glow": "0 0 0 1px rgba(255,106,0,0.4), 0 0 24px rgba(255,106,0,0.25)",
      },
      keyframes: {
        kzFadeUp: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        kzPulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(0.82)" },
        },
        kzToastIn: {
          "0%": { opacity: "0", transform: "translateY(16px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        kzPop: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.06)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "kz-fade-up": "kzFadeUp 0.6s ease both",
        "kz-pulse-dot": "kzPulseDot 1.6s ease-in-out infinite",
        "kz-toast-in": "kzToastIn 0.35s cubic-bezier(0.16,1,0.3,1) both",
        "kz-pop": "kzPop 0.35s ease",
      },
    },
  },
};