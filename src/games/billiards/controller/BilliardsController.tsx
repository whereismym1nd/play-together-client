import React, { useCallback, useEffect, useRef, useState } from "react";
import "./billiardsController.scss";
import type { GameControllerProps } from "../../../shared/types/gameTypes";
import { useRoomConnection } from "@/features/rooms";

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
  const { socket, room } = useRoomConnection();
  const activeRoomId = room?.id ?? roomId;
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
      socket.emit("cue:aim", { roomId: activeRoomId, power, angle });
    },
    [socket, activeRoomId]
  );

  const emitShoot = useCallback(
    (power: number, angle: number) => {
      if (!socket) return;
      socket.emit("cue:shoot", { roomId: activeRoomId, power, angle });
    },
    [socket, activeRoomId]
  );

  const computeDrag = useCallback((clientX: number, clientY: number) => {
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
  }, []);

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
    <div className="billiards__controller">
      <div className="billiards__controller-header">
        <div className="billiards__controller-title">Billiards Controller</div>
        <div className="billiards__controller-subtitle">
          Потяни шар, чтобы прицелиться. Отпусти, чтобы ударить.
        </div>
      </div>

      <div
        ref={surfaceRef}
        className="billiards__controller-surface фыв"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerLeave={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div className="billiards__controller-ball" />

        {dragState.power > 0 && (
          <div
            className="billiards__controller-arrow"
            style={{
              transform: `translate(-50%, -50%) rotate(${arrowAngleDeg}deg)`,
              opacity: Math.max(0.4, dragState.power),
            }}
          >
            <div
              className="billiards__controller-arrow-line"
              style={{ width: arrowLength }}
            />
            <div className="billiards__controller-arrow-head" />
          </div>
        )}

        {dragState.active && (
          <div
            className="billiards__controller-drag-indicator"
            style={{
              top: `calc(50% + ${dragState.y}px)`,
              left: `calc(50% + ${dragState.x}px)`,
            }}
          />
        )}
      </div>
    </div>
  );
};
