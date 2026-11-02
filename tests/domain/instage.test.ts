import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { InStageEvolution } from '../../domain/instage/index.ts';

describe('Domain InStage: Evolution & Crystals Economy', () => {
  it('deve acumular cristais e permitir upgrade temporário de arma', () => {
    const evolution = new InStageEvolution();
    assert.equal(evolution.getCurrentWeaponId(), 'SIMPLE_BULLET');

    evolution.addCrystals(100);
    const ok = evolution.upgradeWeaponTier();
    assert.equal(ok, true);
    assert.equal(evolution.getCurrentWeaponId(), 'DOUBLE_BULLET');
    assert.equal(evolution.weaponTierLevel, 1);
  });

  it('deve aumentar taxa de tiro e dano com os upgrades in-stage', () => {
    const evolution = new InStageEvolution();
    evolution.addCrystals(200);

    evolution.upgradeFireRate();
    evolution.upgradeDamage();

    assert.equal(evolution.getFireRateMultiplier(), 1.15); // +15%
    assert.equal(evolution.getDamageMultiplier().toNumber(), 1.2); // +20%
  });

  it('resetRun deve zerar os cristais e níveis temporários da partida', () => {
    const evolution = new InStageEvolution();
    evolution.addCrystals(500);
    evolution.upgradeWeaponTier();
    evolution.resetRun();

    assert.equal(evolution.crystalsBalance, 0);
    assert.equal(evolution.weaponTierLevel, 0);
    assert.equal(evolution.getCurrentWeaponId(), 'SIMPLE_BULLET');
  });
});
