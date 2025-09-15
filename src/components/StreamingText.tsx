import React, { useEffect, useState, useRef } from "react";

type Props = {
  fullText: string;
  delay?: number; // ms between characters
  isStreaming?: boolean;
  onComplete?: () => void;
  onHeightChange?: () => void; // Called when container height changes
};

// Define content block types
type ContentBlockType = 'paragraph' | 'card' | 'image' | 'list';

interface ContentBlock {
  id: string;
  type: ContentBlockType;
  content: string;
  metadata?: Record<string, any>; // For future extensibility
}

// Component for streaming individual paragraphs
const StreamingParagraph: React.FC<{
  text: string;
  delay: number;
  isStreaming: boolean;
  onComplete?: () => void;
  onHeightChange?: () => void;
}> = ({ text, delay, isStreaming, onComplete, onHeightChange }) => {
  const [visibleChars, setVisibleChars] = useState<number>(0);
  const [lines, setLines] = useState<string[]>([]);
  const [hasStartedStreaming, setHasStartedStreaming] = useState<boolean>(false);
  const [internalComplete, setInternalComplete] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Split text into lines based on container width
  useEffect(() => {
    if (!text || !containerRef.current) {
      setLines([]);
      return;
    }

    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.whiteSpace = 'nowrap';
    tempDiv.style.fontSize = '14px';
    tempDiv.style.fontFamily = 'var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"';
    document.body.appendChild(tempDiv);

    const containerWidth = containerRef.current.offsetWidth - 4;
    const words = text.split(' ');
    const textLines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      tempDiv.textContent = testLine;
      
      if (tempDiv.offsetWidth > containerWidth && currentLine) {
        textLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      textLines.push(currentLine);
    }

    document.body.removeChild(tempDiv);
    setLines(textLines);
  }, [text]);

  // Character streaming effect
  useEffect(() => {
    if (!lines.length) {
      setVisibleChars(0);
      setHasStartedStreaming(false);
      setInternalComplete(false);
      return;
    }

    // If streaming is requested and we haven't completed internally
    if (isStreaming && !internalComplete) {
      if (!hasStartedStreaming) {
        setHasStartedStreaming(true);
        setVisibleChars(0);
      }

      let charIndex = visibleChars;
      let intervalId: NodeJS.Timeout;
      
      const startStreaming = () => {
        intervalId = setInterval(() => {
          charIndex++;
          setVisibleChars(charIndex);
          
          if (charIndex >= text.length) {
            clearInterval(intervalId);
            setInternalComplete(true);
            onComplete?.();
          }
        }, delay);
      };

      if (charIndex < text.length) {
        startStreaming();
      }

      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    } else if (!isStreaming || internalComplete) {
      // If not streaming or internally complete, show full text
      setVisibleChars(text.length);
    }
  }, [lines, text, delay, isStreaming, onComplete, hasStartedStreaming, internalComplete, visibleChars]);

  // Calculate streaming state
  const getStreamingState = () => {
    const effectivelyStreaming = isStreaming && !internalComplete;
    if (!effectivelyStreaming || !lines.length) {
      return { currentLineIndex: -1, charsInCurrentLine: 0 };
    }

    let totalChars = 0;
    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length + (i < lines.length - 1 ? 1 : 0);
      if (visibleChars <= totalChars + lineLength) {
        return {
          currentLineIndex: i,
          charsInCurrentLine: visibleChars - totalChars
        };
      }
      totalChars += lineLength;
    }
    return { currentLineIndex: lines.length - 1, charsInCurrentLine: lines[lines.length - 1]?.length || 0 };
  };

  const getCurrentLineIndex = () => getStreamingState().currentLineIndex;
  const { currentLineIndex, charsInCurrentLine } = getStreamingState();

  // Notify parent when line changes
  useEffect(() => {
    const effectivelyStreaming = isStreaming && !internalComplete;
    if (effectivelyStreaming && onHeightChange) {
      onHeightChange();
    }
  }, [getCurrentLineIndex(), isStreaming, internalComplete, onHeightChange]);

  // Get target height for animation
  const getTargetHeight = () => {
    const effectivelyStreaming = isStreaming && !internalComplete;
    if (!effectivelyStreaming || !containerRef.current) {
      return 'auto';
    }
    
    const computedStyle = getComputedStyle(containerRef.current);
    const lineHeight = parseFloat(computedStyle.lineHeight);
    const fontSize = parseFloat(computedStyle.fontSize);
    const actualLineHeight = isNaN(lineHeight) ? fontSize * 1.5 : lineHeight;
    
    return `${(currentLineIndex + 1) * actualLineHeight}px`;
  };

  // Create mask style for current streaming line
  const getLineMaskStyle = (lineIndex: number, lineText: string) => {
    const effectivelyStreaming = isStreaming && !internalComplete;
    if (!effectivelyStreaming || lineIndex !== currentLineIndex || charsInCurrentLine >= lineText.length) {
      return {};
    }

    const lineProgress = (charsInCurrentLine / lineText.length) * 100;
    const gradientStart = Math.max(0, lineProgress - 37.5);
    const gradientEnd = Math.min(100, lineProgress + 18.75);

    return {
      maskImage: `linear-gradient(to right, 
        black 0%, 
        black ${gradientStart}%, 
        transparent ${gradientEnd}%, 
        transparent 100%)`,
      WebkitMaskImage: `linear-gradient(to right, 
        black 0%, 
        black ${gradientStart}%, 
        transparent ${gradientEnd}%, 
        transparent 100%)`,
    };
  };

  // Format text with basic markdown
  const formatText = (text: string) => {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    return formatted;
  };

  return (
    <div 
      ref={containerRef} 
      className="leading-snug text-sm transition-all duration-300 ease-out"
      style={{ 
        overflow: 'hidden',
        height: getTargetHeight()
      }}
    >
      {lines.map((line, i) => {
        const effectivelyStreaming = isStreaming && !internalComplete;
        const shouldShowLine = !effectivelyStreaming || i < currentLineIndex || (i === currentLineIndex);
        const shouldApplyFormatting = !effectivelyStreaming || i < currentLineIndex;
        
        if (!shouldShowLine) {
          return (
            <div key={i} style={{ opacity: 0, visibility: 'hidden' }}>
              <span>{line}</span>
            </div>
          );
        }

        const lineContent = shouldApplyFormatting ? formatText(line) : line;
        const isFormatted = lineContent.includes('<');

        return (
          <div key={i} style={getLineMaskStyle(i, line)}>
            {isFormatted ? (
              <span dangerouslySetInnerHTML={{ __html: lineContent }} />
            ) : (
              <span>{lineContent}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Future: Component for streaming rich cards
const StreamingCard: React.FC<{
  content: string;
  metadata?: Record<string, any>;
  delay: number;
  isStreaming: boolean;
  onComplete?: () => void;
  onHeightChange?: () => void;
}> = ({ content, metadata, delay, isStreaming, onComplete, onHeightChange }) => {
  // Placeholder for future card implementation
  // For now, just render as a styled container
  useEffect(() => {
    if (isStreaming) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, delay * 10); // Cards appear faster than character streaming
      
      return () => clearTimeout(timer);
    }
  }, [isStreaming, delay, onComplete]);

  return (
    <div className="border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50">
      <div className="text-sm text-gray-600">Card: {content}</div>
      {metadata && (
        <div className="text-xs text-gray-400 mt-1">
          {JSON.stringify(metadata)}
        </div>
      )}
    </div>
  );
};

// Content block renderer - extensible for different types
const StreamingContentBlock: React.FC<{
  block: ContentBlock;
  delay: number;
  isStreaming: boolean;
  onComplete?: () => void;
  onHeightChange?: () => void;
}> = ({ block, delay, isStreaming, onComplete, onHeightChange }) => {
  switch (block.type) {
    case 'paragraph':
      return (
        <StreamingParagraph
          text={block.content}
          delay={delay}
          isStreaming={isStreaming}
          onComplete={onComplete}
          onHeightChange={onHeightChange}
        />
      );
    
    case 'card':
      return (
        <StreamingCard
          content={block.content}
          metadata={block.metadata}
          delay={delay}
          isStreaming={isStreaming}
          onComplete={onComplete}
          onHeightChange={onHeightChange}
        />
      );
    
    // Future content types can be added here:
    // case 'image':
    //   return <StreamingImage ... />
    // case 'list':
    //   return <StreamingList ... />
    
    default:
      // Fallback to paragraph for unknown types
      return (
        <StreamingParagraph
          text={block.content}
          delay={delay}
          isStreaming={isStreaming}
          onComplete={onComplete}
          onHeightChange={onHeightChange}
        />
      );
  }
};

// Parse content into structured blocks
const parseContentIntoBlocks = (text: string): ContentBlock[] => {
  const blocks: ContentBlock[] = [];
  
  // For now, split by double line breaks for paragraphs
  // In the future, this could parse special syntax for cards, images, etc.
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  paragraphs.forEach((paragraph, index) => {
    // Check for special content types in the future
    // For example: if (paragraph.startsWith('[CARD]')) { ... }
    
    blocks.push({
      id: `paragraph-${index}`,
      type: 'paragraph',
      content: paragraph
    });
  });
  
  return blocks;
};

export const StreamingText: React.FC<Props> = ({ 
  fullText, 
  delay = 15,
  isStreaming = false,
  onComplete,
  onHeightChange
}) => {
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(0);
  const [completedBlocks, setCompletedBlocks] = useState<number>(0);
  const [internallyComplete, setInternallyComplete] = useState<boolean>(false);

  // Parse content into blocks
  useEffect(() => {
    const blocks = parseContentIntoBlocks(fullText);
    setContentBlocks(blocks);
    setCurrentBlockIndex(0);
    setCompletedBlocks(0);
    setInternallyComplete(false);
  }, [fullText]);

  // Handle block completion
  const handleBlockComplete = () => {
    const nextCompleted = completedBlocks + 1;
    setCompletedBlocks(nextCompleted);
    
    if (nextCompleted < contentBlocks.length) {
      // Start next block
      setCurrentBlockIndex(nextCompleted);
    } else {
      // All blocks complete - set internal completion state
      setInternallyComplete(true);
      onComplete?.();
    }
  };

  return (
    <div>
      {contentBlocks.map((block, index) => {
        const isCurrentBlock = index === currentBlockIndex;
        const isCompletedBlock = index < completedBlocks;
        const effectivelyStreaming = isStreaming && !internallyComplete;
        const shouldStream = effectivelyStreaming && isCurrentBlock;
        const shouldShow = isCompletedBlock || isCurrentBlock;
        const isLastBlock = index === contentBlocks.length - 1;
        
        // During streaming, consider if this is the last visible block
        const isLastVisibleBlock = effectivelyStreaming ? isCurrentBlock : isLastBlock;
        const shouldHaveMargin = !isLastVisibleBlock && contentBlocks.length > 1;

        if (!shouldShow) {
          return null;
        }

        return (
          <div key={block.id} className={shouldHaveMargin ? "mb-3" : ""}>
            <StreamingContentBlock
              block={block}
              delay={delay}
              isStreaming={shouldStream}
              onComplete={index === currentBlockIndex ? handleBlockComplete : undefined}
              onHeightChange={onHeightChange}
            />
          </div>
        );
      })}
    </div>
  );
};