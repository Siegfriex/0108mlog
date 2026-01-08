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
      }
    };
});
