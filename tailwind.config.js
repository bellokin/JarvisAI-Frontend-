module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
 theme: {
    extend: {
      animation: {
        'fade-in-out': 'fade-in-out 3s ease-in-out forwards',
        pulse: 'pulse 1.5s infinite',
      },
      keyframes: {
        'fade-in-out': {
          '0%, 100%': { opacity: 0, transform: 'scale(0.95)' },
          '50%': { opacity: 1, transform: 'scale(1)' },
        },
        pulse: {
          '0%, 100%': { opacity: 0.8, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.1)' },
        },
      },
    },
  },
  plugins: [],
};
