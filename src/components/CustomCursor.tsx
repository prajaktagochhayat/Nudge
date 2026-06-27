import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  color: string;
  scale: number;
}

export default function CustomCursor() {
  const [cursorType, setCursorType] = useState<'default' | 'hover' | 'drag'>('default');
  const [hoverLabel, setHoverLabel] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  
  const mouseCoords = useRef({ x: 0, y: 0 });
  const dotCoords = useRef({ x: 0, y: 0 });
  const ringCoords = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 1024px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isMobile || prefersReducedMotion) return;

    document.body.classList.add('custom-cursor-enabled');
    setIsVisible(true);

    const colors = ['#F9A8D4', '#6EE7B7', '#F6D365', '#67E8F9', '#A78BFA'];

    const onMouseMove = (e: MouseEvent) => {
      mouseCoords.current = { x: e.clientX, y: e.clientY };
      
      // Spawn a trailing sparkle
      if (Math.random() < 0.25) {
        const newSparkle = {
          id: Date.now() + Math.random(),
          x: e.clientX + (Math.random() - 0.5) * 8,
          y: e.clientY + (Math.random() - 0.5) * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          scale: Math.random() * 0.8 + 0.4
        };
        setSparkles(prev => [...prev.slice(-12), newSparkle]); // Cap at 12 active sparkles
      }
    };

    const onMouseEnter = () => setIsVisible(true);
    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseleave', onMouseLeave);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      
      const clickable = target.closest('a, button, [role="button"], input[type="submit"], input[type="checkbox"], .cursor-pointer');
      const draggable = target.closest('.draggable-card, [data-draggable]');
      
      if (draggable) {
        setCursorType('drag');
        setHoverLabel('MOVE');
      } else if (clickable) {
        setCursorType('hover');
        const label = (clickable as HTMLElement).getAttribute('data-cursor-label');
        setHoverLabel(label || 'CLICK');
      } else {
        setCursorType('default');
        setHoverLabel('');
      }
    };

    document.addEventListener('mouseover', handleMouseOver);

    let frameId: number;
    const updatePosition = () => {
      const tx = mouseCoords.current.x;
      const ty = mouseCoords.current.y;
      
      dotCoords.current.x += (tx - dotCoords.current.x) * 0.3;
      dotCoords.current.y += (ty - dotCoords.current.y) * 0.3;

      ringCoords.current.x += (tx - ringCoords.current.x) * 0.12;
      ringCoords.current.y += (ty - ringCoords.current.y) * 0.12;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotCoords.current.x}px, ${dotCoords.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringCoords.current.x}px, ${ringCoords.current.y}px, 0) translate(-50%, -50%)`;
      }

      frameId = requestAnimationFrame(updatePosition);
    };

    frameId = requestAnimationFrame(updatePosition);

    return () => {
      document.body.classList.remove('custom-cursor-enabled');
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(frameId);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Sparkle Particles Trail */}
      <AnimatePresence>
        {sparkles.map(sp => (
          <motion.div
            key={sp.id}
            initial={{ opacity: 0.9, scale: sp.scale }}
            animate={{ opacity: 0, y: sp.y - 12, scale: 0.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              left: sp.x,
              top: sp.y,
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: sp.color,
              pointerEvents: 'none',
              zIndex: 9999,
              boxShadow: `0 0 5px ${sp.color}, 0 0 10px ${sp.color}`
            }}
          />
        ))}
      </AnimatePresence>

      {/* Inner Dot: soft violet */}
      <div 
        ref={dotRef}
        className="fixed top-0 left-0 w-2.5 h-2.5 rounded-full pointer-events-none z-[10000]"
        style={{
          backgroundColor: '#8B6CFF',
          width: cursorType === 'hover' ? '6px' : cursorType === 'drag' ? '5px' : '10px',
          height: cursorType === 'hover' ? '6px' : cursorType === 'drag' ? '5px' : '10px',
          boxShadow: '0 0 6px rgba(139, 108, 255, 0.6)',
          transition: 'width 0.2s, height 0.2s'
        }}
      />
      
      {/* Outer Ring: soft translucent pink + mint glow */}
      <div 
        ref={ringRef}
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9998]"
        style={{
          width: cursorType === 'hover' ? '52px' : cursorType === 'drag' ? '42px' : '30px',
          height: cursorType === 'hover' ? '52px' : cursorType === 'drag' ? '42px' : '30px',
          background: 'transparent',
          border: '1.5px solid transparent',
          backgroundImage: 'linear-gradient(#FFF, #FFF), linear-gradient(135deg, #F9A8D4, #6EE7B7)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'content-box, border-box',
          boxShadow: '0 0 12px rgba(249, 168, 212, 0.4), 0 0 6px rgba(110, 231, 183, 0.3)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '8px',
          fontWeight: '900',
          letterSpacing: '0.1em',
          color: '#8B6CFF',
          transition: 'width 0.2s, height 0.2s'
        }}
      >
        {cursorType === 'hover' && (
          <span style={{ fontSize: '6.5px', transform: 'scale(0.85)' }}>{hoverLabel}</span>
        )}
        {cursorType === 'drag' && (
          <span style={{ fontSize: '8px', color: '#8B6CFF' }}>⇄</span>
        )}
      </div>
    </>
  );
}
