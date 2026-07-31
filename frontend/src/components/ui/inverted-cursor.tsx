"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCursor } from "@/contexts/CursorContext";

interface CursorProps {
  size?: number;
}

export const Cursor: React.FC<CursorProps> = ({ size = 20}) => {
  const { cursorType, cursorText, setCursorState, resetCursor } = useCursor();
  
  const cursorRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  
  // Track raw mouse position for scroll events and smooth animation
  const rawMousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 }); 
  const stateRef = useRef({ type: 'default', text: '' });
  
  const [visible, setVisible] = useState(false);

  // Sync state ref
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

    const handleMouseMove = (e: MouseEvent) => {
      setVisible(true);
      rawMousePos.current = { x: e.clientX, y: e.clientY };
      updateCursorBasedOnElement(e.clientX, e.clientY);
    };

    const handleScroll = () => {
      updateCursorBasedOnElement(rawMousePos.current.x, rawMousePos.current.y);
    };

    const handleMouseEnter = () => setVisible(true);
    const handleMouseLeave = () => setVisible(false);

    // Animation loop for smooth cursor follow
    const animate = () => {
      if (!cursorRef.current) return;

      const targetX = rawMousePos.current.x;
      const targetY = rawMousePos.current.y;
      
      const currentX = currentPos.current.x;
      const currentY = currentPos.current.y;

      const deltaX = (targetX - currentX) * 0.2;
      const deltaY = (targetY - currentY) * 0.2;

      const newX = currentX + deltaX;
      const newY = currentY + deltaY;

      currentPos.current = { x: newX, y: newY };
      
      // Center using CSS transform
      cursorRef.current.style.transform = `translate(${newX}px, ${newY}px) translate(-50%, -50%)`;

      requestRef.current = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("scroll", handleScroll, { capture: true });
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [setCursorState, resetCursor]);

  useEffect(() => {
    if (cursorType === 'pointer') {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'none';
    }
    
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [cursorType]);

  const isHovering = cursorType !== 'default' && cursorType !== 'hidden' && cursorType !== 'pointer';
  const isHidden = cursorType === 'hidden' || cursorType === 'pointer';
  const currentSize = isHovering ? 70 : size;

  return (
    <div
      ref={cursorRef}
      className={`fixed top-0 left-0 pointer-events-none rounded-full flex items-center justify-center transition-all duration-300 ease-out z-[9999] ${
        isHovering 
          ? 'bg-[#F5DE87] text-black shadow-[0_0_20px_rgba(245,222,135,0.4)]' 
          : 'bg-white mix-blend-difference'
      }`}
      style={{
        width: currentSize,
        height: currentSize,
        opacity: (visible && !isHidden) ? 1 : 0,
      }}
      aria-hidden="true"
    >
      <span 
        className={`text-[10px] font-bold tracking-[0.2em] uppercase select-none transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}
      >
        {cursorText}
      </span>
    </div>
  );
};

export default Cursor;
