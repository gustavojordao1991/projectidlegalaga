export interface EnemyTargetData {
  readonly x: number;
  readonly y: number;
  readonly isBoss: boolean;
  readonly isDiving: boolean;
  readonly isAlive: boolean;
}

export interface IncomingProjectileData {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly isActive: boolean;
}

export interface TacticalDecision {
  readonly targetX: number;
  readonly shouldFire: boolean;
  readonly isEvading: boolean;
}

/**
 * IA Tática Heurística do Piloto Automático de Galaga Idle.
 * Priorização de alvos O(1) e evasão de projéteis/mergulhos.
 */
export class TacticalPilotAI {
  private static readonly DANGER_DISTANCE_Y = 180;
  private static readonly DANGER_DISTANCE_X = 40;
  private static readonly EVASION_STEP = 60;

  public static decide(
    shipX: number,
    shipY: number,
    enemies: readonly EnemyTargetData[],
    threats: readonly IncomingProjectileData[],
    minX = 20,
    maxX = 460
  ): TacticalDecision {
    const activeEnemies = enemies.filter((e) => e.isAlive);
    if (activeEnemies.length === 0) {
      return { targetX: shipX, shouldFire: false, isEvading: false };
    }

    // 1. Verificação de Ameaças Imediatas (Evasão prioritária)
    const immediateThreat = threats.find((t) => {
      if (!t.isActive || t.vy <= 0) return false;
      const dy = shipY - t.y;
      const dx = Math.abs(shipX - t.x);
      return dy > 0 && dy < this.DANGER_DISTANCE_Y && dx < this.DANGER_DISTANCE_X;
    });

    if (immediateThreat) {
      const evadeRight = immediateThreat.x <= shipX;
      const targetX = evadeRight
        ? Math.min(maxX, shipX + this.EVASION_STEP)
        : Math.max(minX, shipX - this.EVASION_STEP);

      return { targetX, shouldFire: true, isEvading: true };
    }

    // 2. Priorização Heurística de Alvo
    // Boss > Mergulho > Alvo mais alinhado no eixo X
    const boss = activeEnemies.find((e) => e.isBoss);
    if (boss) {
      return { targetX: boss.x, shouldFire: true, isEvading: false };
    }

    const diving = activeEnemies.find((e) => e.isDiving);
    if (diving) {
      return { targetX: diving.x, shouldFire: true, isEvading: false };
    }

    // Alvo mais próximo horizontalmente
    let bestTarget = activeEnemies[0]!;
    let smallestDx = Math.abs(bestTarget.x - shipX);

    for (const enemy of activeEnemies) {
      const dx = Math.abs(enemy.x - shipX);
      if (dx < smallestDx) {
        smallestDx = dx;
        bestTarget = enemy;
      }
    }

    return { targetX: bestTarget.x, shouldFire: true, isEvading: false };
  }
}
