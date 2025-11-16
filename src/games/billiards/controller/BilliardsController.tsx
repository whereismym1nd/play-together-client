import React, { useCallback, useEffect, useRef, useState } from "react";

import type { GameControllerProps } from "../../_core/types";
import { useGameSocket } from "../../_core/useGameSocket";

const MAX_DRAG_PX = 140;

type DragState = {
  active: boolean;
  x: number;
  y: number;
  power: number;
  angle: number;
};

const INITIAL_STATE: DragState = {
  active: false,
  x: 0,
  y: 0,
  power: 0,
  angle: 0,
};

export const BilliardsController: React.FC<GameControllerProps> = ({ roomId }) => {
  const socket = useGameSocket(roomId, "billiards", "controller");
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const dragStateRef = useRef<DragState>(INITIAL_STATE);
  const [dragState, setDragState] = useState<DragState>(INITIAL_STATE);

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  const emitAim = useCallback(
    (power: number, angle: number) => {
      if (!socket) return;
      socket.emit("cue:aim", { roomId, power, angle });
    },
    [socket, roomId]
  );

  const emitShoot = useCallback(
    (power: number, angle: number) => {
      if (!socket) return;
      socket.emit("cue:shoot", { roomId, power, angle });
    },
    [socket, roomId]
  );

  const computeDrag = useCallback(
    (clientX: number, clientY: number) => {
      const surface = surfaceRef.current;
      if (!surface) return null;

      const rect = surface.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const distance = Math.hypot(dx, dy);

      if (distance === 0) {
        return {
          pointerX: 0,
          pointerY: 0,
          power: 0,
          angle: dragStateRef.current.angle ?? 0,
        };
      }

      const limited = Math.min(distance, MAX_DRAG_PX);
      const ratio = limited / distance;
      const pointerX = dx * ratio;
      const pointerY = dy * ratio;
      const power = limited / MAX_DRAG_PX;
      const angle = Math.atan2(-pointerY, -pointerX);

      return { pointerX, pointerY, power, angle };
    },
    []
  );

  const resetDrag = useCallback(() => {
    draggingRef.current = false;
    setDragState(INITIAL_STATE);
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      const payload = computeDrag(event.clientX, event.clientY);
      if (!payload) return;
      draggingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);

      setDragState({
        active: true,
        x: payload.pointerX,
        y: payload.pointerY,
        power: payload.power,
        angle: payload.angle,
      });
      emitAim(payload.power, payload.angle);
    },
    [computeDrag, emitAim]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      const payload = computeDrag(event.clientX, event.clientY);
      if (!payload) return;
      setDragState({
        active: true,
        x: payload.pointerX,
        y: payload.pointerY,
        power: payload.power,
        angle: payload.angle,
      });
      emitAim(payload.power, payload.angle);
    },
    [computeDrag, emitAim]
  );

  const handlePointerEnd = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      if (!draggingRef.current) {
        resetDrag();
        return;
      }

      draggingRef.current = false;
      const current = dragStateRef.current;

      if (current.power > 0.05) {
        emitShoot(current.power, current.angle);
      } else {
        emitAim(0, current.angle);
      }

      setDragState(INITIAL_STATE);
    },
    [emitAim, emitShoot, resetDrag]
  );

  const arrowLength = dragState.power * 130;
  const arrowAngleDeg = (dragState.angle * 180) / Math.PI;

  return (
    <div
      style={{
        width: "100%",
        height: "100dvh",
        background: "#041b11",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: "24px 16px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Billiards Controller</div>
        <div style={{ opacity: 0.75, fontSize: 14 }}>
          Потяни шар, чтобы прицелиться. Отпусти, чтобы ударить.
        </div>
      </div>
      <div
        ref={surfaceRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerLeave={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        style={{
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "radial-gradient(circle at 30% 30%, #1f5238, #0a2014)",
          border: "2px solid rgba(255,255,255,0.1)",
          position: "relative",
          touchAction: "none",
          boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#fff",
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 15px rgba(255,255,255,0.8)",
          }}
        />

        {dragState.power > 0 && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) rotate(${arrowAngleDeg}deg)`,
              transformOrigin: "0 50%",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
              opacity: Math.max(0.4, dragState.power),
            }}
          >
            <div
              style={{
                width: arrowLength,
                height: 6,
                background: "linear-gradient(90deg, rgba(255,255,255,0), #f2c94c)",
                borderRadius: 999,
              }}
            />
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: "8px solid transparent",
                borderBottom: "8px solid transparent",
                borderLeft: "12px solid #f2c94c",
              }}
            />
          </div>
        )}

        {dragState.active && (
          <div
            style={{
              position: "absolute",
              width: 22,
              height: 22,
              borderRadius: "50%",
              border: "2px solid #f2c94c",
              background: "rgba(242,201,76,0.25)",
              top: `calc(50% + ${dragState.y}px)`,
              left: `calc(50% + ${dragState.x}px)`,
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    </div>
  );
};
