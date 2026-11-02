import { BigNumber } from '../math/bignum.ts';

export interface ProjectileSpawnParams {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly damage: BigNumber;
  readonly weaponId: string;
  readonly isPlayer: boolean;
  readonly radius: number;
  readonly pierceCount: number;
  readonly knockbackForce: number;
  readonly lifespanSeconds: number;
}

/**
 * Entidade Projétil reaproveitável (Object Pooling para Zero GC).
 */
export class Projectile {
  public x = 0;
  public y = 0;
  public vx = 0;
  public vy = 0;
  public damage: BigNumber = BigNumber.ZERO;
  public weaponId = '';
  public isPlayer = true;
  public radius = 4;
  public pierceCount = 1;
  public knockbackForce = 0;
  public lifespanRemaining = 0;
  public isActive = false;

  public reset(params: ProjectileSpawnParams): void {
    this.x = params.x;
    this.y = params.y;
    this.vx = params.vx;
    this.vy = params.vy;
    this.damage = params.damage;
    this.weaponId = params.weaponId;
    this.isPlayer = params.isPlayer;
    this.radius = params.radius;
    this.pierceCount = params.pierceCount;
    this.knockbackForce = params.knockbackForce;
    this.lifespanRemaining = params.lifespanSeconds;
    this.isActive = true;
  }

  public update(dt: number, maxY: number, minY = -50): boolean {
    if (!this.isActive) return false;

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.lifespanRemaining -= dt;

    if (this.lifespanRemaining <= 0 || this.y < minY || this.y > maxY) {
      this.deactivate();
      return false;
    }

    return true;
  }

  public registerHit(): boolean {
    this.pierceCount -= 1;
    if (this.pierceCount <= 0) {
      this.deactivate();
      return false;
    }
    return true;
  }

  public deactivate(): void {
    this.isActive = false;
  }
}
