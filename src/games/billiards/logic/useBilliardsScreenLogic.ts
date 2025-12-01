import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { Graphics as PixiGraphics } from "pixi.js";
import * as planck from "planck";

import { createBilliardsWorld } from "../model/billiardsWorld";
import { drawBilliardsWorldPixi } from "../view/billiardsRenderer";
import { usePlanckSimulation } from "../../../shared/simulation/usePlankCanvasSimulation";
import { BALL_R, MAX_PULL, SCALE } from "../config";
import { useSimulationPerformanceMonitor } from "../../../widgets/fps-stats/useSimulationPerformanceMonitor";
import { useRoomConnection } from "@/features/rooms";

type PointerHandlers = {
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerLeave: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
};

export function useBilliardsScreenLogic(roomId: string) {
  const worldRef = useRef<planck.World | null>(null);
  const cueBallRef = useRef<planck.Body | null>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const parentRectRef = useRef<DOMRect | null>(null);
  const graphicsRef = useRef<PixiGraphics | null>(null);
  const aimStateRef = useRef<{ active: boolean; pointer: { x: number; y: number } | null }>({
    active: false,
    pointer: null,
  });
  const { stats: performanceStats, reportSample } = useSimulationPerformanceMonitor();
  const { socket } = useRoomConnection();
  useEffect(() => {
    // Reset aim state when switching rooms to avoid leaking input between sessions.
    aimStateRef.current = { active: false, pointer: null };
  }, [roomId]);

  const isAllowToShoot = useCallback(() => {
    const cueBall = cueBallRef.current;
    const velocity = cueBall?.getLinearVelocity();
    if (!velocity) return false;

    const speed = velocity.length();
    return speed < 0.1;
  }, []);

  const updateAimState = useCallback(
    (
      next:
        | { active: boolean; pointer: { x: number; y: number } | null }
        | ((
          previous: { active: boolean; pointer: { x: number; y: number } | null }
        ) => { active: boolean; pointer: { x: number; y: number } | null })
    ) => {
      const resolved =
        typeof next === "function"
          ? (next as (previous: { active: boolean; pointer: { x: number; y: number } | null }) => {
            active: boolean;
            pointer: { x: number; y: number } | null;
          })(aimStateRef.current)
          : next;
      aimStateRef.current = resolved;
    },
    []
  );

  const calculateCanvasSize = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    return { width, height };
  }, []);

  const [canvasSize, setCanvasSize] = useState(calculateCanvasSize);

  const refreshParentRect = useCallback(() => {
    if (parentRef.current) {
      parentRectRef.current = parentRef.current.getBoundingClientRect();
    }
  }, []);

  const updateCanvasSize = useCallback(() => {
    setCanvasSize(calculateCanvasSize());
    refreshParentRect();
  }, [calculateCanvasSize, refreshParentRect]);

  useEffect(() => {
    refreshParentRect();
    window.addEventListener("resize", updateCanvasSize);
    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [updateCanvasSize, refreshParentRect]);

  const createWorldInstance = useCallback(() => {
    const { world, cueBallBody } = createBilliardsWorld();
    worldRef.current = world;
    cueBallRef.current = cueBallBody;
    return world;
  }, []);

  const resolveCueBall = useCallback(() => {
    const world = worldRef.current;
    if (!world) return null;
    for (let body = world.getBodyList(); body; body = body.getNext()) {
      const data = body.getUserData() as { type?: string; isCue?: boolean; render?: { fill?: string } } | undefined;
      if (data?.type === "ball" && (data.isCue || data.render?.fill === "white")) {
        cueBallRef.current = body;
        return body;
      }
    }
    cueBallRef.current = null;
    return null;
  }, []);

  const drawWorld = useCallback(
    (graphics: PixiGraphics | null, world: planck.World | null) => {
      if (!graphics || !world) return;
      const cuePos = resolveCueBall()?.getPosition();
      const aimState = aimStateRef.current;
      const aimOverlay =
        cuePos && aimState.active && aimState.pointer
          ? { cuePosition: { x: cuePos.x, y: cuePos.y }, pointer: aimState.pointer, MAX_PULL }
          : undefined;
      drawBilliardsWorldPixi(graphics, world, aimOverlay);
    },
    []
  );

  const setAimFromDirection = useCallback(
    (power: number, angle: number) => {
      const cueBall = resolveCueBall();
      if (!cueBall) return;
      const normalized = Math.max(0, Math.min(1, power));

      if (normalized <= 0) {
        aimStateRef.current = { active: false, pointer: null };
      } else {
        const cuePos = cueBall.getPosition();
        const distance = normalized * MAX_PULL;
        const dirX = Math.cos(angle);
        const dirY = Math.sin(angle);
        aimStateRef.current = {
          active: true,
          pointer: {
            x: cuePos.x - dirX * distance,
            y: cuePos.y - dirY * distance,
          },
        };
      }

      drawWorld(graphicsRef.current, worldRef.current);
    },
    [drawWorld]
  );

  const applyShotFromDirection = useCallback(
    (power: number, angle: number) => {
      const cueBall = resolveCueBall();
      if (!cueBall) return;
      if (!isAllowToShoot()) return;
      const normalized = Math.max(0, Math.min(1, power));
      if (normalized <= 0) return;

      const dirX = Math.cos(angle);
      const dirY = Math.sin(angle);
      const clamped = normalized * MAX_PULL;
      const impulseMagnitude = clamped * 2;

      cueBall.setLinearVelocity(new planck.Vec2(0, 0));
      cueBall.setAngularVelocity(0);
      cueBall.applyLinearImpulse(
        new planck.Vec2(dirX * impulseMagnitude, dirY * impulseMagnitude),
        cueBall.getWorldCenter(),
        true
      );

      aimStateRef.current = { active: false, pointer: null };
      drawWorld(graphicsRef.current, worldRef.current);
    },
    [drawWorld, isAllowToShoot]
  );

  const renderWorldInstance = useCallback(
    (world: planck.World) => {
      worldRef.current = world;
      drawWorld(graphicsRef.current, world);
    },
    [drawWorld]
  );

  usePlanckSimulation({
    createWorld: createWorldInstance,
    renderWorld: renderWorldInstance,
    onMetrics: reportSample,
  });

  const clientToWorld = useCallback(
    (clientX: number, clientY: number) => {
      const rect = parentRectRef.current;
      if (!rect) return null;
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;
      const x = (localX - canvasSize.width / 2) / SCALE;
      const y = (localY - canvasSize.height / 2) / SCALE;
      return { x, y };
    },
    [canvasSize]
  );

  const applyShot = useCallback(() => {
    const cueBall = resolveCueBall();
    const pointer = aimStateRef.current.pointer;
    if (!cueBall || !pointer) return;

    const cuePos = cueBall.getPosition();
    const dx = cuePos.x - pointer.x;
    const dy = cuePos.y - pointer.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 0.01) return;

    const clamped = Math.min(distance, MAX_PULL);
    const power = clamped * 2;
    const impulse = new planck.Vec2((dx / distance) * power, (dy / distance) * power);

    cueBall.setLinearVelocity(new planck.Vec2(0, 0));
    cueBall.setAngularVelocity(0);
    cueBall.applyLinearImpulse(impulse, cueBall.getWorldCenter(), true);
  }, []);

  const finishAim = useCallback(() => {
    if (!aimStateRef.current.active) return;
    applyShot();
    updateAimState({ active: false, pointer: null });
  }, [applyShot, updateAimState]);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isAllowToShoot()) return;
      const cueBall = resolveCueBall();
      if (!cueBall) return;
      refreshParentRect();
      const pointer = clientToWorld(event.clientX, event.clientY);
      if (!pointer) return;

      const cuePos = cueBall.getPosition();
      const dx = pointer.x - cuePos.x;
      const dy = pointer.y - cuePos.y;
      const distance = Math.hypot(dx, dy);

      if (distance <= BALL_R * 1.2) {
        cueBall.setLinearVelocity(planck.Vec2(0, 0));
        cueBall.setAngularVelocity(0);
        event.currentTarget.setPointerCapture(event.pointerId);
        updateAimState({ active: true, pointer });
      }
    },
    [clientToWorld, updateAimState, isAllowToShoot, refreshParentRect, resolveCueBall]
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isAllowToShoot()) return;
      if (!aimStateRef.current.active) return;
      refreshParentRect();
      const pointer = clientToWorld(event.clientX, event.clientY);
      if (!pointer) return;
      updateAimState((prev) => ({ ...prev, pointer }));
    },
    [clientToWorld, updateAimState, isAllowToShoot, refreshParentRect]
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      finishAim();
    },
    [finishAim]
  );

  const pointerHandlers: PointerHandlers = useMemo(
    () => ({
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerUp,
      onPointerCancel: handlePointerUp,
    }),
    [handlePointerDown, handlePointerMove, handlePointerUp]
  );

  const drawCallback = useCallback(
    (graphics: PixiGraphics) => {
      graphicsRef.current = graphics;
      drawWorld(graphics, worldRef.current);
    },
    [drawWorld]
  );

  useEffect(() => {
    if (!socket) return;
    const handleCueAim = (payload: { power: number; angle: number }) => {
      setAimFromDirection(payload.power, payload.angle);
    };
    const handleCueShoot = (payload: { power: number; angle: number }) => {
      applyShotFromDirection(payload.power, payload.angle);
    };

    socket.on("cue:aim", handleCueAim);
    socket.on("cue:shoot", handleCueShoot);

    return () => {
      socket.off("cue:aim", handleCueAim);
      socket.off("cue:shoot", handleCueShoot);
    };
  }, [socket, setAimFromDirection, applyShotFromDirection]);

  if (performance.now() % 5000 < 16) console.log('bodies', worldRef.current?.getBodyCount());

  return {
    wrapperRef: parentRef,
    canvasSize,
    pointerHandlers,
    drawCallback,
    performanceStats,
  };
}
