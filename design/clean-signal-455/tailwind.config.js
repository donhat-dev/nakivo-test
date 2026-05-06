/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                display: ['"Space Grotesk"', "system-ui", "sans-serif"],
                body: ['"Space Grotesk"', "system-ui", "sans-serif"],
            },
            colors: {
                signal: {
                    ink: "#101827",
                    blue: "#004CFF",
                    green: "#21B799",
                    paper: "#FFFFFF",
                    wash: "#F5F7FA",
                    line: "#E4E8EF",
                    muted: "#687385",
                },
            },
        },
    },
    plugins: [],
};
