/**
 * ErrorRecovery 컴포넌트
 * 에러 발생 시 재시도 및 복구 UI 제공
 * WCAG 2.2 AA 준수 - role="alert", aria-live
 */

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, X, WifiOff } from 'lucide-react';
import { Button } from './Button';

interface ErrorRecoveryProps {
  error: Error;
  onRetry: () => void;
  onDismiss?: () => void;
  title?: string;
  description?: string;
}

/**
 * 네트워크 오류 감지
 */
function isNetworkError(error: Error): boolean {
  return (
    error instanceof TypeError ||
    error.message.toLowerCase().includes('network') ||
    error.message.toLowerCase().includes('failed to fetch') ||
    error.message.includes('ERR_CONNECTION_REFUSED') ||
    error.message.includes('ECONNREFUSED') ||
    error.message.toLowerCase().includes('timeout') ||
    error.name === 'NetworkError'
  );
}

export const ErrorRecovery: React.FC<ErrorRecoveryProps> = ({
  error,
  onRetry,
  onDismiss,
  title,
  description,
}) => {
  const isNetwork = isNetworkError(error);

  const defaultTitle = isNetwork ? '연결 오류' : '문제가 발생했습니다';
  const defaultDescription = isNetwork
    ? '인터넷 연결을 확인해주세요.'
    : '잠시 후 다시 시도해주세요.';

  const Icon = isNetwork ? WifiOff : AlertTriangle;

  return (
    <motion.div
      role="alert"
      aria-live="assertive"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 bg-status-error/10 border border-status-error/30 rounded-xl"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full bg-status-error/20 flex items-center justify-center">
          <Icon size={20} className="text-status-error" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-status-error">
            {title || defaultTitle}
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            {description || defaultDescription}
          </p>
          {import.meta.env.DEV && (
            <details className="mt-2">
              <summary className="text-xs text-text-muted cursor-pointer hover:text-text-secondary">
                오류 상세
              </summary>
              <pre className="text-xs text-text-muted mt-1 p-2 bg-black/5 rounded overflow-x-auto">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="오류 알림 닫기"
            className="shrink-0 p-1 text-text-muted hover:text-text-secondary transition-colors rounded-full hover:bg-black/5"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="flex gap-2 mt-4">
        <Button
          onClick={onRetry}
          variant="primary"
          className="flex-1"
        >
          <RefreshCw size={16} className="mr-2" aria-hidden="true" />
          다시 시도
        </Button>
        {onDismiss && (
          <Button onClick={onDismiss} variant="ghost" className="px-4">
            닫기
          </Button>
        )}
      </div>
    </motion.div>
  );
};
