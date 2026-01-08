import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      className={`
        relative overflow-hidden
        bg-glass-surface backdrop-blur-xl
        border border-glass-border
        shadow-glass rounded-[32px] p-8
        transition-all duration-300
        ${className}
      `}
      onClick={onClick}
    >
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/30 rounded-full blur-3xl pointer-events-none opacity-50" />
      {children}
    </motion.div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-peace-400 to-peace-600 text-white shadow-lg shadow-peace-400/30',
    secondary: 'bg-white/60 text-slate-700 border border-white/40 hover:bg-white/80',
    ghost: 'bg-transparent text-slate-600 hover:bg-white/20'
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`
        px-6 py-3 rounded-2xl font-semibold
        flex items-center justify-center gap-2
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </motion.button>
  );
};

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="relative">
      <motion.div
        className="w-12 h-12 border-4 border-peace-100 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-peace-400 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  </div>
);

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  // Sitemap: Chat, Journal, Reports, Content, Profile
  const tabs = [
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'journal', label: 'Journal', icon: '📖' },
    { id: 'reports', label: 'Reports', icon: '📊' },
    { id: 'content', label: 'Content', icon: '🌿' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[95vw]">
      <div className="
        flex items-center gap-1 sm:gap-2 p-2
        bg-white/80 backdrop-blur-2xl
        border border-white/50
        shadow-2xl shadow-indigo-900/10
        rounded-full
      ">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative px-3 sm:px-5 py-3 rounded-full
              transition-all duration-300
              flex items-center gap-2
              ${activeTab === tab.id ? 'text-peace-600 font-bold' : 'text-slate-400'}
            `}
          >
            <span className="text-lg sm:text-xl">{tab.icon}</span>
            {activeTab === tab.id && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                className="text-xs sm:text-sm whitespace-nowrap hidden sm:inline"
              >
                {tab.label}
              </motion.span>
            )}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white shadow-sm rounded-full -z-10 border border-slate-100"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};