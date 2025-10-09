import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPopupProps {
  show: boolean;
  onComplete?: () => void;
  duration?: number;
}

const ConfettiPopup: React.FC<ConfettiPopupProps> = ({
  show,
  onComplete,
  duration = 3000,
}) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; rotation: number }>>([]);

  useEffect(() => {
    if (show) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'][Math.floor(Math.random() * 6)],
        rotation: Math.random() * 360,
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: particle.color,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              initial={{
                scale: 0,
                rotate: 0,
                y: 0,
              }}
              animate={{
                scale: [0, 1, 0],
                rotate: particle.rotation,
                y: [0, -100, 100],
                x: [0, Math.random() * 200 - 100],
              }}
              transition={{
                duration: duration / 1000,
                ease: 'easeOut',
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfettiPopup;
