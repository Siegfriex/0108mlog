/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
  ],
  darkMode: ['class', '[data-theme="night"]'],
  theme: {
    extend: {
      /* ========================================
       * 색상 시스템
       * ======================================== */
      colors: {
        brand: {
          50: 'rgb(var(--color-brand-50-rgb) / <alpha-value>)',
          100: 'rgb(var(--color-brand-100-rgb) / <alpha-value>)',
          200: 'rgb(var(--color-brand-200-rgb) / <alpha-value>)',
          300: 'rgb(var(--color-brand-300-rgb) / <alpha-value>)',
          400: 'rgb(var(--color-brand-400-rgb) / <alpha-value>)',
          500: 'rgb(var(--color-brand-500-rgb) / <alpha-value>)',
          600: 'rgb(var(--color-brand-600-rgb) / <alpha-value>)',
          700: 'rgb(var(--color-brand-700-rgb) / <alpha-value>)',
          800: 'rgb(var(--color-brand-800-rgb) / <alpha-value>)',
          900: 'rgb(var(--color-brand-900-rgb) / <alpha-value>)',
          primary: 'rgb(var(--color-brand-primary-rgb) / <alpha-value>)',
          secondary: 'rgb(var(--color-brand-secondary-rgb) / <alpha-value>)',
          accent: 'rgb(var(--color-brand-accent-rgb) / <alpha-value>)',
          dark: 'rgb(var(--color-brand-dark-rgb) / <alpha-value>)',
          light: 'rgb(var(--color-brand-light-rgb) / <alpha-value>)',
        },
        emotion: {
          joy: {
            100: 'rgb(var(--color-emotion-joy-100-rgb) / <alpha-value>)',
            400: 'rgb(var(--color-emotion-joy-400-rgb) / <alpha-value>)',
            600: 'rgb(var(--color-emotion-joy-600-rgb) / <alpha-value>)',
          },
          peace: {
            100: 'rgb(var(--color-emotion-peace-100-rgb) / <alpha-value>)',
            400: 'rgb(var(--color-emotion-peace-400-rgb) / <alpha-value>)',
            500: 'rgb(var(--color-emotion-peace-500-rgb) / <alpha-value>)',
            600: 'rgb(var(--color-emotion-peace-600-rgb) / <alpha-value>)',
          },
          anxiety: {
            100: 'rgb(var(--color-emotion-anxiety-100-rgb) / <alpha-value>)',
            400: 'rgb(var(--color-emotion-anxiety-400-rgb) / <alpha-value>)',
            600: 'rgb(var(--color-emotion-anxiety-600-rgb) / <alpha-value>)',
          },
          sadness: {
            100: 'rgb(var(--color-emotion-sadness-100-rgb) / <alpha-value>)',
            400: 'rgb(var(--color-emotion-sadness-400-rgb) / <alpha-value>)',
            600: 'rgb(var(--color-emotion-sadness-600-rgb) / <alpha-value>)',
          },
          anger: {
            100: 'rgb(var(--color-emotion-anger-100-rgb) / <alpha-value>)',
            400: 'rgb(var(--color-emotion-anger-400-rgb) / <alpha-value>)',
            600: 'rgb(var(--color-emotion-anger-600-rgb) / <alpha-value>)',
          },
        },
        status: {
          success: 'rgb(var(--color-status-success-rgb) / <alpha-value>)',
          warning: 'rgb(var(--color-status-warning-rgb) / <alpha-value>)',
          error: 'rgb(var(--color-status-error-rgb) / <alpha-value>)',
          info: 'rgb(var(--color-status-info-rgb) / <alpha-value>)',
        },
        glass: {
          surface: 'var(--color-glass-surface)',
          border: 'var(--color-glass-border)',
        },
      },

      /* ========================================
       * 타이포그래피
       * ======================================== */
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        xs: ['var(--text-xs)', { lineHeight: 'var(--leading-normal)' }],
        sm: ['var(--text-sm)', { lineHeight: 'var(--leading-normal)' }],
        base: ['var(--text-base)', { lineHeight: 'var(--leading-normal)' }],
        lg: ['var(--text-lg)', { lineHeight: 'var(--leading-snug)' }],
        xl: ['var(--text-xl)', { lineHeight: 'var(--leading-snug)' }],
        '2xl': ['var(--text-2xl)', { lineHeight: 'var(--leading-tight)' }],
        '3xl': ['var(--text-3xl)', { lineHeight: 'var(--leading-tight)' }],
        '4xl': ['var(--text-4xl)', { lineHeight: 'var(--leading-none)' }],
      },

      /* ========================================
       * 간격 시스템
       * ======================================== */
      spacing: {
        'px': 'var(--spacing-px)',
        '0.5': 'var(--spacing-0-5)',
        '1': 'var(--spacing-1)',
        '2': 'var(--spacing-2)',
        '3': 'var(--spacing-3)',
        '4': 'var(--spacing-4)',
        '5': 'var(--spacing-5)',
        '6': 'var(--spacing-6)',
        '8': 'var(--spacing-8)',
        '10': 'var(--spacing-10)',
        '12': 'var(--spacing-12)',
        '16': 'var(--spacing-16)',
        '20': 'var(--spacing-20)',
        '24': 'var(--spacing-24)',
        // 시맨틱 별칭
        'xs': 'var(--spacing-xs)',
        'sm': 'var(--spacing-sm)',
        'md': 'var(--spacing-md)',
        'lg': 'var(--spacing-lg)',
        'xl': 'var(--spacing-xl)',
        'xxl': 'var(--spacing-xxl)',
        // 레이아웃
        'header': 'var(--header-height)',
        'dock': 'var(--dock-height)',
        'tab-bar': 'var(--tab-bar-height)',
        'touch-target': '2.75rem',
        // Safe Area
        'safe-top': 'var(--safe-top)',
        'safe-bottom': 'var(--safe-bottom)',
        'safe-left': 'var(--safe-left)',
        'safe-right': 'var(--safe-right)',
      },

      /* ========================================
       * Z-Index 레이어 시스템
       * ======================================== */
      zIndex: {
        // 기본 레이어
        'below': 'var(--z-below)',
        'base': 'var(--z-base)',
        'above': 'var(--z-above)',
        
        // 배경 레이어
        'bg-base': 'var(--z-bg-base)',
        'bg-pattern': 'var(--z-bg-pattern)',
        'bg-gradient': 'var(--z-bg-gradient)',
        'bg-particles': 'var(--z-bg-particles)',
        
        // 컨텐츠 레이어
        'content-base': 'var(--z-content-base)',
        
        // 탭별 레이어
        'tab-chat': 'var(--z-tab-chat)',
        'tab-chat-content': 'var(--z-tab-chat-content)',
        'tab-chat-input': 'var(--z-tab-chat-input)',
        
        'tab-journal': 'var(--z-tab-journal)',
        'tab-journal-content': 'var(--z-tab-journal-content)',
        'tab-journal-fab': 'var(--z-tab-journal-fab)',
        
        'tab-reports': 'var(--z-tab-reports)',
        'tab-reports-content': 'var(--z-tab-reports-content)',
        'tab-reports-chart': 'var(--z-tab-reports-chart)',
        
        'tab-content': 'var(--z-tab-content)',
        'tab-content-grid': 'var(--z-tab-content-grid)',
        'tab-content-detail': 'var(--z-tab-content-detail)',
        
        'tab-profile': 'var(--z-tab-profile)',
        'tab-profile-content': 'var(--z-tab-profile-content)',
        'tab-profile-settings': 'var(--z-tab-profile-settings)',
        
        // 네비게이션 레이어
        'nav': 'var(--z-nav)',
        'header': 'var(--z-header)',
        'dock': 'var(--z-dock)',
        'fab': 'var(--z-fab)',
        'sticky': 'var(--z-sticky)',
        
        // 오버레이 레이어
        'overlay-base': 'var(--z-overlay-base)',
        'safety': 'var(--z-safety)',
        'loading': 'var(--z-loading)',
        'toast': 'var(--z-toast)',
        
        // 모달 레이어
        'dropdown': 'var(--z-dropdown)',
        'popover': 'var(--z-popover)',
        'tooltip': 'var(--z-tooltip)',
        'modal-backdrop': 'var(--z-modal-backdrop)',
        'modal': 'var(--z-modal)',
        'modal-content': 'var(--z-modal-content)',
        'sheet': 'var(--z-sheet)',
        'sheet-content': 'var(--z-sheet-content)',
        
        // 크리티컬 레이어
        'consent-backdrop': 'var(--z-consent-backdrop)',
        'consent-modal': 'var(--z-consent-modal)',
        'emergency': 'var(--z-emergency)',
        'max': 'var(--z-max)',
      },

      /* ========================================
       * Border Radius
       * ======================================== */
      borderRadius: {
        'none': 'var(--radius-none)',
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        'full': 'var(--radius-full)',
        // 컴포넌트별
        'button': 'var(--radius-button)',
        'card': 'var(--radius-card)',
        'modal': 'var(--radius-modal)',
        'input': 'var(--radius-input)',
        'chip': 'var(--radius-chip)',
      },

      /* ========================================
       * 그림자
       * ======================================== */
      boxShadow: {
        'xs': 'var(--shadow-xs)',
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'brand': 'var(--shadow-brand)',
        'brand-md': 'var(--shadow-brand-md)',
        'brand-lg': 'var(--shadow-brand-lg)',
        'glass': 'var(--shadow-glass)',
        'glass-hover': 'var(--shadow-glass-hover)',
        'glow': 'var(--shadow-glow)',
        'glow-white': 'var(--shadow-glow-white)',
        'floating': 'var(--shadow-floating)',
      },

      /* ========================================
       * 트랜지션
       * ======================================== */
      transitionDuration: {
        'instant': 'var(--duration-instant)',
        'fast': 'var(--duration-fast)',
        'normal': 'var(--duration-normal)',
        'slow': 'var(--duration-slow)',
        'slower': 'var(--duration-slower)',
        'slowest': 'var(--duration-slowest)',
      },
      transitionTimingFunction: {
        'smooth': 'var(--ease-smooth)',
        'bounce': 'var(--ease-bounce)',
        'spring': 'var(--ease-spring)',
      },

      /* ========================================
       * 높이 (Viewport 기반)
       * ======================================== */
      height: {
        'screen-safe': 'var(--vh-safe)',
        'screen-dynamic': 'var(--vh-dynamic)',
        'content': 'var(--vh-content)',
        'modal': 'var(--vh-modal)',
        'sheet': 'var(--vh-sheet)',
      },
      minHeight: {
        'screen-safe': 'var(--vh-safe)',
        'content': 'var(--vh-content)',
      },
      maxHeight: {
        'modal': 'var(--vh-modal)',
        'sheet': 'var(--vh-sheet)',
      },

      /* ========================================
       * Blur 효과
       * ======================================== */
      blur: {
        'bg-lg': 'var(--bg-blur-lg)',
        'bg-xl': 'var(--bg-blur-xl)',
      },

      /* ========================================
       * Width 확장
       * ======================================== */
      width: {
        'bg-overflow': 'var(--bg-overflow-width)',
        'bg-blob': 'var(--bg-blob-size)',
      },

      /* ========================================
       * Height 확장
       * ======================================== */
      height: {
        'bg-overflow': 'var(--bg-overflow-height)',
      },

      /* ========================================
       * Max Width 확장
       * ======================================== */
      maxWidth: {
        'chat-bubble': 'var(--chat-bubble-max-width)',
        'chat-bubble-sm': 'var(--chat-bubble-max-width-sm)',
        'button': 'var(--button-max-width)',
      },

      /* ========================================
       * Min Width 확장
       * ======================================== */
      minWidth: {
        'progress': 'var(--progress-indicator-width)',
      },

      /* ========================================
       * Min Height 확장
       * ======================================== */
      minHeight: {
        'card': 'var(--card-min-height)',
      },

      /* ========================================
       * 애니메이션
       * ======================================== */
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blob': 'blob 7s infinite',
        'fade-in': 'fadeIn var(--duration-normal) var(--ease-out)',
        'fade-out': 'fadeOut var(--duration-normal) var(--ease-out)',
        'slide-up': 'slideUp var(--duration-normal) var(--ease-smooth)',
        'slide-down': 'slideDown var(--duration-normal) var(--ease-smooth)',
        'scale-in': 'scaleIn var(--duration-fast) var(--ease-spring)',
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
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        fadeOut: {
          'from': { opacity: '1' },
          'to': { opacity: '0' },
        },
        slideUp: {
          'from': { transform: 'translateY(100%)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          'from': { transform: 'translateY(-100%)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          'from': { transform: 'scale(0.95)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        },
      },

      /* ========================================
       * 브레이크포인트
       * ======================================== */
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },

      /* ========================================
       * 그리드
       * ======================================== */
      gridTemplateColumns: {
        'auto-fit': 'repeat(auto-fit, minmax(250px, 1fr))',
        'auto-fill': 'repeat(auto-fill, minmax(200px, 1fr))',
      },
    },
  },
  plugins: [],
}
