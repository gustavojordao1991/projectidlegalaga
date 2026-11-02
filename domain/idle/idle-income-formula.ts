import { BigNumber } from '../math/bignum.ts';

/**
 * Fórmulas de Renda Idle e Ganhos de Prestígio Baseadas na Maior Wave Alcançada.
 */
export class IdleIncomeFormula {
  private static readonly BASE_IDLE_CREDITS = 10;
  private static readonly WAVE_GROWTH_FACTOR = 1.14; // +14% por wave desbloqueada

  public static calculateIdleCreditsPerSecond(highestWaveReached: number): BigNumber {
    const safeWave = Math.max(1, highestWaveReached);
    const growth = BigNumber.from(this.WAVE_GROWTH_FACTOR).pow(safeWave - 1);
    return BigNumber.from(this.BASE_IDLE_CREDITS).mul(growth);
  }

  public static calculateAntimatterPrestigeReward(highestWaveReached: number): BigNumber {
    if (highestWaveReached < 10) return BigNumber.ZERO;

    // A partir da wave 10, gera Antimatéria L1: floor((wave / 10)^1.5)
    const factor = highestWaveReached / 10;
    const rewardNumber = Math.floor(Math.pow(factor, 1.5));
    return BigNumber.from(rewardNumber);
  }
}
