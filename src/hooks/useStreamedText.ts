import { useState, useCallback } from "react";

export function useStreamedText() {
  const [text, setText] = useState("");

  // Call this for each incoming chunk from your LLM stream
  const appendChunk = useCallback((chunk: string) => {
    // Normalize whitespace:
    // - Collapse multiple spaces
    // - Trim only leading space at the very start
    setText(prev => {
      const clean = chunk.replace(/\s+/g, " ");
      if (prev.length === 0) {
        return clean.replace(/^\s+/, "");
      }
      return prev + clean;
    });
  }, []);

  const reset = useCallback(() => setText(""), []);

  return { text, appendChunk, reset };
}
