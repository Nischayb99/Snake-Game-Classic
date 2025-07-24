/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                poppins: ['"Poppins"', 'sans-serif'],
            },
            backgroundImage: {
                'main-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            },
            boxShadow: {
                'play-btn': '0 4px 15px rgba(16, 185, 129, 0.3)',
                'play-btn-hover': '0 6px 20px rgba(16, 185, 129, 0.4)',
                'link-btn-hover': '0 6px 20px rgba(102, 126, 234, 0.4)',
            },
            animation: {
                float: 'float 3s ease-in-out infinite',
                pulse: 'pulse 2s ease-in-out infinite',
                bounce: 'bounce 0.5s ease-in-out',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                pulse: {
                    '0%, 100%': { transform: 'translateY(-50%) scale(1)' },
                    '50%': { transform: 'translateY(-50%) scale(1.2)' },
                },
                bounce: {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.1)' },
                },
            },
        },
    },
    plugins: [],
}