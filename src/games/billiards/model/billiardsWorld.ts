import * as planck from "planck";
import { BALL_R, POCKET_R, TABLE_HEIGHT, TABLE_WIDTH } from "../config";


type BallRender = { fill: string };
type BallUserData = { type: "ball"; render: BallRender };

export function createBilliardsWorld(): { world: planck.World; cueBallBody: planck.Body } {
  const pl = planck;
  const Vec2 = pl.Vec2;
  const MathPl = pl.Math;

  const SPI4 = MathPl.sin(Math.PI / 4);
  const SPI3 = MathPl.sin(Math.PI / 3);

  const COLORED = true;
  const BLACK: BallRender = { fill: "black" };
  const WHITE: BallRender = { fill: "white" };
  const COLORS: BallRender[] = [
    { fill: "#ffdd00" },
    { fill: "#ffdd00" },
    { fill: "#ff3300" },
    { fill: "#ff3300" },
    { fill: "#662200" },
    { fill: "#662200" },
    { fill: "#ff8800" },
    { fill: "#ff8800" },
    { fill: "#00bb11" },
    { fill: "#00bb11" },
    { fill: "#9900ff" },
    { fill: "#9900ff" },
    { fill: "#0077ff" },
    { fill: "#0077ff" },
  ];

  const world = new pl.World({});

  const scaleVec2 = (sx: number, sy: number) =>
    (v: planck.Vec2): planck.Vec2 =>
      new planck.Vec2(v.x * sx, v.y * sy);


  (pl as any).internal.Settings.velocityThreshold = 0;

  const railH = [
    new Vec2(POCKET_R, TABLE_HEIGHT * 0.5),
    new Vec2(POCKET_R, TABLE_HEIGHT * 0.5 + POCKET_R),
    new Vec2(
      TABLE_WIDTH * 0.5 - POCKET_R / SPI4 + POCKET_R,
      TABLE_HEIGHT * 0.5 + POCKET_R
    ),
    new Vec2(TABLE_WIDTH * 0.5 - POCKET_R / SPI4, TABLE_HEIGHT * 0.5),
  ];

  const railV = [
    new Vec2(TABLE_WIDTH * 0.5, -(TABLE_HEIGHT * 0.5 - POCKET_R / SPI4)),
    new Vec2(
      TABLE_WIDTH * 0.5 + POCKET_R,
      -(TABLE_HEIGHT * 0.5 - POCKET_R / SPI4 + POCKET_R)
    ),
    new Vec2(
      TABLE_WIDTH * 0.5 + POCKET_R,
      TABLE_HEIGHT * 0.5 - POCKET_R / SPI4 + POCKET_R
    ),
    new Vec2(TABLE_WIDTH * 0.5, TABLE_HEIGHT * 0.5 - POCKET_R / SPI4),
  ];

  const railFixDef: planck.FixtureOpt = {
    friction: 0.1,
    restitution: 0.9,
    userData: "rail",
  };

  const pocketFixDef: planck.FixtureOpt = {
    userData: "pocket",
  };

  const ballFixDef: planck.FixtureOpt = {
    friction: 0.1,
    restitution: 0.99,
    density: 1,
    userData: "ball",
  };

  const ballBodyDef: planck.BodyDef = {
    linearDamping: 1.5,
    angularDamping: 1,
    type: "dynamic",
    bullet: true,
  };

  // борта
  world
    .createBody()
    .createFixture(new planck.Polygon(railV.map(scaleVec2(+1, +1))), railFixDef);
  world
    .createBody()
    .createFixture(new planck.Polygon(railV.map(scaleVec2(-1, +1))), railFixDef);

  world
    .createBody()
    .createFixture(new planck.Polygon(railH.map(scaleVec2(+1, +1))), railFixDef);
  world
    .createBody()
    .createFixture(new planck.Polygon(railH.map(scaleVec2(-1, +1))), railFixDef);
  world
    .createBody()
    .createFixture(new planck.Polygon(railH.map(scaleVec2(+1, -1))), railFixDef);
  world
    .createBody()
    .createFixture(new planck.Polygon(railH.map(scaleVec2(-1, -1))), railFixDef);


  // лузы
  world
    .createBody()
    .createFixture(
      new planck.Circle(planck.Vec2(0, -TABLE_HEIGHT * 0.5 - POCKET_R * 1.5), POCKET_R),
      pocketFixDef
    );
  world
    .createBody()
    .createFixture(
      new planck.Circle(planck.Vec2(0, TABLE_HEIGHT * 0.5 + POCKET_R * 1.5), POCKET_R),
      pocketFixDef
    );

  world
    .createBody()
    .createFixture(
      new planck.Circle(
        new planck.Vec2(
          +TABLE_WIDTH * 0.5 + POCKET_R * 0.7,
          +TABLE_HEIGHT * 0.5 + POCKET_R * 0.7
        ),
        POCKET_R
      ),
      pocketFixDef
    );
  world
    .createBody()
    .createFixture(
      new planck.Circle(
        new planck.Vec2(
          -TABLE_WIDTH * 0.5 - POCKET_R * 0.7,
          +TABLE_HEIGHT * 0.5 + POCKET_R * 0.7
        ),
        POCKET_R
      ),
      pocketFixDef
    );

  world
    .createBody()
    .createFixture(
      new planck.Circle(
        new planck.Vec2(
          +TABLE_WIDTH * 0.5 + POCKET_R * 0.7,
          -TABLE_HEIGHT * 0.5 - POCKET_R * 0.7
        ),
        POCKET_R
      ),
      pocketFixDef
    );
  world
    .createBody()
    .createFixture(
      new planck.Circle(
        new planck.Vec2(
          -TABLE_WIDTH * 0.5 - POCKET_R * 0.7,
          -TABLE_HEIGHT * 0.5 - POCKET_R * 0.7
        ),
        POCKET_R
      ),
      pocketFixDef
    );

  const balls = rack(BALL_R, SPI3).map(
    (v) => new planck.Vec2(v.x + TABLE_WIDTH / 4, v.y)
  );
  balls.push({ x: -TABLE_WIDTH / 4, y: 0 } as planck.Vec2);

  if (COLORED) {
    shuffleArray(COLORS);
    for (let i = 0; i < COLORS.length; i++) {
      (balls[i] as any).render = COLORS[i];
    }
    (balls[14] as any).render = (balls[4] as any).render;
    (balls[4] as any).render = BLACK;
    (balls[balls.length - 1] as any).render = WHITE;
  }

  let cueBallBody: planck.Body | null = null;

  for (let i = 0; i < balls.length; i++) {
    const ballBody = world.createBody(ballBodyDef);
    ballBody.setPosition(balls[i] as planck.Vec2);

    const render = (balls[i] as any).render || WHITE;

    if (render.fill === "white") {
      cueBallBody = ballBody;
    }

    const fixture = ballBody.createFixture(new planck.Circle(BALL_R), ballFixDef);
    ballBody.setUserData({ type: "ball", render } satisfies BallUserData);
    fixture.setUserData("ball");
  }

  // попадание в лузу
  world.on("post-solve", (contact) => {
    const fA = contact.getFixtureA();
    const fB = contact.getFixtureB();
    const bA = fA.getBody();
    const bB = fB.getBody();

    const isPocketA = fA.getUserData() === "pocket";
    const isPocketB = fB.getUserData() === "pocket";
    const isBallA = fA.getUserData() === "ball";
    const isBallB = fB.getUserData() === "ball";

    let ballBody: planck.Body | null = null;

    if (isPocketA && isBallB) {
      ballBody = bB;
    } else if (isPocketB && isBallA) {
      ballBody = bA;
    }

    if (ballBody) {
      setTimeout(() => {
        world.destroyBody(ballBody!);
      }, 1);
    }
  });

  if (!cueBallBody) {
    throw new Error("Cue ball was not created");
  }

  return { world, cueBallBody };
}

function rack(r: number, SPI3: number): planck.Vec2[] {
  const n = 5;
  const balls: planck.Vec2[] = [];
  const d = r * 2;
  const l = SPI3 * d;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      balls.push(
        new planck.Vec2(
          i * l + Math.random() * r * 0.02,
          (j - i * 0.5) * d + Math.random() * r * 0.02
        )
      );
    }
  }
  return balls;
}

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}
