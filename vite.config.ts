import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // GEMINI_API_KEY 관련 정의 제거 (더 이상 필요 없음)
        // Firebase Functions를 통해 간접 호출하므로 클라이언트에서 API 키가 필요 없음
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          'types': path.resolve(__dirname, 'types.ts'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              // React 및 React DOM
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              // Framer Motion
              'framer-motion': ['framer-motion'],
              // Firebase SDK
              'firebase': ['firebase/app', 'firebase/firestore', 'firebase/functions', 'firebase/storage'],
              // Recharts
              'recharts': ['recharts'],
              // Lucide Icons (필요한 경우)
              'lucide-react': ['lucide-react'],
            },
          },
        },
        chunkSizeWarningLimit: 1000, // 1MB 경고 임계값
      },
    };
});
