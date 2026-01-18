import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Phone, Wind, Anchor, X, ArrowLeft, HeartPulse } from 'lucide-react';
import { Button, Portal } from '../ui';

interface SafetyLayerProps {
  onClose: () => void;
}

type SafetyView = 'main' | 'crisis' | 'tools';

export const SafetyLayer: React.FC<SafetyLayerProps> = ({ onClose }) => {
  const [view, setView] = useState<SafetyView>('main');

  const renderContent = () => {
    switch (view) {
      case 'crisis':
        return (
          <div className="space-y-6">
             <div className="flex items-center gap-2 mb-2">
                <button
                    onClick={() => setView('main')}
                    aria-label="메인 화면으로 돌아가기"
                    className="p-2 -ml-2 hover:bg-red-50 rounded-full text-red-600 transition-colors"
                >
                    <ArrowLeft size={20} aria-hidden="true" />
                </button>
                <h3 className="text-lg font-bold text-slate-800">Crisis Support</h3>
             </div>
             
             <div className="space-y-4">
                <a
                    href="tel:1577-0199"
                    aria-label="정신건강 위기 상담 핫라인 1577-0199로 전화하기"
                    className="block w-full p-6 bg-red-50 border border-red-100 rounded-2xl hover:bg-red-100 transition-colors group"
                >
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                            <Phone size={20} aria-hidden="true" />
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-red-900">Mental Health Crisis Hotline</h4>
                            <p className="text-red-600/80 text-xs">24/7 Professional Counseling</p>
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-red-600">1577-0199</div>
                </a>

                <a
                    href="tel:1393"
                    aria-label="자살예방상담전화 1393으로 전화하기"
                    className="block w-full p-6 bg-red-50 border border-red-100 rounded-2xl hover:bg-red-100 transition-colors group"
                >
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                            <Phone size={20} aria-hidden="true" />
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-red-900">Suicide Prevention Hotline</h4>
                            <p className="text-red-600/80 text-xs">You are not alone.</p>
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-red-600">1393</div>
                </a>

                <a
                    href="tel:119"
                    aria-label="긴급 상황 119 신고하기"
                    className="block w-full p-6 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-colors shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <ShieldAlert size={20} aria-hidden="true" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold">Emergency</h4>
                                <p className="text-white/60 text-xs">Immediate Danger</p>
                            </div>
                        </div>
                        <div className="text-3xl font-bold">119</div>
                    </div>
                </a>
             </div>
          </div>
        );
      
      case 'tools':
        return (
          <div className="space-y-6">
             <div className="flex items-center gap-2 mb-2">
                <button
                    onClick={() => setView('main')}
                    aria-label="메인 화면으로 돌아가기"
                    className="p-2 -ml-2 hover:bg-indigo-50 rounded-full text-indigo-600 transition-colors"
                >
                    <ArrowLeft size={20} aria-hidden="true" />
                </button>
                <h3 className="text-lg font-bold text-slate-800">Coping Tools</h3>
             </div>

             <div className="grid gap-4">
                <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl hover:bg-indigo-50 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-white group-hover:shadow-sm transition-all">
                        <Wind size={24} />
                    </div>
                    <h4 className="font-bold text-indigo-900 mb-1">Box Breathing</h4>
                    <p className="text-indigo-600/80 text-xs leading-relaxed">
                        Inhale 4s, Hold 4s, Exhale 4s, Hold 4s. Helps regulate autonomic nervous system.
                    </p>
                </div>

                <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl hover:bg-emerald-50 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-white group-hover:shadow-sm transition-all">
                        <Anchor size={24} />
                    </div>
                    <h4 className="font-bold text-emerald-900 mb-1">5-4-3-2-1 Grounding</h4>
                    <p className="text-emerald-600/80 text-xs leading-relaxed">
                        Identify 5 things you see, 4 feel, 3 hear, 2 smell, 1 taste. Anchors you in the present.
                    </p>
                </div>
             </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-4">
             <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <ShieldAlert size={40} className="text-red-500" strokeWidth={1.5} aria-hidden="true" />
             </div>
             <h2 id="safety-title" className="text-2xl font-bold text-slate-800 mb-2">Are you feeling safe?</h2>
             <p id="safety-desc" className="text-slate-500 mb-8 max-w-xs mx-auto leading-relaxed text-sm">
                If you are in immediate danger or feeling overwhelmed, please reach out.
             </p>

             <div className="space-y-3">
                <Button 
                    onClick={() => setView('crisis')}
                    className="w-full bg-red-500 hover:bg-red-600 text-white shadow-red-200 !py-4"
                >
                    I need help right now
                </Button>
                <Button 
                    onClick={() => setView('tools')}
                    variant="secondary"
                    className="w-full border-slate-200 !py-4"
                >
                    <HeartPulse size={18} className="text-indigo-500" />
                    I'm okay, just stressed
                </Button>
             </div>
          </div>
        );
    }
  };

  return (
    <Portal>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-safety bg-slate-900/40 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-6"
      >
        <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="safety-title"
            aria-describedby="safety-desc"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-sm bg-white rounded-t-modal sm:rounded-modal shadow-2xl overflow-hidden flex flex-col max-h-modal"
        >
            <div className="p-6 flex-1 overflow-y-auto scrollbar-hide relative">
                {view === 'main' && (
                    <button
                        onClick={onClose}
                        aria-label="안전 레이어 닫기"
                        className="absolute top-6 right-6 p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                )}
                
                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
            
            {view !== 'main' && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <button onClick={onClose} className="w-full py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
                        Close Safety Layer
                    </button>
                </div>
            )}
        </motion.div>
      </motion.div>
    </Portal>
  );
};
