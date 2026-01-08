import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2, MessageCircle, Book, BarChart2, Layers, User } from 'lucide-react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.01 : 1 }}
      className={`
        relative overflow-hidden
        bg-white/70 backdrop-blur-2xl
        border border-white/50
        shadow-glass rounded-[32px] p-8
        transition-all duration-300
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const variants = {
    primary: 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 border-none hover:bg-slate-800',
    secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50',
    ghost: 'bg-transparent text-slate-500 hover:bg-slate-100'
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={`
        px-6 py-3.5 rounded-2xl font-semibold text-sm
        flex items-center justify-center gap-2
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  );
};

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="relative">
      <motion.div
        className="w-10 h-10 border-4 border-slate-100 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0 w-10 h-10 border-4 border-transparent border-t-slate-800 rounded-full"
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
  const tabs = [
    { id: 'chat', label: 'Chat', icon: <MessageCircle size={22} strokeWidth={2.5} /> },
    { id: 'journal', label: 'Log', icon: <Book size={22} strokeWidth={2.5} /> },
    { id: 'reports', label: 'Stats', icon: <BarChart2 size={22} strokeWidth={2.5} /> },
    { id: 'content', label: 'Feed', icon: <Layers size={22} strokeWidth={2.5} /> },
    { id: 'profile', label: 'Me', icon: <User size={22} strokeWidth={2.5} /> },
  ];

  return (
    <nav className="
      flex items-center justify-between px-2 py-2
      bg-white/80 backdrop-blur-2xl
      border border-white/50
      rounded-[32px] shadow-floating
      w-full
    ">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative group flex-1 flex flex-col items-center justify-center py-3 min-h-[64px]"
          >
            <div className={`
              flex items-center justify-center transition-all duration-300
              ${isActive 
                ? 'text-slate-900 scale-100' 
                : 'text-slate-400 hover:text-slate-600'
              }
            `}>
              {tab.icon}
            </div>
            
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute -bottom-1 w-1 h-1 bg-slate-900 rounded-full"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};