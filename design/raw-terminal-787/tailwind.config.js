/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                mono: [
                    '"IBM Plex Mono"',
                    '"JetBrains Mono"',
                    "ui-monospace",
                    "monospace",
                ],
                display: [
                    '"Archivo Black"',
                    "Arial Black",
                    "system-ui",
                    "sans-serif",
                ],
            },
            colors: {
                crt: "#0A0A0A",
                phosphor: "#EAEAEA",
                grid: "#2A2A2A",
                dim: "#8B8B8B",
                hazard: "#E61919",
                live: "#4AF626",
            },
        },
    },
    plugins: [],
};
