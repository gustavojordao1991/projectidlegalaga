import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AutoPlayFuel, TacticalPilotAI } from '../../domain/ai/index.ts';

describe('Domain AI: Auto-Play Fuel & Tactical Pilot AI', () => {
  it('AutoPlayFuel deve respeitar teto inicial de 3 horas (10.800s)', () => {
    const fuel = new AutoPlayFuel(1000);
    const added = fuel.topUpFromOffline(15000);
    assert.equal(added, 9800); // 1000 + 9800 = 10800
    assert.equal(fuel.getBalanceSeconds(), 10800);
  });

  it('AutoPlayFuel deve limitar a 10 anúncios diários de +15 minutos', () => {
    const fuel = new AutoPlayFuel(0);

    for (let i = 0; i < 10; i++) {
      const ok = fuel.topUpFromAd();
      assert.equal(ok, true);
    }

    assert.equal(fuel.getRemainingDailyAds(), 0);
    assert.equal(fuel.topUpFromAd(), false); // 11º ad deve ser rejeitado
    assert.equal(fuel.getBalanceSeconds(), 10 * 900); // 9.000 segundos
  });

  it('AutoPlayFuel em modo VIP ilimitado não consome saldo', () => {
    const fuel = new AutoPlayFuel(50, true);
    const ok = fuel.consume(100);
    assert.equal(ok, true);
    assert.equal(fuel.getBalanceSeconds(), 50); // Intacto
  });

  it('TacticalPilotAI deve priorizar Chefes sobre inimigos comuns', () => {
    const enemies = [
      { x: 100, y: 150, isBoss: false, isDiving: false, isAlive: true },
      { x: 380, y: 120, isBoss: true, isDiving: false, isAlive: true },
    ];

    const decision = TacticalPilotAI.decide(100, 700, enemies, []);
    assert.equal(decision.targetX, 380);
    assert.equal(decision.shouldFire, true);
    assert.equal(decision.isEvading, false);
  });

  it('TacticalPilotAI deve desviar de projéteis em trajetória de colisão', () => {
    const enemies = [{ x: 200, y: 100, isBoss: false, isDiving: false, isAlive: true }];
    const threats = [{ x: 205, y: 620, vx: 0, vy: 300, isActive: true }]; // Quase atingindo nave em x=200, y=700

    const decision = TacticalPilotAI.decide(200, 700, enemies, threats);
    assert.equal(decision.isEvading, true);
    assert.ok(decision.targetX !== 200);
  });
});
