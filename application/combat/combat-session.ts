import { Ship } from '../../domain/combat/ship.ts';
import { ProjectilePool } from '../../domain/combat/projectile-pool.ts';
import { AutoPlayFuel } from '../../domain/ai/auto-play-fuel.ts';
import { TacticalPilotAI } from '../../domain/ai/tactical-pilot-ai.ts';
import { InStageEvolution } from '../../domain/instage/instage-evolution.ts';
import { WaveProgressionManager } from './wave-progression-manager.ts';
import { WaveSpawner } from '../../domain/waves/wave-spawner.ts';
import { Enemy } from '../../domain/waves/enemy.ts';
import { FormationMatrix } from '../../domain/waves/formation-matrix.ts';

/**
 * Orquestrador da Sessão de Combate em Tempo Real (60 FPS) de Galaga Idle.
 * Coordena controle manual, IA tática de Auto-Play, colisões e evolução in-stage.
 */
export class CombatSession {
  public readonly ship: Ship;
  public readonly projectilePool: ProjectilePool;
  public readonly autoPlayFuel: AutoPlayFuel;
  public readonly inStageEvolution: InStageEvolution;
  public readonly progressionManager: WaveProgressionManager;

  public enemies: Enemy[] = [];
  public isAutoPlayActive = false;
  public sessionElapsedTime = 0;

  private manualTargetX = 240;
  private isManualFiring = false;
  private readonly screenWidth: number;
  private readonly screenHeight: number;

  public constructor(screenWidth = 480, screenHeight = 800) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    this.ship = new Ship('CORVETTE_ALPHA', screenWidth / 2, screenHeight - 80);
    this.projectilePool = new ProjectilePool(200);
    this.autoPlayFuel = new AutoPlayFuel(1800);
    this.inStageEvolution = new InStageEvolution();
    this.progressionManager = new WaveProgressionManager(1, true);

    this.startCurrentWave();
  }

  public setManualInput(targetX: number, isFiring: boolean): void {
    this.manualTargetX = targetX;
    this.isManualFiring = isFiring;
  }

  public toggleAutoPlay(): boolean {
    if (!this.isAutoPlayActive && this.autoPlayFuel.hasFuel()) {
      this.isAutoPlayActive = true;
    } else {
      this.isAutoPlayActive = false;
    }
    return this.isAutoPlayActive;
  }

  public step(dt: number): void {
    this.sessionElapsedTime += dt;

    // 1. Processamento de Controle (Auto-Play vs. Manual)
    if (this.isAutoPlayActive) {
      this.processAutoPlay(dt);
    } else {
      this.processManual(dt);
    }

    // 2. Atualização da Nave do Jogador (Regeneração e cooldowns)
    this.ship.update(dt);

    // 3. Atualização das Formações e Inimigos
    this.updateEnemies(dt);

    // 4. Atualização dos Projéteis (Object Pool)
    this.projectilePool.update(dt, this.screenHeight);

    // 5. Verificação de Colisões Físicas
    this.resolveCollisions();

    // 6. Checagem de Conclusão da Onda
    this.checkWaveStatus();
  }

  private processAutoPlay(dt: number): void {
    const hasFuel = this.autoPlayFuel.consume(dt);
    if (!hasFuel) {
      this.isAutoPlayActive = false;
      return;
    }

    const decision = TacticalPilotAI.decide(
      this.ship.x,
      this.ship.y,
      this.enemies,
      [],
      20,
      this.screenWidth - 20
    );

    this.ship.moveTowards(decision.targetX, dt, 20, this.screenWidth - 20);

    if (decision.shouldFire && this.ship.canFire()) {
      this.ship.fire(this.projectilePool);
    }
  }

  private processManual(dt: number): void {
    this.ship.moveTowards(this.manualTargetX, dt, 20, this.screenWidth - 20);

    if (this.isManualFiring && this.ship.canFire()) {
      this.ship.fire(this.projectilePool);
    }
  }

  private updateEnemies(dt: number): void {
    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;

      if (enemy.flightState === 'ENTERING') {
        const slot = FormationMatrix.calculateTargetSlot(
          enemy.gridRow,
          enemy.gridCol,
          this.sessionElapsedTime
        );
        const res = FormationMatrix.updateEnteringEnemy(
          enemy.x,
          enemy.y,
          slot.x,
          slot.y,
          enemy.definition.baseSpeed,
          dt
        );
        enemy.x = res.x;
        enemy.y = res.y;
        if (res.arrived) enemy.flightState = 'IN_FORMATION';
      } else if (enemy.flightState === 'IN_FORMATION') {
        const slot = FormationMatrix.calculateTargetSlot(
          enemy.gridRow,
          enemy.gridCol,
          this.sessionElapsedTime
        );
        enemy.x = slot.x;
        enemy.y = slot.y;
      }
    }
  }

  private resolveCollisions(): void {
    const activeProjectiles = this.projectilePool.getActiveProjectiles();

    for (const p of activeProjectiles) {
      if (!p.isActive || !p.isPlayer) continue;

      for (const enemy of this.enemies) {
        if (!enemy.isAlive) continue;

        const dx = p.x - enemy.x;
        const dy = p.y - enemy.y;
        const dist = Math.hypot(dx, dy);

        if (dist < p.radius + enemy.definition.radius) {
          const died = enemy.takeDamage(p.damage);

          // Efeito de repulsão física (knockback) para armas como Sonic Wave
          if (p.knockbackForce > 0) {
            enemy.applyKnockback(p.knockbackForce);
          }

          p.registerHit();

          if (died) {
            this.inStageEvolution.addCrystals(enemy.definition.crystalDropAmount);
          }

          if (!p.isActive) break;
        }
      }
    }
  }

  private checkWaveStatus(): void {
    const livingEnemies = this.enemies.filter((e) => e.isAlive);
    if (livingEnemies.length === 0) {
      this.progressionManager.completeCurrentWave();
      this.startCurrentWave();
    }
  }

  private startCurrentWave(): void {
    this.projectilePool.clear();
    this.enemies = WaveSpawner.spawnWave(
      this.progressionManager.currentWave,
      this.screenWidth
    );
  }
}
