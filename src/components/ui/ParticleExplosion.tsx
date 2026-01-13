import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 파티클 타입 정의
 */
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
}

/**
 * ParticleExplosion 컴포넌트 Props
 */
export interface ParticleExplosionProps {
  /**
   * 파티클 폭죽이 발생할 위치 (x, y 좌표)
   */
  position?: { x: number; y: number };
  /**
   * 파티클 색상 (기본: 브랜드 색상)
   */
  colors?: string[];
  /**
   * 파티클 개수
   */
  particleCount?: number;
  /**
   * 파티클 속도
   */
  speed?: number;
  /**
   * 자동 트리거 여부
   */
  autoTrigger?: boolean;
  /**
   * 트리거 간격 (ms)
   */
  triggerInterval?: number;
}

/**
 * ParticleExplosion 컴포넌트
 * 
 * 파티클 폭죽 효과를 제공하는 컴포넌트
 * 성공, 완료, 축하 등의 상황에서 사용
 */
export const ParticleExplosion: React.FC<ParticleExplosionProps> = ({
  position = { x: 50, y: 50 },
  colors = ['#14b8a6', '#0d9488', '#2dd4bf', '#5eead4'],
  particleCount = 30,
  speed = 5,
  autoTrigger = false,
  triggerInterval = 3000,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isExploding, setIsExploding] = useState(false);

  /**
   * 파티클 생성 함수
   */
  const createParticles = () => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const velocity = speed * (0.5 + Math.random() * 0.5);
      
      newParticles.push({
        id: Date.now() + i,
        x: position.x,
        y: position.y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
      });
    }
    setParticles(newParticles);
    setIsExploding(true);
  };

  /**
   * 파티클 업데이트 (requestAnimationFrame으로 최적화)
   */
  useEffect(() => {
    if (!isExploding || particles.length === 0) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      
      // 약 60fps로 제한 (16ms)
      if (deltaTime >= 16) {
        lastTime = currentTime;
        
        setParticles((prev) => {
          const updated = prev
            .map((p) => ({
              ...p,
              x: p.x + p.vx,
              y: p.y + p.vy,
              vy: p.vy + 0.2, // 중력 효과
              life: p.life - 0.02,
            }))
            .filter((p) => p.life > 0);

          if (updated.length === 0) {
            setIsExploding(false);
          }

          return updated;
        });
      }

      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isExploding, particles.length]);

  /**
   * 자동 트리거
   */
  useEffect(() => {
    if (autoTrigger) {
      createParticles();
      const interval = setInterval(createParticles, triggerInterval);
      return () => clearInterval(interval);
    }
  }, [autoTrigger, triggerInterval]);

  /**
   * 외부에서 트리거할 수 있는 함수
   * useParticleExplosion 훅을 통해 사용
   */

  return (
    <div className="fixed inset-0 pointer-events-none z-popover">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            initial={{
              x: position.x,
              y: position.y,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              x: particle.x,
              y: particle.y,
              scale: 0,
              opacity: particle.life,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1,
              ease: 'easeOut',
            }}
            style={{
              width: particle.size,
              height: particle.size,
              background: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * 파티클 폭죽을 트리거하는 훅
 */
export const useParticleExplosion = () => {
  const [trigger, setTrigger] = useState(0);

  const explode = () => {
    setTrigger((prev) => prev + 1);
  };

  return { explode, trigger };
};
