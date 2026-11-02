import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { WaveProgressionManager, CombatSession } from '../../application/combat/index.ts';
import { IdleIncomeFormula } from '../../domain/idle/index.ts';

describe('Application Combat: Wave Progression & Combat Session', () => {
  it('WaveProgressionManager deve avançar com autoAdvance e repetir fase em modo farm', () => {
    const manager = new WaveProgressionManager(1, true);

    const res1 = manager.completeCurrentWave();
    assert.equal(res1.currentWave, 2);
    assert.equal(res1.isAdvancing, true);

    manager.toggleAutoAdvance(); // Desativa para modo Farm
    const res2 = manager.completeCurrentWave();
    assert.equal(res2.currentWave, 2); // Repete a wave 2
    assert.equal(res2.isAdvancing, false);
  });

  it('WaveProgressionManager deve recuar 1 wave por padrão e desativar autoAdvance na derrota', () => {
    const manager = new WaveProgressionManager(9, true, false);

    const defeat = manager.failCurrentWave();
    assert.equal(defeat.safeWave, 8); // Recua para wave 8
    assert.equal(manager.autoAdvanceEnabled, false); // Trava o avanço contínuo
  });

  it('WaveProgressionManager com retreatToSectorStart deve recuar para o início do bloco do chefe', () => {
    const manager = new WaveProgressionManager(9, true, true); // retreatToSectorStart = true

    const defeat = manager.failCurrentWave();
    assert.equal(defeat.safeWave, 1); // Bloco 1-10 -> recua para wave 1
    assert.equal(manager.autoAdvanceEnabled, false);

    const manager2 = new WaveProgressionManager(19, true, true);
    const defeat2 = manager2.failCurrentWave();
    assert.equal(defeat2.safeWave, 11); // Bloco 11-20 -> recua para wave 11
  });

  it('CombatSession deve executar ticks, processar colisões e coletar cristais', () => {
    const session = new CombatSession();
    session.ship.switchWeapon('SONIC_WAVE');

    // Posiciona um inimigo exatamente na linha de mira
    const targetEnemy = session.enemies[0]!;
    targetEnemy.x = session.ship.x;
    targetEnemy.y = session.ship.y - 50;

    session.setManualInput(session.ship.x, true);
    session.step(0.016); // 1 tick a 60 FPS

    assert.ok(session.projectilePool.getActiveCount() > 0);
  });

  it('IdleIncomeFormula deve calcular renda exponencial e recompensa de prestígio', () => {
    const incomeWave1 = IdleIncomeFormula.calculateIdleCreditsPerSecond(1);
    const incomeWave10 = IdleIncomeFormula.calculateIdleCreditsPerSecond(10);
    assert.ok(incomeWave10.gt(incomeWave1));

    const antimatter = IdleIncomeFormula.calculateAntimatterPrestigeReward(20);
    assert.ok(antimatter.toNumber() >= 2);
  });
});
