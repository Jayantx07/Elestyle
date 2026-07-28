import React, { createContext, useContext, useState, type ReactNode } from 'react';

type CursorType = 'default' | 'next' | 'prev' | 'explore' | 'hidden';

interface CursorContextProps {
  cursorType: CursorType;
  cursorText: string;
  setCursorState: (type: CursorType, text?: string) => void;
  resetCursor: () => void;
}

const CursorContext = createContext<CursorContextProps | undefined>(undefined);

export const CursorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cursorType, setCursorType] = useState<CursorType>('default');
  const [cursorText, setCursorText] = useState('');

  const setCursorState = (type: CursorType, text: string = '') => {
    setCursorType(type);
    setCursorText(text);
  };

  const resetCursor = () => {
    setCursorType('default');
    setCursorText('');
  };

  return (
    <CursorContext.Provider value={{ cursorType, cursorText, setCursorState, resetCursor }}>
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  return context;
};
