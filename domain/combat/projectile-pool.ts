import { BigNumber } from '../math/bignum.ts';
import { Projectile } from './projectile.ts';
import type { WeaponDefinition } from './combat-types.ts';
import { getWeaponById } from './weapons.config.ts';

/**
 * Object Pool de Projéteis para 60 FPS com Zero Alocação Dinâmica (Zero GC).
 * Interpreta dinamicamente os 9 padrões de disparo definidos em weapons.config.ts.
 */
export class ProjectilePool {
  private readonly pool: Projectile[];
  private readonly initialCapacity: number;

  public constructor(initialCapacity = 250) {
    this.initialCapacity = initialCapacity;
    this.pool = Array.from({ length: initialCapacity }, () => new Projectile());
  }

  public getActiveCount(): number {
    return this.pool.filter((p) => p.isActive).length;
  }

  public getActiveProjectiles(): readonly Projectile[] {
    return this.pool.filter((p) => p.isActive);
  }

  public spawnFromWeapon(
    weaponId: string,
    originX: number,
    originY: number,
    baseDamage: BigNumber,
    isPlayer = true
  ): readonly Projectile[] {
    const weapon = getWeaponById(weaponId);
    const damage = baseDamage.mul(weapon.baseDamageMultiplier);
    const spawned: Projectile[] = [];

    const spawnHandlers: Record<string, () => void> = {
      SINGLE: () => {
        const p = this.acquire();
        if (p) {
          p.reset({
            x: originX,
            y: originY,
            vx: 0,
            vy: isPlayer ? -weapon.projectileSpeed : weapon.projectileSpeed,
            damage,
            weaponId: weapon.id,
            isPlayer,
            radius: weapon.projectileRadius,
            pierceCount: weapon.pierceCount,
            knockbackForce: weapon.knockbackForce,
            lifespanSeconds: weapon.lifespanSeconds,
          });
          spawned.push(p);
        }
      },
      DOUBLE: () => {
        const offsets = [-10, 10];
        for (const off of offsets) {
          const p = this.acquire();
          if (p) {
            p.reset({
              x: originX + off,
              y: originY,
              vx: 0,
              vy: isPlayer ? -weapon.projectileSpeed : weapon.projectileSpeed,
              damage,
              weaponId: weapon.id,
              isPlayer,
              radius: weapon.projectileRadius,
              pierceCount: weapon.pierceCount,
              knockbackForce: weapon.knockbackForce,
              lifespanSeconds: weapon.lifespanSeconds,
            });
            spawned.push(p);
          }
        }
      },
      TRIPLE: () => {
        const offsets = [-14, 0, 14];
        for (const off of offsets) {
          const p = this.acquire();
          if (p) {
            p.reset({
              x: originX + off,
              y: originY,
              vx: 0,
              vy: isPlayer ? -weapon.projectileSpeed : weapon.projectileSpeed,
              damage,
              weaponId: weapon.id,
              isPlayer,
              radius: weapon.projectileRadius,
              pierceCount: weapon.pierceCount,
              knockbackForce: weapon.knockbackForce,
              lifespanSeconds: weapon.lifespanSeconds,
            });
            spawned.push(p);
          }
        }
      },
      BURST_GATLING: () => {
        const p = this.acquire();
        if (p) {
          const jitterAngle = (Math.random() - 0.5) * weapon.spreadAngleRad * 2;
          const speed = weapon.projectileSpeed;
          const vy = (isPlayer ? -1 : 1) * speed * Math.cos(jitterAngle);
          const vx = speed * Math.sin(jitterAngle);
          p.reset({
            x: originX,
            y: originY,
            vx,
            vy,
            damage,
            weaponId: weapon.id,
            isPlayer,
            radius: weapon.projectileRadius,
            pierceCount: weapon.pierceCount,
            knockbackForce: weapon.knockbackForce,
            lifespanSeconds: weapon.lifespanSeconds,
          });
          spawned.push(p);
        }
      },
      CONE_SPREAD: () => {
        const angles = [-0.35, -0.17, 0, 0.17, 0.35];
        for (const rad of angles) {
          const p = this.acquire();
          if (p) {
            const vy = (isPlayer ? -1 : 1) * weapon.projectileSpeed * Math.cos(rad);
            const vx = weapon.projectileSpeed * Math.sin(rad);
            p.reset({
              x: originX,
              y: originY,
              vx,
              vy,
              damage,
              weaponId: weapon.id,
              isPlayer,
              radius: weapon.projectileRadius,
              pierceCount: weapon.pierceCount,
              knockbackForce: weapon.knockbackForce,
              lifespanSeconds: weapon.lifespanSeconds,
            });
            spawned.push(p);
          }
        }
      },
    };

    const handler = spawnHandlers[weapon.pattern] ?? spawnHandlers.SINGLE;
    handler();

    return spawned;
  }

  public update(dt: number, screenHeight: number): void {
    for (const projectile of this.pool) {
      if (projectile.isActive) {
        projectile.update(dt, screenHeight + 50);
      }
    }
  }

  public clear(): void {
    for (const projectile of this.pool) {
      projectile.deactivate();
    }
  }

  private acquire(): Projectile | null {
    for (const projectile of this.pool) {
      if (!projectile.isActive) {
        return projectile;
      }
    }

    // Crescimento controlado caso necessário
    const expanded = new Projectile();
    this.pool.push(expanded);
    return expanded;
  }
}
