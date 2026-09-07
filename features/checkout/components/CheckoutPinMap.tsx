"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";

const TILE_SIZE = 256;
const ZOOM = 16;

type CheckoutPinMapProps = {
  lat: number;
  lng: number;
  interactive: boolean;
  label: string;
  hint: string;
  onMove?: (lat: number, lng: number) => void;
};

function latLngToWorld(lat: number, lng: number, zoom: number) {
  const n = 2 ** zoom;
  const x = ((lng + 180) / 360) * n;
  const clampedLat = Math.max(-85.05112878, Math.min(85.05112878, lat));
  const sinLat = Math.sin((clampedLat * Math.PI) / 180);
  const y = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * n;
  return { x, y };
}

function worldToLatLng(x: number, y: number, zoom: number) {
  const n = 2 ** zoom;
  const lng = (x / n) * 360 - 180;
  const m = Math.PI * (1 - (2 * y) / n);
  const lat = (Math.atan(Math.sinh(m)) * 180) / Math.PI;
  return { lat, lng };
}

export function CheckoutPinMap({
  lat,
  lng,
  interactive,
  label,
  hint,
  onMove,
}: CheckoutPinMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    lat: number;
    lng: number;
  } | null>(null);
  const [size, setSize] = useState({ width: 320, height: 200 });
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setSize({
        width: Math.max(1, Math.round(entry.contentRect.width)),
        height: Math.max(1, Math.round(entry.contentRect.height)),
      });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!interactive) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        lat,
        lng,
      };
      setDragging(true);
    },
    [interactive, lat, lng],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId || !onMove) return;
      const world = latLngToWorld(drag.lat, drag.lng, ZOOM);
      const next = worldToLatLng(
        world.x - (event.clientX - drag.x) / TILE_SIZE,
        world.y - (event.clientY - drag.y) / TILE_SIZE,
        ZOOM,
      );
      onMove(next.lat, next.lng);
    },
    [onMove],
  );

  const endDrag = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);
  }, []);

  const world = latLngToWorld(lat, lng, ZOOM);
  const tilesX = Math.ceil(size.width / TILE_SIZE) + 2;
  const tilesY = Math.ceil(size.height / TILE_SIZE) + 2;
  const startX = Math.floor(world.x - size.width / (2 * TILE_SIZE));
  const startY = Math.floor(world.y - size.height / (2 * TILE_SIZE));
  const offsetX = size.width / 2 - (world.x - startX) * TILE_SIZE;
  const offsetY = size.height / 2 - (world.y - startY) * TILE_SIZE;
  const tiles: Array<{ x: number; y: number; left: number; top: number }> = [];

  for (let x = 0; x < tilesX; x += 1) {
    for (let y = 0; y < tilesY; y += 1) {
      const tileX = startX + x;
      const tileY = startY + y;
      if (tileX < 0 || tileY < 0 || tileX >= 2 ** ZOOM || tileY >= 2 ** ZOOM) continue;
      tiles.push({
        x: tileX,
        y: tileY,
        left: offsetX + x * TILE_SIZE,
        top: offsetY + y * TILE_SIZE,
      });
    }
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border">
      <div
        ref={containerRef}
        aria-label={label}
        className={`relative h-52 w-full overflow-hidden bg-[#e8eef5] ${
          interactive ? "cursor-grab touch-none select-none" : ""
        } ${dragging ? "cursor-grabbing" : ""}`}
        onPointerCancel={endDrag}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        role="application"
      >
        {tiles.map((tile) => (
          // eslint-disable-next-line @next/next/no-img-element -- OSM tiles are dynamic
          <img
            alt=""
            className="pointer-events-none absolute max-w-none"
            draggable={false}
            height={TILE_SIZE}
            key={`${tile.x}-${tile.y}`}
            src={`https://tile.openstreetmap.org/${ZOOM}/${tile.x}/${tile.y}.png`}
            style={{ left: tile.left, top: tile.top, width: TILE_SIZE, height: TILE_SIZE }}
            width={TILE_SIZE}
          />
        ))}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full">
          <span className="block h-8 w-8 -translate-y-0.5 rounded-full border-[3px] border-white bg-secondary shadow-[0_6px_16px_rgb(201_169_98/45%)]" />
          <span className="mx-auto -mt-1 block h-2.5 w-2.5 rounded-full bg-primary shadow-sm" />
        </div>
      </div>
      <p className="border-t border-border bg-surface-muted px-3 py-2 text-xs text-muted">
        {hint} © OpenStreetMap
      </p>
    </div>
  );
}
