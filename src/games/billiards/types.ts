export type BallRender = { fill: string; stroke?: string };

export type BilliardsBallState = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  render: BallRender;
};

export type BilliardsState = {
  balls: BilliardsBallState[];
  timestamp: number;
  running: boolean;
};
