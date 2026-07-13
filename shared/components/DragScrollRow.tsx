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

const DRAG_THRESHOLD = 6;

/**
 * Horizontal scroll container that also supports click-and-drag (mouse/pen)
 * and vertical-wheel-to-horizontal scrolling, so rails are easy to browse on
 * desktop as well as touch devices.
 */
export const DragScrollRow = forwardRef<HTMLDivElement, DragScrollRowProps>(
  function DragScrollRow({ ariaLabel, children, className = "" }, forwardedRef) {
    const trackRef = useRef<HTMLDivElement | null>(null);
    const stateRef = useRef({
      dragging: false,
      moved: false,
      startX: 0,
      startScroll: 0,
      pointerId: -1,
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
        dragging: true,
        moved: false,
        startX: event.clientX,
        startScroll: track.scrollLeft,
        pointerId: event.pointerId,
      };
      track.classList.add("is-dragging");
    }

    function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
      const state = stateRef.current;
      const track = trackRef.current;
      if (!state.dragging || !track) return;

      const delta = event.clientX - state.startX;
      if (Math.abs(delta) > DRAG_THRESHOLD) {
        state.moved = true;
        if (track.hasPointerCapture?.(state.pointerId) === false) {
          try {
            track.setPointerCapture(state.pointerId);
          } catch {
            /* ignore */
          }
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
      state.dragging = false;
      state.pointerId = -1;
      window.setTimeout(() => {
        state.moved = false;
      }, 0);
    }

    function handleClickCapture(event: React.MouseEvent<HTMLDivElement>) {
      if (stateRef.current.moved) {
        event.preventDefault();
        event.stopPropagation();
      }
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
