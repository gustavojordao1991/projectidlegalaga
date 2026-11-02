import { BigNumber } from '../math/bignum.ts';
import type { ShipHullDefinition } from './combat-types.ts';
import { getShipHullById } from './ships.config.ts';
import { getWeaponById } from './weapons.config.ts';
import { ProjectilePool } from './projectile-pool.ts';
import { Projectile } from './projectile.ts';

/**
 * Entidade da Nave do Jogador (PlayerShip) no combate arcade de Galaga Idle.
 */
export class Ship {
  public readonly hull: ShipHullDefinition;
  public currentHealth: BigNumber;
  public maxHealth: BigNumber;
  public currentShield: BigNumber;
  public maxShield: BigNumber;
  public baseDamage: BigNumber;

  public x: number;
  public y: number;
  public activeWeaponId: string;
  public fireCooldownTimer = 0;

  public constructor(
    hullId = 'CORVETTE_ALPHA',
    initialX = 200,
    initialY = 700,
    baseDamage = BigNumber.from(25)
  ) {
    this.hull = getShipHullById(hullId);
    this.maxHealth = BigNumber.from(this.hull.baseMaxHealth);
    this.currentHealth = this.maxHealth;
    this.maxShield = BigNumber.from(this.hull.baseMaxShield);
    this.currentShield = this.maxShield;
    this.baseDamage = baseDamage;

    this.x = initialX;
    this.y = initialY;
    this.activeWeaponId = this.hull.defaultWeaponId;
  }

  public moveTowards(targetX: number, dt: number, minX = 20, maxX = 460): void {
    const dx = targetX - this.x;
    if (Math.abs(dx) < 1) return;

    const maxMove = this.hull.speedPxPerSec * dt;
    const step = Math.sign(dx) * Math.min(Math.abs(dx), maxMove);
    this.x = Math.max(minX, Math.min(maxX, this.x + step));
  }

  public teleport(newX: number, minX = 20, maxX = 460): void {
    this.x = Math.max(minX, Math.min(maxX, newX));
  }

  public update(dt: number): void {
    if (this.fireCooldownTimer > 0) {
      this.fireCooldownTimer = Math.max(0, this.fireCooldownTimer - dt);
    }

    // Regeneração passiva de escudo
    if (this.currentShield.lt(this.maxShield)) {
      const regenAmount = BigNumber.from(this.hull.shieldRegenPerSec * dt);
      const nextShield = this.currentShield.add(regenAmount);
      this.currentShield = nextShield.gt(this.maxShield) ? this.maxShield : nextShield;
    }
  }

  public canFire(): boolean {
    return this.fireCooldownTimer <= 0;
  }

  public fire(pool: ProjectilePool): readonly Projectile[] {
    if (!this.canFire()) return [];

    const weapon = getWeaponById(this.activeWeaponId);
    this.fireCooldownTimer = 1.0 / weapon.fireRateHz;

    return pool.spawnFromWeapon(
      this.activeWeaponId,
      this.x,
      this.y - 12,
      this.baseDamage,
      true
    );
  }

  public takeDamage(damage: BigNumber): boolean {
    if (damage.isZero() || damage.isNegative()) return false;

    // Escudo absorve primeiro
    if (this.currentShield.gt(BigNumber.ZERO)) {
      if (this.currentShield.gte(damage)) {
        this.currentShield = this.currentShield.sub(damage);
        return false;
      }
      const remainingDamage = damage.sub(this.currentShield);
      this.currentShield = BigNumber.ZERO;
      return this.applyHealthDamage(remainingDamage);
    }

    return this.applyHealthDamage(damage);
  }

  public switchWeapon(weaponId: string): void {
    this.activeWeaponId = weaponId;
    this.fireCooldownTimer = 0;
  }

  public isDestroyed(): boolean {
    return this.currentHealth.isZero() || this.currentHealth.isNegative();
  }

  private applyHealthDamage(damage: BigNumber): boolean {
    if (this.currentHealth.lte(damage)) {
      this.currentHealth = BigNumber.ZERO;
      return true; // Nave destruída
    }
    this.currentHealth = this.currentHealth.sub(damage);
    return false;
  }
}
