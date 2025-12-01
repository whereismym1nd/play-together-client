import { useEffect, type RefObject, useRef } from "react";
import * as planck from "planck";
import {
  createSimulationLoop,
  type SimulationLoop,
  type SimulationMetrics,
} from "./createSimulationLoop";


export type UsePlanckSimulationOptions = {
  createWorld: () => planck.World;
  step?: (world: planck.World, dt: number) => void;
  renderWorld: (world: planck.World) => void;
  fixedDelta?: number;
  maxSubSteps?: number;
  renderFps?: number;
  onMetrics?: (metrics: SimulationMetrics) => void;
};

/**
 * Общий хук для симуляции Planck без знания о Canvas/Pixi.
 * Ты сам решаешь, как рендерить мир в renderWorld.
 */
export function usePlanckSimulation({
  createWorld,
  renderWorld,
  step,
  fixedDelta = 1 / 60,
  maxSubSteps = 5,
  renderFps,
  onMetrics,
}: UsePlanckSimulationOptions) {
  const simRef = useRef<SimulationLoop | null>(null);

  useEffect(() => {
    simRef.current = createSimulationLoop<planck.World>({
      createWorld,
      step: (world, dt) => {
        if (step) {
          step(world, dt);
        } else {
          world.step(dt);
        }
      },
      render: (() => {
        if (!renderFps) return (world: planck.World) => renderWorld(world);
        let lastRender = 0;
        const minInterval = 1000 / renderFps;
        return (world: planck.World) => {
          const now = performance.now();
          if (now - lastRender < minInterval) return;
          lastRender = now;
          renderWorld(world);
        };
      })(),
      onMetrics,
      fixedDelta,
      maxSubSteps,
    });

    simRef.current.start();

    return () => {
      simRef.current?.stop();
      simRef.current = null;
    };
  }, [createWorld, renderWorld, step, fixedDelta, maxSubSteps, onMetrics]);

  return simRef;
}

/* -------------------------------------------------------------------------- */
/*                            Canvas-специфичная версия                        */
/* -------------------------------------------------------------------------- */

export type UsePlanckCanvasSimulationOptions = {
  canvasRef: RefObject<HTMLCanvasElement>;
  createWorld: () => planck.World;
  renderWorld: (ctx: CanvasRenderingContext2D, world: planck.World) => void;
  width: number;
  height: number;
  step?: (world: planck.World, dt: number) => void;
  fixedDelta?: number;
  maxSubSteps?: number;
  onMetrics?: (metrics: SimulationMetrics) => void;
};

/**
 * Хук именно под Canvas 2D.
 * Внутри создаёт ctx, настраивает размер canvas и использует общий usePlanckSimulation.
 */
export function usePlanckCanvasSimulation({
  canvasRef,
  createWorld,
  renderWorld,
  width,
  height,
  step,
  fixedDelta = 1 / 60,
  maxSubSteps = 5,
  onMetrics,
}: UsePlanckCanvasSimulationOptions) {
  const simRef = useRef<SimulationLoop | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    simRef.current = createSimulationLoop<planck.World>({
      createWorld,
      step: (world, dt) => {
        if (step) {
          step(world, dt);
        } else {
          world.step(dt);
        }
      },
      render: (world) => {
        renderWorld(ctx, world);
      },
      onMetrics,
      fixedDelta,
      maxSubSteps,
    });

    simRef.current.start();

    return () => {
      simRef.current?.stop();
      simRef.current = null;
    };
  }, [
    canvasRef,
    width,
    height,
    createWorld,
    renderWorld,
    step,
    fixedDelta,
    maxSubSteps,
    onMetrics,
  ]);

  return simRef;
}
