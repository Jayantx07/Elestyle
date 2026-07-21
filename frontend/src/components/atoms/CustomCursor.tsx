import React, { useEffect, useState, useRef } from 'react';
import { useCursor } from '../../contexts/CursorContext';

export const CustomCursor: React.FC = () => {
  const { cursorType, cursorText, setCursorState, resetCursor } = useCursor();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const positionRef = useRef({ x: 0, y: 0 });
  const stateRef = useRef({ type: 'default', text: '' });

  // Sync ref with context state
  useEffect(() => {
    stateRef.current = { type: cursorType, text: cursorText };
  }, [cursorType, cursorText]);

  useEffect(() => {
    const updateCursorBasedOnElement = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y);
      const cursorEl = el?.closest('[data-cursor]');
      
      if (cursorEl) {
        const type = cursorEl.getAttribute('data-cursor') as any;
        const text = cursorEl.getAttribute('data-cursor-text') || '';
        
        if (stateRef.current.type !== type || stateRef.current.text !== text) {
          setCursorState(type, text);
        }
      } else {
        if (stateRef.current.type !== 'default') {
          resetCursor();
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      positionRef.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
      
      updateCursorBasedOnElement(e.clientX, e.clientY);
    };

    const onScroll = () => {
      updateCursorBasedOnElement(positionRef.current.x, positionRef.current.y);
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('scroll', onScroll, { capture: true });
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible, setCursorState, resetCursor]);

  if (cursorType === 'default') return null;

  return (
    <div
      className={`fixed top-0 left-0 pointer-events-none z-[100] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`,
        transition: 'transform 0.1s ease-out', // Smooth follow effect
      }}
    >
      <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white/40 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 ease-out scale-100">
        <span className="text-[10px] font-bold tracking-[0.2em] text-charcoal uppercase select-none">
          {cursorText}
        </span>
      </div>
    </div>
  );
};
