'use client';

import { ReactNode, useRef, useState } from 'react';

interface ResizablePanelProps {
  children: ReactNode;
  minWidth?: number;
  maxWidth?: number;
  initialWidth?: number;
  className?: string;
}

export function ResizablePanel({ children, minWidth = 220, maxWidth = 800, initialWidth = 320, className }: ResizablePanelProps) {
  const frame = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [width, setWidth] = useState(initialWidth);

  const onMouseMove = (event: MouseEvent) => {
    if (!isDragging.current || !frame.current) return;
    const rect = frame.current.getBoundingClientRect();
    const newWidth = Math.min(maxWidth, Math.max(minWidth, event.clientX - rect.left));
    setWidth(newWidth);
  };

  const onMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  const onMouseDown = () => {
    isDragging.current = true;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div ref={frame} className={`relative h-full min-h-0 ${className ?? ''}`} style={{ width }}>
      <div className="absolute right-0 top-0 h-full w-px bg-white/10" />
      <div className="absolute right-1 top-0 h-full w-1 cursor-ew-resize" onMouseDown={onMouseDown} />
      <div className="h-full overflow-hidden" style={{ width }}>
        {children}
      </div>
    </div>
  );
}
