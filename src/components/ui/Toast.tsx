/**
 * Toast 알림 시스템
 * WCAG 2.2 AA 준수 - aria-live, aria-atomic 지원
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

const toastStyles: Record<ToastType, string> = {
  success: 'bg-status-success text-white',
  error: 'bg-status-error text-white',
  info: 'bg-status-info text-white',
  warning: 'bg-status-warning text-white',
};

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={20} aria-hidden="true" />,
  error: <AlertCircle size={20} aria-hidden="true" />,
  info: <Info size={20} aria-hidden="true" />,
  warning: <AlertTriangle size={20} aria-hidden="true" />,
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((
    message: string,
    type: ToastType = 'info',
    duration = 3000
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {/* Toast 컨테이너 - Safe Area 고려 */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-0 left-0 right-0 z-toast
                   flex flex-col items-center gap-2
                   pb-safe-bottom mb-20 px-4 pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              role="status"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`
                px-4 py-3 rounded-xl shadow-xl backdrop-blur-xl
                flex items-center gap-3 min-w-[200px] max-w-[90vw]
                pointer-events-auto
                ${toastStyles[toast.type]}
              `}
            >
              {toastIcons[toast.type]}
              <span className="text-sm font-medium flex-1">{toast.message}</span>
              <button
                onClick={() => hideToast(toast.id)}
                aria-label="알림 닫기"
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
