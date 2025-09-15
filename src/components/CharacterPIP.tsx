'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { animated, useSpring, config } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

// Utility for timestamped logs
const ts = () => new Date().toISOString().split('T')[1].slice(0, -1);

interface CharacterPIPProps {
  character: {
    id: string;
    name: string;
  };
  experienceType?: 'conversation' | 'quiz' | 'flashcard';
  isVisible?: boolean;
  initialExpanded?: boolean;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

const CharacterPIP: React.FC<CharacterPIPProps> = ({
  character, 
  experienceType = 'conversation',
  isVisible = false,
  initialExpanded = false,
  isExpanded: controlledExpanded,
  onToggleExpanded
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Use controlled expansion state if provided, otherwise use internal state
  const [internalExpanded, setInternalExpanded] = useState(initialExpanded);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const prevExpandedRef = useRef<boolean>(false); // Initialize with false, will be updated in useEffect
  const [cssPosition, setCssPosition] = useState(() => {
    // If starting expanded, use expanded dimensions and position
    if (initialExpanded) {
      return { x: 0, y: 0, width: 351, height: 527, opacity: 1, boxShadow: '0 0 0 rgba(0, 0, 0, 0)' };
    }
    // Otherwise use collapsed dimensions at bottom-right
    return { x: 251, y: 433, width: 100, height: 150, opacity: 1, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [preExpandPosition, setPreExpandPosition] = useState({ x: 251, y: 433 });

  // Show/hide animation
  useEffect(() => {
    // COMPLETELY skip if expanded to prevent interference
    if (isExpanded) {
      return;
    }
    
    // Skip if we already have a position set (don't override collapse position)
    // Check if position is different from default initial position (bottom-right or expanded)
    const isAtDefaultCollapsed = cssPosition.x === 251 && cssPosition.y === 433;
    const isAtDefaultExpanded = cssPosition.x === 0 && cssPosition.y === 0 && cssPosition.width === 351;
    
    if (isVisible && !isAtDefaultCollapsed && !isAtDefaultExpanded) {
      return;
    }
    
    if (isVisible) {
      if (initialExpanded) {
        // If starting expanded, set to expanded position
        const expandedPos = getExpandedPosition();
        
        setCssPosition(prev => ({
          ...prev,
          ...expandedPos,
          opacity: 1,
          boxShadow: '0 0 0 rgba(0, 0, 0, 0)'
        }));
        
        // Set pre-expand position to bottom-right for when user collapses
        const container = containerRef.current?.parentElement;
        const containerHeight = container?.clientHeight || 653;
        const containerWidth = container?.clientWidth || 351;
        const composerHeight = 70;
        const availableHeight = containerHeight - composerHeight;
        const fallbackX = containerWidth - 100;
        const fallbackY = availableHeight - 150;
        setPreExpandPosition({ x: fallbackX, y: fallbackY });
      } else {
        // Set initial position (bottom-right collapsed)
        const container = containerRef.current?.parentElement;
        const containerWidth = container?.clientWidth || 351;
        
        // Set initial position using CSS (bottom-right)
        const containerHeight = container?.clientHeight || 653;
        const composerHeight = 70;
        const availableHeight = containerHeight - composerHeight;
        
        const initialX = containerWidth - 100; // Right edge
        const initialY = availableHeight - 150; // Bottom edge (with composer clearance)
        
        setCssPosition(prev => ({
          ...prev,
          x: initialX,
          y: initialY,
          opacity: 1,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }));
        
        // Also update pre-expand position
        setPreExpandPosition({ x: initialX, y: initialY });
      }
    } else {
      setCssPosition(prev => ({
        ...prev,
        opacity: 0
      }));
    }
  }, [isVisible, isExpanded, initialExpanded]);

  // Initialize prevExpandedRef with current isExpanded state
  useEffect(() => {
    prevExpandedRef.current = isExpanded;
  }, []); // Only run once on mount

  // Force video to play when component becomes visible
  useEffect(() => {
    if (isVisible && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Video autoplay blocked, ignore silently
        });
      }
    }
  }, [isVisible, character.id]);

  // Get expanded position (full width at top, but leave space for composer)
  const getExpandedPosition = useCallback(() => {
    const container = containerRef.current?.parentElement;
    
    if (!container) {
      return { x: 0, y: 0, width: 351, height: 400 }; // Reduced height
    }
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const expandedWidth = containerWidth;
    
    // Reserve space for composer (48px height + 24px padding = ~80px total)
    const composerSpace = 80;
    const maxExpandedHeight = containerHeight - composerSpace;
    
    // Use 1.5 ratio but cap it to not cover composer
    const idealHeight = Math.round(expandedWidth * 1.5);
    const expandedHeight = Math.min(idealHeight, maxExpandedHeight);
    
    const result = {
      x: 0,
      y: 0, // Always at the top
      width: expandedWidth,
      height: expandedHeight
    };
    
    return result;
  }, []);

  // This function is now handled inline in the drag gesture

  // Handle expansion/collapse logic (now controlled externally)
  useEffect(() => {
    const wasExpanded = prevExpandedRef.current;
    prevExpandedRef.current = isExpanded;
    
    
    if (isExpanded && !wasExpanded) {
      // Expanding: store current position before expanding
      
      const currentPos = { x: cssPosition.x, y: cssPosition.y };
      setPreExpandPosition(currentPos);
      
      // Expand to full width at top
      const expandedPos = getExpandedPosition();
      
      setCssPosition({
        x: expandedPos.x,
        y: expandedPos.y,
        width: expandedPos.width,
        height: expandedPos.height,
        opacity: 1,
        boxShadow: '0 0 0 rgba(0, 0, 0, 0)' // Remove shadow when expanded
      });
    } else if (!isExpanded && wasExpanded) {
      // Collapsing: restore to previous position
      
      setCssPosition({
        x: preExpandPosition.x,
        y: preExpandPosition.y,
        width: 100,
        height: 150,
        opacity: 1,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' // Restore shadow when collapsed
      });
      
    }
  }, [isExpanded, getExpandedPosition, cssPosition.x, cssPosition.y, controlledExpanded, experienceType]);

  // Drag gesture with CSS positioning (dragging only, no tap detection)
  const bind = useDrag(
    ({ active, offset: [ox, oy], first, last }) => {
      // Only allow dragging when collapsed
      if (isExpanded) {
        return;
      }
      
      if (first) {
        setIsDragging(true);
      }
      
      if (active) {
        // Use pure CSS for immediate, responsive dragging
        setCssPosition(prev => ({
          ...prev,
          x: ox,
          y: oy
        }));
      } else if (!active && last) {
        setIsDragging(false);
        
        // Snap to corner using pure CSS
        const container = containerRef.current?.parentElement;
        if (container) {
          const containerWidth = container.clientWidth;
          const containerHeight = container.clientHeight;
          
          // Reserve space for composer at bottom
          const composerHeight = 70;
          const availableHeight = containerHeight - composerHeight;
          
          const isLeft = ox < containerWidth / 2;
          const isTop = oy < availableHeight / 2;
          
          const targetX = isLeft ? 0 : containerWidth - 100;
          const targetY = isTop ? 0 : availableHeight - 150;
          
          // CSS transition will handle the smooth snap
          setCssPosition(prev => ({
            ...prev,
            x: targetX,
            y: targetY,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }));
          
          // Update pre-expand position so collapse remembers this corner
          setPreExpandPosition({ x: targetX, y: targetY });
        }
      }
    },
    {
      from: () => [cssPosition.x, cssPosition.y] as [number, number],
      filterTaps: false, // No tap filtering needed since we removed tap handling
      threshold: 5,
      bounds: () => {
        const container = containerRef.current?.parentElement;
        if (!container) return {};
        
        const composerHeight = 70;
        return {
          left: 0,
          right: container.clientWidth - 100,
          top: 0,
          bottom: container.clientHeight - 150 - composerHeight
        };
      }
    }
  );

  if (!isVisible) {
    return null;
  }

  const getVideoSrc = () => `/idle/${character.id}_idle.mp4`;

  // Temporarily disable render logging to reduce noise
  //   css: cssPosition,
  //   dragSpring: { x: dragSpring.x.get().toFixed(1), y: dragSpring.y.get().toFixed(1) },
  //   isExpanded
  // });

  return (
    <div
      ref={containerRef}
      {...bind()}
      className={`absolute z-50 cursor-pointer touch-none select-none ${isDragging ? '' : 'transition-all duration-300'}`}
      style={{
        // Use pure CSS for everything - no React Spring interference
        transform: `translate3d(${cssPosition.x}px, ${cssPosition.y}px, 0)`,
        width: `${cssPosition.width}px`,
        height: `${cssPosition.height}px`,
        opacity: cssPosition.opacity,
        borderRadius: '12px',
        boxShadow: cssPosition.boxShadow,
        overflow: 'hidden',
        backgroundColor: '#000'
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover pointer-events-none"
        style={{ borderRadius: '12px' }}
        onCanPlay={() => {
          if (videoRef.current) {
            videoRef.current.play().catch(() => {
              // Video play failed, ignore silently
            });
          }
        }}
      >
        <source src={getVideoSrc()} type="video/mp4" />
      </video>
    </div>
  );
};

export default CharacterPIP;