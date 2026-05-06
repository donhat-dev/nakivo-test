/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        container: {
            center: true,
            padding: "1rem",
        },
        extend: {
            colors: {
                ink: "#121820",
                graphite: "#344050",
                mist: "#f7fbff",
                line: "#dbe8f5",
                blue: {
                    command: "#8fd3ff",
                    deep: "#246b95",
                    wash: "#eaf7ff",
                },
            },
            fontFamily: {
                sans: [
                    '"Space Grotesk"',
                    "ui-sans-serif",
                    "system-ui",
                    "sans-serif",
                ],
                mono: [
                    '"Geist Mono"',
                    '"IBM Plex Mono"',
                    "ui-monospace",
                    "monospace",
                ],
            },
            keyframes: {
                marquee: {
                    from: { transform: "translateX(0)" },
                    to: { transform: "translateX(-50%)" },
                },
                cursorBlink: {
                    "0%, 42%": { opacity: "1" },
                    "43%, 100%": { opacity: "0" },
                },
                bluePulse: {
                    "0%, 100%": { opacity: "0.34", transform: "scaleX(0.98)" },
                    "50%": { opacity: "0.72", transform: "scaleX(1)" },
                },
            },
            animation: {
                marquee: "marquee 28s linear infinite",
                cursor: "cursorBlink 1s steps(1) infinite",
                bluePulse:
                    "bluePulse 4.8s cubic-bezier(0.16, 1, 0.3, 1) infinite",
            },
            boxShadow: {
                panel: "0 24px 70px -42px rgba(36, 107, 149, 0.34)",
            },
        },
    },
    plugins: [],
};
