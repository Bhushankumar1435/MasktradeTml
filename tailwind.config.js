/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        outfit: ["Outfit", "sans-serif"],
      },
      colors: {
        leat_dark: "#181818",
        light_dark:"#1E1E1E",
        light_white:"#F0F0F0",
        brand: {
          dark: "#0B1121",     // Deep space background
          darker: "#060A14",   // Deeper elements
          gold: "#d6a210",     // The accent color
          goldLight: "#f5c536", // Hover gold
          card: "rgba(30, 41, 59, 0.4)", // Translucent card bg
          cardHover: "rgba(30, 41, 59, 0.7)", 
        }
      },
      boxShadow: {
        'glow-gold': '0 0 15px rgba(214, 162, 16, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out both',
        'fade-in': 'fadeIn 0.4s ease-out both',
        'slide-in-left': 'slideInLeft 0.4s ease-out both',
        'slide-in-right': 'slideInRight 0.4s ease-out both',
        'scale-in': 'scaleIn 0.35s ease-out both',
        'shimmer': 'shimmer 2s linear infinite',
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
        'slide-down': 'slideDown 0.4s ease-out both',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(214,162,16,0.3)' },
          '50%': { boxShadow: '0 0 24px rgba(214,162,16,0.7)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.6)' },
          '60%': { opacity: '1', transform: 'scale(1.05)' },
          '80%': { transform: 'scale(0.97)' },
          '100%': { transform: 'scale(1)' },
        },
      }
    },
  },
  plugins: [],
}