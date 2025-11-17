import React from "react";
import { Application, extend } from "@pixi/react";
import { Container as PixiContainer, Graphics as PixiGraphics } from "pixi.js";

import { useBilliardsScreenLogic } from "../logic/useBilliardsScreenLogic";
import { PerformanceStatsWidget } from "../../../widgets/fps-stats/PerformanceStatsWidget";
import type { GameScreenProps } from "../../../shared/types/gameTypes";

extend({
  Container: PixiContainer,
  Graphics: PixiGraphics,
});

export const BilliardsScreen: React.FC<GameScreenProps> = ({ roomId }) => {
  const {
    wrapperRef,
    canvasSize,
    pointerHandlers,
    drawCallback,
    performanceStats,
  } = useBilliardsScreenLogic(roomId);

  return (
    <div
      ref={wrapperRef}
      className="wrapper"
      style={{
        width: "100%",
        height: "100dvh",
        backgroundColor: "green",
        position: "relative",
      }}
      {...pointerHandlers}
    >
      <Application
        width={canvasSize.width}
        height={canvasSize.height}
        background={"#0b5155"}
      >
        <pixiContainer
          x={canvasSize.width / 2}
          y={canvasSize.height / 2}
        >
          <pixiGraphics draw={drawCallback} />
        </pixiContainer>
      </Application>
      <PerformanceStatsWidget stats={performanceStats} />
    </div>
  );
};
