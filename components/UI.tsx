
import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2, MessageCircle, Book, BarChart2, Layers, User } from 'lucide-react';

export const NoiseOverlay = () => (
  <div 
    className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] mix-blend-overlay"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }}
  />
);

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  intensity?: 'low' | 'medium' | 'high';
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, intensity = 'medium' }) => {
  const bgStyle = intensity === 'low' ? 'bg-white/40' : intensity === 'high' ? 'bg-white/95' : 'bg-white/70';
  const blurStyle = intensity === 'low' ? 'backdrop-blur-md' : intensity === 'high' ? 'backdrop-blur-3xl' : 'backdrop-blur-xl';

  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.005 : 1, y: onClick ? -2 : 0 }}
      whileTap={{ scale: onClick ? 0.99 : 1 }}
      className={`
        relative overflow-hidden
        ${bgStyle} ${blurStyle}
        border border-white/60
        shadow-[0_8px_32px_rgba(42,142,158,0.05)]
        rounded-[32px] p-8
        transition-all duration-300 ease-out
        group
        ${className}
      `}
      onClick={onClick}
    >
      {/* Crisp Highlight for Vector feel */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/80 opacity-50" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
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
    // Primary: Solid Brand Teal with soft shadow
    primary: 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 border border-transparent hover:bg-brand-dark hover:scale-[1.02] active:scale-[0.98]',
    // Secondary: Outline / Stroke Brand Teal (Matches the "Counselor Intro" button style from benchmark)
    secondary: 'bg-transparent text-brand-primary border border-brand-primary hover:bg-brand-light',
    // Ghost: Subtle
    ghost: 'bg-transparent text-slate-500 hover:bg-brand-light/50 hover:text-brand-primary',
    // Glass: White glass with Teal border hint
    glass: 'bg-white/40 backdrop-blur-xl border border-white/60 text-slate-800 hover:bg-white/60 shadow-glass hover:border-brand-primary/30'
  };

  return (
    <motion.button
      className={`
        px-8 py-4 rounded-full font-bold text-sm tracking-wide
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
    <div className="w-10 h-10 border-4 border-slate-200 rounded-full border-t-brand-primary animate-spin" />
  </div>
);

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  mode?: 'day' | 'night';
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange, mode = 'day' }) => {
  const allTabs = [
    { id: 'chat', label: 'Chat', icon: <MessageCircle size={22} strokeWidth={2.5} /> },
    { id: 'journal', label: 'Log', icon: <Book size={22} strokeWidth={2.5} /> },
    { id: 'reports', label: 'Stats', icon: <BarChart2 size={22} strokeWidth={2.5} /> },
    { id: 'content', label: 'Feed', icon: <Layers size={22} strokeWidth={2.5} /> },
    { id: 'profile', label: 'Me', icon: <User size={22} strokeWidth={2.5} /> },
  ];

  return (
    <nav className={`
      flex items-center justify-between px-6 py-3 gap-2
      backdrop-blur-2xl border
      rounded-[32px] shadow-2xl
      w-auto min-w-[320px] max-w-full transition-colors duration-500
      ${mode === 'day' 
        ? 'bg-white/80 border-white/60 shadow-brand-primary/10 ring-1 ring-white/50' 
        : 'bg-slate-900/80 border-white/10 shadow-black/50 ring-1 ring-white/10'
      }
    `}>
      {allTabs.map(tab => {
        const isActive = activeTab === tab.id;
        
        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            whileTap={{ scale: 0.9 }}
            className={`
              relative group flex flex-col items-center justify-center
              w-10 h-10 rounded-xl
              transition-all duration-300
              ${isActive 
                ? mode === 'day' ? 'text-brand-primary bg-brand-light shadow-sm' : 'text-brand-secondary bg-white/20'
                : mode === 'day' ? 'text-slate-400 hover:text-brand-dark' : 'text-slate-500 hover:text-slate-300'
              }
            `}
          >
            {tab.icon}
            
            {/* Active Indicator Dot */}
            {isActive && (
                <motion.div 
                    layoutId="activeTabDot"
                    className={`absolute -bottom-2 w-1 h-1 rounded-full ${mode === 'day' ? 'bg-brand-primary' : 'bg-brand-secondary'}`}
                />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
};
