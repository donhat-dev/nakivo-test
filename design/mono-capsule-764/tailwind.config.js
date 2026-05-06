/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                capsule: {
                    canvas: "#efede8",
                    paper: "#f7f5f0",
                    ink: "#171816",
                    mute: "#6c6b64",
                    line: "#d4d0c8",
                    wash: "#e4e0d8",
                    smoke: "#b7b0a4",
                },
            },
            fontFamily: {
                sans: [
                    "Satoshi",
                    "Geist",
                    "Outfit",
                    "ui-sans-serif",
                    "system-ui",
                    "sans-serif",
                ],
                mono: [
                    "Geist Mono",
                    "JetBrains Mono",
                    "ui-monospace",
                    "SFMono-Regular",
                    "monospace",
                ],
            },
            keyframes: {
                capsuleMarquee: {
                    from: { transform: "translateX(0)" },
                    to: { transform: "translateX(-50%)" },
                },
                tracePulse: {
                    "0%, 100%": { opacity: "0.36", transform: "scaleX(0.96)" },
                    "50%": { opacity: "0.76", transform: "scaleX(1)" },
                },
                softFloat: {
                    "0%, 100%": { transform: "translate3d(0, 0, 0)" },
                    "50%": { transform: "translate3d(0, -12px, 0)" },
                },
            },
            animation: {
                capsuleMarquee: "capsuleMarquee 34s linear infinite",
                tracePulse:
                    "tracePulse 4.6s cubic-bezier(0.16, 1, 0.3, 1) infinite",
                softFloat:
                    "softFloat 8s cubic-bezier(0.16, 1, 0.3, 1) infinite",
            },
            boxShadow: {
                capsule: "0 26px 80px -54px rgba(23, 24, 22, 0.42)",
            },
        },
    },
    plugins: [],
};
