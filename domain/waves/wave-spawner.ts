import { BigNumber } from '../math/bignum.ts';
import { Enemy } from './enemy.ts';

/**
 * Spawner de Ondas Galaga com escalonamento BigNumber e Chefes a cada 10 Fases.
 */
export class WaveSpawner {
  public static isBossWave(waveNumber: number): boolean {
    return waveNumber > 0 && waveNumber % 10 === 0;
  }

  public static calculateWaveMultiplier(waveNumber: number): BigNumber {
    // Escala exponencial suave de 12% por onda
    return BigNumber.from(1.12).pow(Math.max(0, waveNumber - 1));
  }

  public static spawnWave(waveNumber: number, screenWidth = 480): Enemy[] {
    const isBoss = this.isBossWave(waveNumber);
    const multiplier = this.calculateWaveMultiplier(waveNumber);
    const enemies: Enemy[] = [];

    if (isBoss) {
      // Onda de Chefe: Galboss Titã no centro da linha 0 com escolta de comandantes
      const bossX = screenWidth / 2;
      const boss = new Enemy('GALAGA_BOSS', bossX, -40, 0, 3, multiplier.mul(1.5));
      enemies.push(boss);

      const escortLeft = new Enemy('COMMANDER_BUTTERFLY', bossX - 100, -60, 0, 1, multiplier);
      const escortRight = new Enemy('COMMANDER_BUTTERFLY', bossX + 100, -60, 0, 5, multiplier);
      enemies.push(escortLeft, escortRight);

      return enemies;
    }

    // Ondas Regulares: Formação mista de Drones e Comandantes
    const enemyCount = Math.min(24, 6 + Math.floor(waveNumber * 0.8));
    for (let i = 0; i < enemyCount; i++) {
      const row = 1 + (i % 3); // Linhas 1 a 3
      const col = i % 8;       // Colunas 0 a 7

      const spawnX = (i % 2 === 0) ? -30 : screenWidth + 30;
      const spawnY = -20 - (i * 15);

      const enemyId = row === 1 ? 'COMMANDER_BUTTERFLY' : 'DRONE_BEE';
      enemies.push(new Enemy(enemyId, spawnX, spawnY, row, col, multiplier));
    }

    return enemies;
  }
}
