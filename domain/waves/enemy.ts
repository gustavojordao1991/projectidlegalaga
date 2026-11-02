import { BigNumber } from '../math/bignum.ts';
import type { EnemyDefinition } from './enemies.config.ts';
import { getEnemyById } from './enemies.config.ts';

export type EnemyFlightState = 'ENTERING' | 'IN_FORMATION' | 'DIVING' | 'DEAD';

/**
 * Entidade Inimigo Alienígena no combate de Galaga Idle.
 * Suporta estados de voo Galaga, escalonamento e física de knockback por Sonic Wave.
 */
export class Enemy {
  public readonly definition: EnemyDefinition;
  public health: BigNumber;
  public maxHealth: BigNumber;
  public damage: BigNumber;

  public x: number;
  public y: number;
  public gridRow: number;
  public gridCol: number;

  public flightState: EnemyFlightState = 'ENTERING';
  public entryProgress = 0;
  public diveProgress = 0;
  public isAlive = true;

  public constructor(
    enemyId: string,
    initialX: number,
    initialY: number,
    gridRow: number,
    gridCol: number,
    waveMultiplier: BigNumber = BigNumber.ONE
  ) {
    this.definition = getEnemyById(enemyId);
    this.maxHealth = BigNumber.from(this.definition.baseHealth).mul(waveMultiplier);
    this.health = this.maxHealth;
    this.damage = BigNumber.from(this.definition.baseDamage).mul(waveMultiplier);

    this.x = initialX;
    this.y = initialY;
    this.gridRow = gridRow;
    this.gridCol = gridCol;
  }

  public get isBoss(): boolean {
    return this.definition.isBoss;
  }

  public get isDiving(): boolean {
    return this.flightState === 'DIVING';
  }

  public takeDamage(damage: BigNumber): boolean {
    if (!this.isAlive || damage.isZero()) return false;

    if (this.health.lte(damage)) {
      this.health = BigNumber.ZERO;
      this.isAlive = false;
      this.flightState = 'DEAD';
      return true; // Morreu neste golpe
    }

    this.health = this.health.sub(damage);
    return false;
  }

  public applyKnockback(force: number, minY = 40): void {
    if (!this.isAlive || force <= 0) return;

    // A onda empurra o alienígena para cima (afastando-o da nave)
    const displacement = force * 0.4;
    this.y = Math.max(minY, this.y - displacement);

    // Se estava em mergulho, o impacto desacelera o avanço do mergulho
    if (this.flightState === 'DIVING') {
      this.diveProgress = Math.max(0, this.diveProgress - 0.15);
    }
  }

  public startDive(): void {
    if (this.flightState === 'IN_FORMATION') {
      this.flightState = 'DIVING';
      this.diveProgress = 0;
    }
  }

  public returnToFormation(): void {
    this.flightState = 'IN_FORMATION';
    this.diveProgress = 0;
  }
}
