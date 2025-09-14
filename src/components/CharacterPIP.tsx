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
}

const CharacterPIP: React.FC<CharacterPIPProps> = ({
  character, 
  experienceType = 'conversation',
  isVisible = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [cssPosition, setCssPosition] = useState({ x: 251, y: 433, width: 100, height: 150, opacity: 1, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' });
  const [isDragging, setIsDragging] = useState(false);
  const [preExpandPosition, setPreExpandPosition] = useState({ x: 251, y: 433 });

  // Show/hide animation
  useEffect(() => {
    console.log(`${ts()} 👁️ Visibility effect triggered:`, { isVisible, isExpanded });
    
    // COMPLETELY skip if expanded to prevent interference
    if (isExpanded) {
      console.log(`${ts()} 👁️ Skipping visibility effect - component is expanded`);
      return;
    }
    
    // Skip if we already have a position set (don't override collapse position)
    // Check if position is different from default initial position (bottom-right)
    if (isVisible && (cssPosition.x !== 251 || cssPosition.y !== 433)) {
      console.log(`${ts()} 👁️ Skipping visibility effect - position already set:`, cssPosition);
      return;
    }
    
    if (isVisible) {
      // Set initial position
      const container = containerRef.current?.parentElement;
      const containerWidth = container?.clientWidth || 351;
      
      console.log(`${ts()} 📍 Setting initial position - containerWidth:`, containerWidth);
      console.log(`${ts()} 📍 Target position:`, { x: containerWidth - 100, y: 'bottom-right', width: 100, height: 150 });
      
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
      
      console.log(`${ts()} 📍 Initial position animation started`);
    } else {
      console.log(`${ts()} 👁️ Hiding PIP`);
      setCssPosition(prev => ({
        ...prev,
        opacity: 0
      }));
    }
  }, [isVisible, isExpanded]);

  // Force video to play when component becomes visible
  useEffect(() => {
    if (isVisible && videoRef.current) {
      console.log(`${ts()} 📹 Attempting to play video for ${character.id}`);
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.log(`${ts()} 📹 Video autoplay blocked:`, e.message);
        });
      }
    }
  }, [isVisible, character.id]);

  // Get expanded position (full width at top)
  const getExpandedPosition = useCallback(() => {
    console.log(`${ts()} 📐 getExpandedPosition called`);
    
    const container = containerRef.current?.parentElement;
    console.log(`${ts()} 📐 Container:`, container);
    
    if (!container) {
      console.log(`${ts()} 📐 No container, using fallback`);
      return { x: 0, y: 0, width: 351, height: 527 };
    }
    
    const containerWidth = container.clientWidth;
    const expandedWidth = containerWidth;
    const expandedHeight = Math.round(expandedWidth * 1.5);
    
    const result = {
      x: 0,
      y: 0, // Always at the top
      width: expandedWidth,
      height: expandedHeight
    };
    
    console.log(`${ts()} 📐 Calculated expanded position:`, result);
    return result;
  }, []);

  // This function is now handled inline in the drag gesture

  // Handle click to expand/collapse
  const handleClick = useCallback(() => {
    console.log(`${ts()} 🖱️ CLICK - isExpanded:`, isExpanded);
    console.log(`${ts()} 🖱️ Current CSS position:`, cssPosition);
    
    if (!isExpanded) {
      console.log(`${ts()} 🔄 EXPANDING...`);
      
      // Store current position before expanding
      const currentPos = { x: cssPosition.x, y: cssPosition.y };
      console.log(`${ts()} 💾 Storing pre-expand position:`, currentPos);
      console.log(`${ts()} 💾 Current cssPosition before expand:`, cssPosition);
      setPreExpandPosition(currentPos);
      
      // Expand to full width at top
      const expandedPos = getExpandedPosition();
      console.log(`${ts()} 🔄 Target expanded position:`, expandedPos);
      
      // Set expanded BEFORE starting animation to prevent visibility effect interference
      console.log(`${ts()} 🔄 Setting isExpanded to true`);
      setIsExpanded(true);
      
      // Use pure CSS for expansion - no React Spring
      console.log(`${ts()} 🔄 Setting CSS position and size for expansion`);
      setCssPosition({
        x: expandedPos.x,
        y: expandedPos.y,
        width: expandedPos.width,
        height: expandedPos.height,
        opacity: 1,
        boxShadow: '0 0 0 rgba(0, 0, 0, 0)' // Remove shadow when expanded
      });
      
      console.log(`${ts()} 🔄 Expansion completed`);
      
      console.log(`${ts()} 🔄 Expansion animation started`);
      
      // Log what the position is 100ms after expansion
      setTimeout(() => {
        console.log(`${ts()} 🔄 Position 100ms after expansion:`, {
          css: cssPosition
        });
      }, 100);
    } else {
      console.log(`${ts()} 🔄 COLLAPSING...`);
      console.log(`${ts()} 🔄 Current cssPosition:`, cssPosition);
      console.log(`${ts()} 🔄 Current preExpandPosition:`, preExpandPosition);
      console.log(`${ts()} 🔄 Setting isExpanded to false`);
      setIsExpanded(false);
      
      // Restore to the position before expansion
      console.log(`${ts()} 🔄 Restoring to pre-expand position:`, preExpandPosition);
      
      setCssPosition({
        x: preExpandPosition.x,
        y: preExpandPosition.y,
        width: 100,
        height: 150,
        opacity: 1,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' // Restore shadow when collapsed
      });
      
      console.log(`${ts()} 🔄 Collapse position set to:`, { x: preExpandPosition.x, y: preExpandPosition.y });
    }
  }, [isExpanded, getExpandedPosition, cssPosition, preExpandPosition]);

  // Drag gesture with CSS positioning
  const bind = useDrag(
    ({ active, offset: [ox, oy], tap, first, last }) => {
      // Handle tap separately
      if (tap) {
        handleClick();
        return;
      }
      
      if (first) {
        setIsDragging(true);
      }
      
      if (active && !isExpanded) {
        // Use pure CSS for immediate, responsive dragging
        setCssPosition(prev => ({
          ...prev,
          x: ox,
          y: oy
        }));
      } else if (!active && !isExpanded && last) {
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
      filterTaps: true,
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
    console.log(`${ts()} 👻 Component not visible, returning null`);
    return null;
  }

  const getVideoSrc = () => `/idle/${character.id}_idle.mp4`;

  // Temporarily disable render logging to reduce noise
  // console.log(`${ts()} 🎨 Rendering PIP with current values:`, {
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
        onLoadedData={() => {
          console.log(`${ts()} 📹 Video loaded for ${character.id}`);
        }}
        onCanPlay={() => {
          console.log(`${ts()} 📹 Video can play for ${character.id}`);
          if (videoRef.current) {
            videoRef.current.play().catch(e => {
              console.log(`${ts()} 📹 Video play failed:`, e);
            });
          }
        }}
        onError={(e) => {
          console.log(`${ts()} 📹 Video error for ${character.id}:`, e);
        }}
      >
        <source src={getVideoSrc()} type="video/mp4" />
      </video>
    </div>
  );
};

export default CharacterPIP;