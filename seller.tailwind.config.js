tailwind.config = {

    darkMode: "class",

    theme: {

        extend: {

            colors: {

                background: "#141313",

                "surface-container-lowest": "#101010",

                "surface-container-low": "#181818",

                "surface-container": "#1d1d1d",

                "surface-container-high": "#252525",

                "surface-container-highest": "#303030",

                "outline-variant": "#444748",

                "on-surface": "#E5E2E1",

                "on-surface-variant": "#BDB9B8",

                "vibrant-orange": "#FF6B00",

                "secondary-fixed": "#FF6B00",

                "on-secondary": "#141313",

                "electric-blue": "#2196F3"

            },

            maxWidth: {

                "container-max": "1500px"

            },

            spacing: {

                gutter: "clamp(18px, 5vw, 60px)",

                "section-desktop": "100px"

            }

        }

    }

};