"use client";

import {
  forwardRef,
  useCallback,
  useRef,
  type PointerEvent,
  type ReactNode,
  type WheelEvent,
} from "react";

type DragScrollRowProps = {
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
};

const DRAG_THRESHOLD = 8;

/**
 * Horizontal scroll container that also supports click-and-drag (mouse/pen)
 * and vertical-wheel-to-horizontal scrolling, so rails are easy to browse on
 * desktop as well as touch devices.
 */
export const DragScrollRow = forwardRef<HTMLDivElement, DragScrollRowProps>(
  function DragScrollRow({ ariaLabel, children, className = "" }, forwardedRef) {
    const trackRef = useRef<HTMLDivElement | null>(null);
    const stateRef = useRef({
      blockClick: false,
      dragging: false,
      moved: false,
      pointerId: -1,
      startScroll: 0,
      startX: 0,
    });

    const setTrackRef = useCallback(
      (node: HTMLDivElement | null) => {
        trackRef.current = node;
        if (!forwardedRef) return;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else forwardedRef.current = node;
      },
      [forwardedRef],
    );

    function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
      if (event.pointerType === "touch") return;

      const track = trackRef.current;
      if (!track) return;

      stateRef.current = {
        blockClick: false,
        dragging: true,
        moved: false,
        pointerId: event.pointerId,
        startScroll: track.scrollLeft,
        startX: event.clientX,
      };
    }

    function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
      const state = stateRef.current;
      const track = trackRef.current;
      if (!state.dragging || !track) return;

      const delta = event.clientX - state.startX;
      if (Math.abs(delta) <= DRAG_THRESHOLD) return;

      if (!state.moved) {
        state.moved = true;
        track.classList.add("is-dragging");
        try {
          track.setPointerCapture(state.pointerId);
        } catch {
          /* ignore */
        }
      }

      track.scrollLeft = state.startScroll - delta;
    }

    function endDrag() {
      const state = stateRef.current;
      const track = trackRef.current;

      if (track) {
        track.classList.remove("is-dragging");
        if (state.pointerId >= 0 && track.hasPointerCapture?.(state.pointerId)) {
          try {
            track.releasePointerCapture(state.pointerId);
          } catch {
            /* ignore */
          }
        }
      }

      if (state.moved) {
        state.blockClick = true;
      }

      state.dragging = false;
      state.moved = false;
      state.pointerId = -1;
    }

    function handleClickCapture(event: React.MouseEvent<HTMLDivElement>) {
      if (!stateRef.current.blockClick) return;

      event.preventDefault();
      event.stopPropagation();
      stateRef.current.blockClick = false;
    }

    function handleWheel(event: WheelEvent<HTMLDivElement>) {
      const track = trackRef.current;
      if (!track) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const canScroll = track.scrollWidth > track.clientWidth;
      if (!canScroll) return;
      event.preventDefault();
      track.scrollLeft += event.deltaY;
    }

    return (
      <div
        ref={setTrackRef}
        aria-label={ariaLabel}
        className={`drag-scroll-row ${className}`.trim()}
        onClickCapture={handleClickCapture}
        onPointerCancel={endDrag}
        onPointerDown={handlePointerDown}
        onPointerLeave={endDrag}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onWheel={handleWheel}
      >
        {children}
      </div>
    );
  },
);
