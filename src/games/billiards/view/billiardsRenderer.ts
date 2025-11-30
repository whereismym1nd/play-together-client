import * as planck from "planck";
import type { Graphics as PixiGraphics } from "pixi.js";
import { SCALE, TABLE_HEIGHT, TABLE_WIDTH } from "../config";

export type AimOverlay = {
  cuePosition: { x: number; y: number };
  pointer: { x: number; y: number };
  MAX_PULL: number;
};

type BallRender = { fill: string; stroke?: string };

type BallUserData = {
  type: "ball";
  render: BallRender;
};

export function drawBilliardsWorldPixi(
  g: PixiGraphics,
  world: planck.World,
  aimOverlay?: AimOverlay
) {
  g.clear();
  g.rect((-TABLE_WIDTH / 2) * SCALE, (-TABLE_HEIGHT / 2) * SCALE, TABLE_WIDTH * SCALE, TABLE_HEIGHT * SCALE);
  g.fill('#0b5133');

  // обходим все тела
  for (let body = world.getBodyList(); body; body = body.getNext()) {
    const bodyPos = body.getPosition();
    const bodyData = body.getUserData() as BallUserData | undefined;

    for (
      let fixture = body.getFixtureList();
      fixture;
      fixture = fixture.getNext()
    ) {
      const shape = fixture.getShape();
      const tag = fixture.getUserData();

      const type = shape.getType();

      if (type === "circle") {
        const circle = shape as planck.Circle;
        const localPos = circle.m_p;
        const x = (bodyPos.x + localPos.x) * SCALE;
        const y = (bodyPos.y + localPos.y) * SCALE;
        const r = circle.m_radius * SCALE;

        if (tag === "ball" && bodyData?.type === "ball") {
          const fillColor = bodyData.render.fill;

          g.circle(x, y, r);
          g.fill(fillColor);
        } else if (tag === "pocket") {
          g.circle(x, y, r);
          g.fill(0x000000);
        }
      } else if (type === "polygon") {
        const poly = shape as planck.Polygon;
        const vertices = poly.m_vertices;

        if (!vertices.length) continue;

        g.strokeStyle = {
          width: 0.03 * SCALE,
          color: 0x1d1d1d,
          alpha: 1
        };

        g.beginPath();
        const first = vertices[0];
        g.moveTo((bodyPos.x + first.x) * SCALE, (bodyPos.y + first.y) * SCALE);

        for (let i = 1; i < vertices.length; i++) {
          const v = vertices[i];
          g.lineTo((bodyPos.x + v.x) * SCALE, (bodyPos.y + v.y) * SCALE);
        }

        g.closePath();
        g.fill(0x0b5133);
        g.stroke();
      }
    }
  }

  if (aimOverlay) {
    const { cuePosition, pointer } = aimOverlay;
    const dirX = cuePosition.x - pointer.x;
    const dirY = cuePosition.y - pointer.y;
    const dirLength = Math.hypot(dirX, dirY);

    if (dirLength > 0.001) {
      const indicatorLength = Math.min(dirLength, aimOverlay.MAX_PULL);
      const targetX = cuePosition.x + (dirX / dirLength) * indicatorLength;
      const targetY = cuePosition.y + (dirY / dirLength) * indicatorLength;

      g.strokeStyle = {
        width: 0.02 * SCALE,
        color: 0xffffff,
        alpha: 0.9,
      };

      g.beginPath();
      g.moveTo(cuePosition.x * SCALE, cuePosition.y * SCALE);
      g.lineTo(targetX * SCALE, targetY * SCALE);
      g.stroke();

      g.circle(targetX * SCALE, targetY * SCALE, 0.025 * SCALE);
      g.fill(0xffffff);
    }
  }
}
