import React from "react";
import type { CSSProperties } from "react";
import type { SimulationPerformanceStats } from "./useSimulationPerformanceMonitor";


type PerformanceStatsWidgetProps = {
  stats?: SimulationPerformanceStats;
  className?: string;
  style?: CSSProperties;
  title?: string;
};

const defaultWrapperStyle: CSSProperties = {
  position: "absolute",
  top: 12,
  left: 12,
  padding: "8px 10px",
  borderRadius: 6,
  backgroundColor: "rgba(0, 0, 0, 0.65)",
  color: "#fff",
  fontFamily: "monospace",
  fontSize: 12,
  lineHeight: 1.4,
  minWidth: 140,
  pointerEvents: "none",
};

export const PerformanceStatsWidget: React.FC<PerformanceStatsWidgetProps> = ({
  stats,
  className,
  style,
  title = "performance",
}) => {
  const appliedStats = stats ?? {
    fps: 0,
    physicsAvgMs: 0,
    renderAvgMs: 0,
    subStepsAvg: 0,
  };

  return (
    <div style={{ ...defaultWrapperStyle, ...style }} className={className}>
      <div>{title}</div>
      <div>fps: {appliedStats.fps.toFixed(1)}</div>
      <div>physics: {appliedStats.physicsAvgMs.toFixed(2)} ms</div>
      <div>render: {appliedStats.renderAvgMs.toFixed(2)} ms</div>
      <div>substeps: {appliedStats.subStepsAvg.toFixed(2)}</div>
    </div>
  );
};

