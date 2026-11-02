import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TickEngine, OfflineCalculator } from '../../application/loop/index.ts';
import { CurrencyType } from '../../domain/economy/index.ts';

describe('Application Loop & Offline Calculator', () => {
  it('TickEngine deve despachar ticks rápidos e lentos via step()', () => {
    const engine = new TickEngine({ fastHz: 60, slowHz: 1 });
    let fastCount = 0;
    let slowCount = 0;
    let recordedSlowElapsed = 0;

    engine.onFastTick((dt) => {
      fastCount++;
      assert.ok(dt > 0);
    });

    engine.onSlowTick((dt, total) => {
      slowCount++;
      recordedSlowElapsed = total;
    });

    engine.step(1 / 60, 1.0);
    engine.step(1 / 60);

    assert.equal(fastCount, 2);
    assert.equal(slowCount, 1);
    assert.equal(recordedSlowElapsed, 1.0);
  });

  it('OfflineCalculator deve calcular ganhos proporcionais ao tempo', () => {
    const now = Date.now();
    const oneHourAgo = now - 3600 * 1000;

    const result = OfflineCalculator.calculate({
      lastActiveTimestampMs: oneHourAgo,
      currentTimestampMs: now,
      idleRatesPerSecond: {
        [CurrencyType.CREDITS]: 10,
      },
      currentAutoPlayBankSeconds: 0,
      autoPlayFillRatio: 0.5,
    });

    assert.equal(result.effectiveElapsedSeconds, 3600);
    assert.equal(result.wasCappedByMaxHours, false);
    assert.equal(result.wasClockDriftDetected, false);

    // 10 créditos/segundo * 3600 segundos = 36000 créditos
    const earnedCredits = result.accumulatedGains[CurrencyType.CREDITS];
    assert.ok(earnedCredits);
    assert.equal(earnedCredits.toNumber(), 36000);

    // Auto-Play: 3600 * 0.5 = 1800 segundos adicionados
    assert.equal(result.autoPlaySecondsAdded, 1800);
    assert.equal(result.newAutoPlayBankSeconds, 1800);
  });

  it('OfflineCalculator deve aplicar teto máximo de horas offline', () => {
    const now = Date.now();
    const twoDaysAgo = now - 48 * 3600 * 1000;

    const result = OfflineCalculator.calculate({
      lastActiveTimestampMs: twoDaysAgo,
      currentTimestampMs: now,
      idleRatesPerSecond: {
        [CurrencyType.CREDITS]: 1,
      },
      currentAutoPlayBankSeconds: 0,
      maxOfflineHours: 24,
    });

    assert.equal(result.wasCappedByMaxHours, true);
    assert.equal(result.effectiveElapsedSeconds, 24 * 3600);
  });

  it('OfflineCalculator deve detectar drift temporal (relógio adulterado para trás)', () => {
    const now = Date.now();
    const futureTime = now + 100000; // Cliente adulterou o relógio ou servidor recebeu timestamp no passado

    const result = OfflineCalculator.calculate({
      lastActiveTimestampMs: futureTime,
      currentTimestampMs: now,
      idleRatesPerSecond: { [CurrencyType.CREDITS]: 100 },
      currentAutoPlayBankSeconds: 500,
    });

    assert.equal(result.wasClockDriftDetected, true);
    assert.equal(result.effectiveElapsedSeconds, 0);
    assert.equal(result.autoPlaySecondsAdded, 0);
    assert.equal(result.newAutoPlayBankSeconds, 500);
  });
});
