import React from 'react';
import { motion } from 'framer-motion';

/**
 * FloatingOrbs 컴포넌트
 * 
 * 배경에 떠다니는 그라데이션 오브 효과를 제공하는 컴포넌트
 * Ethereal Crystal 디자인 시스템의 배경 요소
 */
export const FloatingOrbs: React.FC = () => {
  return (
    <>
      <motion.div 
        className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-brand-primary/20 rounded-full blur-[100px] pointer-events-none"
        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-[-10%] right-[-20%] w-[70vw] h-[70vw] max-w-[500px] max-h-[500px] bg-brand-secondary/20 rounded-full blur-[80px] pointer-events-none"
        animate={{ y: [0, 20, 0], scale: [1, 0.95, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
};
