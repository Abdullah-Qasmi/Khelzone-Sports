/* =========================================================
   TAILWIND CONFIG - KHELZONE ADMIN DASHBOARD
   ========================================================= */

tailwind.config = {
    darkMode: "class",
    content: [
        "./admin-dashboard.html"
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    orange: "#ff5a00",
                    orangeDark: "#d63f00",
                    bg: "#08090b",
                    card: "#111318",
                    sidebar: "#0d0f12"
                }
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"]
            }
        }
    }
};