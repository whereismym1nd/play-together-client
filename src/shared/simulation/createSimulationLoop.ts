export type SimulationLoop = {
  start: () => void;
  stop: () => void;
  isRunning: () => boolean;
};

export type SimulationMetrics = {
  deltaMs: number;
  physicsMs: number;
  renderMs: number;
  subSteps: number;
};

export type SimulationOptions<TWorld> = {
  // �?�?���?���'�? �?��? (���>���?��, �?�?�?�� �?�+�?���', �ؑ'�? �?�?�?�?�?�?)
  createWorld: () => TWorld;

  // �?�?��? �?��?�?�>�?�Ő�?�?�?�<�� �?���? (�?�+�<�ؐ?�? world.step)
  step: (world: TWorld, dt: number) => void;

  // �?�'�?��?�?�?���
  render?: (world: TWorld) => void;

  // �"���?��?�?�?���?�?�<�� �?���? �? �?���?�?�?���: (1/60 ���? �?�?�?�>�ؐ��?��?)
  fixedDelta?: number;

  // �?����?��?�?�? ���?�?�?���?�?�? ���� ����?�? (���?�'��-�>���?)
  maxSubSteps?: number;

  // �?���Ő�?�?���>�?�?�<�� �:�?���
  onStart?: (world: TWorld) => void;
  onStop?: (world: TWorld) => void;
  onMetrics?: (metrics: SimulationMetrics) => void;
};

const nowMs = () =>
  typeof performance === "undefined" ? Date.now() : performance.now();

export function createSimulationLoop<TWorld>(
  options: SimulationOptions<TWorld>
): SimulationLoop {
  const {
    createWorld,
    step,
    render,
    fixedDelta = 1 / 60,
    maxSubSteps = 5,
    onStart,
    onStop,
    onMetrics,
  } = options;

  let world: TWorld | null = null;
  let frameId: number | null = null;
  let lastTime: number | null = null;
  let accumulator = 0;
  let running = false;

  const loop = (time: number) => {
    if (!running || !world) return;

    if (lastTime == null) {
      lastTime = time;
    }
    const dt = (time - lastTime) / 1000;
    lastTime = time;

    accumulator += dt;

    // �?��?��?�>�?��? ���?�?�?���?�?�? ���?�� �>���?��, �ؑ'�?�+�< �?�� �?�����?��:���>���?�? �"�������
    let subSteps = 0;
    let physicsMs = 0;
    while (accumulator >= fixedDelta && subSteps < maxSubSteps) {
      const stepStart = nowMs();
      step(world, fixedDelta);
      physicsMs += nowMs() - stepStart;
      accumulator -= fixedDelta;
      subSteps++;
    }

    let renderMs = 0;
    if (render) {
      const renderStart = nowMs();
      render(world);
      renderMs = nowMs() - renderStart;
    }

    if (onMetrics) {
      onMetrics({
        deltaMs: dt * 1000,
        physicsMs,
        renderMs,
        subSteps,
      });
    }

    frameId = requestAnimationFrame(loop);
  };

  const start = () => {
    if (running) return;
    running = true;
    world = createWorld();
    accumulator = 0;
    lastTime = null;
    if (onStart && world) onStart(world);
    frameId = requestAnimationFrame(loop);
  };

  const stop = () => {
    if (!running) return;
    running = false;
    if (frameId != null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
    if (onStop && world) onStop(world);
    world = null;
  };

  return {
    start,
    stop,
    isRunning: () => running,
  };
}

