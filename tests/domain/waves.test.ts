import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { WaveSpawner, Enemy, FormationMatrix } from '../../domain/waves/index.ts';

describe('Domain Waves: Spawner, Boss Cadence & Knockback', () => {
  it('deve gerar Chefe exatamente a cada 10 ondas (10, 20, 30...)', () => {
    assert.equal(WaveSpawner.isBossWave(5), false);
    assert.equal(WaveSpawner.isBossWave(9), false);
    assert.equal(WaveSpawner.isBossWave(10), true);
    assert.equal(WaveSpawner.isBossWave(20), true);

    const wave10 = WaveSpawner.spawnWave(10);
    const boss = wave10.find((e) => e.isBoss);
    assert.ok(boss !== undefined);
    assert.equal(boss.definition.id, 'GALAGA_BOSS');
  });

  it('deve aplicar repulsão física (knockback) empurrando o inimigo para trás', () => {
    const enemy = new Enemy('DRONE_BEE', 200, 300, 1, 1);
    const initialY = enemy.y;

    enemy.applyKnockback(150); // Força da Sonic Wave
    assert.ok(enemy.y < initialY); // Empurrado para cima (longe da nave)
  });

  it('FormationMatrix deve calcular posições com oscilação de enxame', () => {
    const pos1 = FormationMatrix.calculateTargetSlot(1, 2, 0);
    const pos2 = FormationMatrix.calculateTargetSlot(1, 2, 1.0);

    assert.ok(pos1.x > 0 && pos1.y > 0);
    assert.notEqual(pos1.x, pos2.x); // Oscilou no tempo
  });
});
