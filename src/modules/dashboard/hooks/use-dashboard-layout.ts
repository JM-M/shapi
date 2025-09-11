"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseDashboardLayoutOptions {
  debounceMs?: number;
}

export function useDashboardLayout(
  props: UseDashboardLayoutOptions = {
    debounceMs: 16,
  },
) {
  const { debounceMs } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [isResizing, setIsResizing] = useState(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleResize = useCallback(
    (entries: ResizeObserverEntry[]) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;

        // Clear existing timeout
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        // Set resizing state immediately for responsive feedback
        setIsResizing(true);

        // Debounce the actual state update
        debounceTimeoutRef.current = setTimeout(() => {
          setContainerWidth(width);
          setContainerHeight(height);
          setIsResizing(false);
        }, debounceMs);
      }
    },
    [debounceMs],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create ResizeObserver
    resizeObserverRef.current = new ResizeObserver(handleResize);
    resizeObserverRef.current.observe(container);

    // Set initial dimensions
    setContainerWidth(container.offsetWidth);
    setContainerHeight(container.offsetHeight);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [handleResize]);

  return {
    containerRef,
    containerWidth,
    containerHeight,
    isResizing,
  };
}
