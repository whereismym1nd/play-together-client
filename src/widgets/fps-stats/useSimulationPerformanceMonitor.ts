import { useCallback, useRef, useState } from "react";

import type { SimulationMetrics } from "../../shared/simulation/createSimulationLoop";

const nowMs = () =>
  typeof performance === "undefined" ? Date.now() : performance.now();

export type SimulationPerformanceStats = {
  fps: number;
  physicsAvgMs: number;
  renderAvgMs: number;
  subStepsAvg: number;
};

const INITIAL_STATS: SimulationPerformanceStats = {
  fps: 0,
  physicsAvgMs: 0,
  renderAvgMs: 0,
  subStepsAvg: 0,
};

export function useSimulationPerformanceMonitor(updateIntervalMs = 500) {
  const [stats, setStats] = useState<SimulationPerformanceStats>(INITIAL_STATS);

  const framesRef = useRef(0);
  const physicsSumRef = useRef(0);
  const renderSumRef = useRef(0);
  const subStepsSumRef = useRef(0);
  const deltaSumRef = useRef(0);
  const lastUpdateRef = useRef(nowMs());

  const reportSample = useCallback(
    (metrics: SimulationMetrics) => {
      framesRef.current += 1;
      physicsSumRef.current += metrics.physicsMs;
      renderSumRef.current += metrics.renderMs;
      subStepsSumRef.current += metrics.subSteps;
      deltaSumRef.current += metrics.deltaMs;

      const now = nowMs();
      if (now - lastUpdateRef.current < updateIntervalMs) {
        return;
      }

      const frameCount = Math.max(framesRef.current, 1);
      const deltaMs = Math.max(deltaSumRef.current, 1);

      setStats({
        fps: (frameCount / deltaMs) * 1000,
        physicsAvgMs: physicsSumRef.current / frameCount,
        renderAvgMs: renderSumRef.current / frameCount,
        subStepsAvg: subStepsSumRef.current / frameCount,
      });

      framesRef.current = 0;
      physicsSumRef.current = 0;
      renderSumRef.current = 0;
      subStepsSumRef.current = 0;
      deltaSumRef.current = 0;
      lastUpdateRef.current = now;
    },
    [updateIntervalMs]
  );

  return { stats, reportSample };
}

