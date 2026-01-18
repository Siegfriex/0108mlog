import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppRouter } from './src/router/Router';
import './src/index.css';

/**
 * 개발 환경에서 axe-core 접근성 검사 활성화
 * 설치 필요: npm install -D @axe-core/react
 */
if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  }).catch(() => {
    // axe-core가 설치되지 않은 경우 무시
    console.log('[A11Y] axe-core not installed. Run: npm install -D @axe-core/react');
  });
}

/**
 * 전역 에러 핸들러 (FE-C3 해결)
 * ErrorBoundary 밖의 에러도 캐치하여 localStorage에 로깅
 */
window.onerror = (message, source, lineno, colno, error) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: String(message),
    source: source || 'unknown',
    line: lineno || 0,
    column: colno || 0,
    stack: error?.stack || 'No stack trace',
    url: window.location.href,
    userAgent: navigator.userAgent,
  };
  
  // localStorage에 로깅 (최근 50개만 유지)
  try {
    const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
    logs.push(errorLog);
    localStorage.setItem('error_logs', JSON.stringify(logs.slice(-50)));
  } catch (storageError) {
    console.error('Failed to save error log to localStorage:', storageError);
  }
  
  console.error('Global error caught:', errorLog);
  return false; // 기본 에러 처리 계속 진행
};

/**
 * 처리되지 않은 Promise rejection 핸들러
 */
window.onunhandledrejection = (event) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: event.reason ? String(event.reason) : 'Unknown rejection',
    type: 'unhandledrejection',
    url: window.location.href,
  };
  
  try {
    const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
    logs.push(errorLog);
    localStorage.setItem('error_logs', JSON.stringify(logs.slice(-50)));
  } catch (storageError) {
    console.error('Failed to save rejection log:', storageError);
  }
  
  console.error('Unhandled promise rejection:', errorLog);
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);