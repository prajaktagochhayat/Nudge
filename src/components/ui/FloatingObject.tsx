import type { ReactNode } from 'react';
import { motion, useTransform } from 'framer-motion';
import type { MotionValue } from 'framer-motion';

export interface FloatingObjectProps {
  obj: {
    id: string;
    content: ReactNode;
    xOffset: number;
    yOffset: number;
    baseLeft: string;
    baseTop: string;
    animation: any;
    duration: number;
  };
  springX: MotionValue<number>;
  springY: MotionValue<number>;
}

export default function FloatingObject({ obj, springX, springY }: FloatingObjectProps) {
  const x = useTransform(springX, [-0.5, 0.5], [-50 * obj.xOffset, 50 * obj.xOffset]);
  const y = useTransform(springY, [-0.5, 0.5], [-50 * obj.yOffset, 50 * obj.yOffset]);

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: obj.baseLeft,
        top: obj.baseTop,
        x,
        y,
        zIndex: 10
      }}
      animate={obj.animation}
      transition={{
        repeat: Infinity,
        duration: obj.duration,
        ease: 'easeInOut'
      }}
      className="hidden lg:flex pointer-events-none select-none gpu-accelerated"
    >
      {obj.content}
    </motion.div>
  );
}
