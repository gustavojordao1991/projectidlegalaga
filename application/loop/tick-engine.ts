import type {
  FastTickListener,
  SlowTickListener,
  TickEngineConfig,
} from './loop-types.ts';

/**
 * Motor desacoplado de Tick Duplo de Galaga Idle.
 * - Fast Loop (60 FPS): Combate em tempo real, trajetória das naves, disparos e colisões.
 * - Slow Loop (1 Hz): Acúmulo passivo idle, regeneração de escudos e timers de eventos.
 */
export class TickEngine {
  private readonly fastIntervalMs: number;
  private readonly slowIntervalMs: number;

  private fastTimer: ReturnType<typeof setInterval> | null = null;
  private slowTimer: ReturnType<typeof setInterval> | null = null;

  private isRunning = false;
  private isPaused = false;
  private lastFastTime = 0;
  private totalSlowElapsedSec = 0;

  private readonly fastListeners = new Set<FastTickListener>();
  private readonly slowListeners = new Set<SlowTickListener>();

  public constructor(config: TickEngineConfig = {}) {
    const fastHz = Math.max(1, config.fastHz ?? 60);
    const slowHz = Math.max(0.1, config.slowHz ?? 1);

    this.fastIntervalMs = Math.floor(1000 / fastHz);
    this.slowIntervalMs = Math.floor(1000 / slowHz);
  }

  public onFastTick(listener: FastTickListener): () => void {
    this.fastListeners.add(listener);
    return () => this.fastListeners.delete(listener);
  }

  public onSlowTick(listener: SlowTickListener): () => void {
    this.slowListeners.add(listener);
    return () => this.slowListeners.delete(listener);
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastFastTime = Date.now();

    this.fastTimer = setInterval(() => this.processFastTick(), this.fastIntervalMs);
    this.slowTimer = setInterval(() => this.processSlowTick(), this.slowIntervalMs);
  }

  public stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    if (this.fastTimer !== null) {
      clearInterval(this.fastTimer);
      this.fastTimer = null;
    }
    if (this.slowTimer !== null) {
      clearInterval(this.slowTimer);
      this.slowTimer = null;
    }
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    if (!this.isRunning) return;
    this.isPaused = false;
    this.lastFastTime = Date.now();
  }

  public step(fastDtSec: number, slowDtSec?: number): void {
    if (this.isPaused) return;

    this.notifyFastListeners(fastDtSec);

    if (slowDtSec !== undefined && slowDtSec > 0) {
      this.totalSlowElapsedSec += slowDtSec;
      this.notifySlowListeners(slowDtSec, this.totalSlowElapsedSec);
    }
  }

  private processFastTick(): void {
    if (this.isPaused) return;
    const now = Date.now();
    const dt = Math.max(0.001, (now - this.lastFastTime) / 1000);
    this.lastFastTime = now;
    this.notifyFastListeners(dt);
  }

  private processSlowTick(): void {
    if (this.isPaused) return;
    const dt = this.slowIntervalMs / 1000;
    this.totalSlowElapsedSec += dt;
    this.notifySlowListeners(dt, this.totalSlowElapsedSec);
  }

  private notifyFastListeners(dt: number): void {
    for (const listener of this.fastListeners) {
      listener(dt);
    }
  }

  private notifySlowListeners(dt: number, total: number): void {
    for (const listener of this.slowListeners) {
      listener(dt, total);
    }
  }

  public getActiveState(): { isRunning: boolean; isPaused: boolean } {
    return { isRunning: this.isRunning, isPaused: this.isPaused };
  }
}
