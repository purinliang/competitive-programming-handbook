"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import type { HTMLAttributes, PointerEvent as ReactPointerEvent, ReactNode } from "react";

interface ScrollbarState {
  canScroll: boolean;
  visible: boolean;
  height: number;
  top: number;
}

interface DragState {
  pointerId: number;
  startY: number;
  startScrollTop: number;
  maxScrollTop: number;
  maxThumbTop: number;
}

interface ScrollAreaProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onScroll"> {
  children: ReactNode;
  viewportClassName?: string;
  refreshKey?: string;
}

const hiddenScrollbar: ScrollbarState = { canScroll: false, visible: false, height: 0, top: 0 };
const trackPadding = 8;
const minimumThumbHeight = 32;
const hideDelay = 900;

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { children, className, viewportClassName, refreshKey, ...props },
  ref,
) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const hideTimer = useRef<number | null>(null);
  const dragState = useRef<DragState | null>(null);
  const [dragging, setDragging] = useState(false);
  const [scrollbar, setScrollbar] = useState<ScrollbarState>(hiddenScrollbar);

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current !== null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const updateScrollbar = useCallback((visible: boolean) => {
    const viewport = viewportRef.current;
    if (!viewport || viewport.clientHeight <= 0 || viewport.scrollHeight <= viewport.clientHeight + 1) {
      setScrollbar(hiddenScrollbar);
      return;
    }

    const trackHeight = Math.max(0, viewport.clientHeight - trackPadding * 2);
    const height = Math.max(minimumThumbHeight, Math.round((viewport.clientHeight / viewport.scrollHeight) * trackHeight));
    const maxScrollTop = viewport.scrollHeight - viewport.clientHeight;
    const maxThumbTop = Math.max(0, trackHeight - height);
    const top = trackPadding + (viewport.scrollTop / maxScrollTop) * maxThumbTop;
    setScrollbar({ canScroll: true, visible, height, top });
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    hideTimer.current = window.setTimeout(() => updateScrollbar(false), hideDelay);
  }, [clearHideTimer, updateScrollbar]);

  useEffect(() => {
    updateScrollbar(false);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => updateScrollbar(false));
    if (viewportRef.current) observer?.observe(viewportRef.current);
    if (contentRef.current) observer?.observe(contentRef.current);
    const handleResize = () => updateScrollbar(false);
    window.addEventListener("resize", handleResize);
    return () => {
      clearHideTimer();
      observer?.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [clearHideTimer, refreshKey, updateScrollbar]);

  function handleScroll() {
    updateScrollbar(true);
    scheduleHide();
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLSpanElement>) {
    const viewport = viewportRef.current;
    if (event.button !== 0 || !viewport) return;
    const maxScrollTop = viewport.scrollHeight - viewport.clientHeight;
    const maxThumbTop = Math.max(0, viewport.clientHeight - trackPadding * 2 - scrollbar.height);
    if (maxScrollTop <= 0 || maxThumbTop <= 0) return;

    event.preventDefault();
    clearHideTimer();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = { pointerId: event.pointerId, startY: event.clientY, startScrollTop: viewport.scrollTop, maxScrollTop, maxThumbTop };
    setDragging(true);
    updateScrollbar(true);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLSpanElement>) {
    const drag = dragState.current;
    const viewport = viewportRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !viewport) return;
    event.preventDefault();
    const next = drag.startScrollTop + ((event.clientY - drag.startY) / drag.maxThumbTop) * drag.maxScrollTop;
    viewport.scrollTop = Math.min(drag.maxScrollTop, Math.max(0, next));
    updateScrollbar(true);
  }

  function handlePointerEnd(event: ReactPointerEvent<HTMLSpanElement>) {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragState.current = null;
    setDragging(false);
    updateScrollbar(true);
    scheduleHide();
  }

  return (
    <div ref={ref} className={`scroll-area${className ? ` ${className}` : ""}`} {...props}>
      <div
        ref={viewportRef}
        className={`scroll-area-viewport${viewportClassName ? ` ${viewportClassName}` : ""}`}
        onScroll={handleScroll}
      >
        <div ref={contentRef}>{children}</div>
      </div>
      {scrollbar.canScroll ? (
        <span
          className={`scroll-area-thumb-track${scrollbar.visible || dragging ? " is-visible" : ""}${dragging ? " is-dragging" : ""}`}
          style={{ height: scrollbar.height, transform: `translateY(${scrollbar.top}px)` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
          <span className="scroll-area-thumb" aria-hidden="true" />
        </span>
      ) : null}
    </div>
  );
});
