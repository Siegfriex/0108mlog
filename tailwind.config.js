/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2A8E9E',   // Muted Teal - 현재 프론트엔드 디자인 시스템
          secondary: '#99F6E4', // Teal 200
          accent: '#FDA4AF',    // Soft Pink
          dark: '#115E59',      // Teal 800
          light: '#F0FDFA',     // Teal 50
        },
        emotion: {
          joy: { 100: '#FFF9C4', 400: '#FFD700', 600: '#FFA000' },
          peace: { 100: '#E1F5FE', 400: '#4FC3F7', 600: '#039BE5' },
          anxiety: { 100: '#FBE9E7', 400: '#FF8A65', 600: '#F4511E' },
          sadness: { 100: '#F3E5F5', 400: '#BA68C8', 600: '#8E24AA' },
          anger: { 100: '#FFEBEE', 400: '#EF5350', 600: '#C62828' },
        },
        status: {
          success: '#4CAF50',
          warning: '#FF9800',
          error: '#F44336',
          info: '#2196F3',
        },
        glass: {
          surface: 'rgba(255, 255, 255, 0.75)',
          border: 'rgba(255, 255, 255, 0.6)',
        },
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
        mono: ['Consolas', 'Monaco', 'monospace'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '18px' }],      // 1.5배
        sm: ['14px', { lineHeight: '21px' }],       // 1.5배
        base: ['16px', { lineHeight: '24px' }],    // 1.5배
        lg: ['20px', { lineHeight: '24px' }],       // 1.2배
        xl: ['24px', { lineHeight: '28.8px' }],     // 1.2배
        '2xl': ['32px', { lineHeight: '38.4px' }],  // 1.2배
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
        'touch-target': '44px', // 최소 터치 타겟 크기
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      gridTemplateColumns: {
        'auto-fit': 'repeat(auto-fit, minmax(250px, 1fr))',
        'auto-fill': 'repeat(auto-fill, minmax(200px, 1fr))',
      },
      boxShadow: {
        'glass': '0 20px 40px -10px rgba(42, 142, 158, 0.15)',
        'glass-hover': '0 25px 50px -12px rgba(42, 142, 158, 0.25)',
        'glow': '0 0 20px rgba(42, 142, 158, 0.4)',
        'floating': '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
        'brand': '0 8px 32px rgba(42, 142, 158, 0.05)',
      },
      borderRadius: {
        sm: '16px',
        md: '24px',
        lg: '32px',
        xl: '36px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          'from': { backgroundPosition: '0 0' },
          'to': { backgroundPosition: '-200% 0' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
