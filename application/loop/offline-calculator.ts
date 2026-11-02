import { BigNumber } from '../../domain/math/bignum.ts';
import { CurrencyType } from '../../domain/economy/currency.ts';
import type { OfflineCalculationInput, OfflineGainsResult } from './loop-types.ts';

/**
 * Calculadora de Ganhos Offline e Combustível de Piloto Automático (Auto-Play).
 * Orquestra regras de tempo decorrido, mitigação de drift e limites de segurança.
 */
export class OfflineCalculator {
  private static readonly DEFAULT_MAX_HOURS = 24;
  private static readonly DEFAULT_FILL_RATIO = 0.5;
  private static readonly DEFAULT_MAX_AUTOPLAY_BANK = 86400; // 24 horas em segundos
  private static readonly DEFAULT_CLOCK_DRIFT_SEC = 5;

  public static calculate(input: OfflineCalculationInput): OfflineGainsResult {
    const maxOfflineHours = input.maxOfflineHours ?? this.DEFAULT_MAX_HOURS;
    const maxAllowedSeconds = maxOfflineHours * 3600;
    const allowedDrift = input.allowedClockDriftSeconds ?? this.DEFAULT_CLOCK_DRIFT_SEC;
    const fillRatio = input.autoPlayFillRatio ?? this.DEFAULT_FILL_RATIO;
    const maxAutoPlayBank = input.maxAutoPlayBankSeconds ?? this.DEFAULT_MAX_AUTOPLAY_BANK;

    const rawDeltaMs = input.currentTimestampMs - input.lastActiveTimestampMs;
    const rawDeltaSeconds = rawDeltaMs / 1000;

    // 1. Checagem de adulteração de relógio do dispositivo (anti-clock tampering)
    const isClockDrift = rawDeltaSeconds < -allowedDrift;
    if (isClockDrift || rawDeltaSeconds <= 0) {
      return this.buildZeroResult(input.currentAutoPlayBankSeconds, isClockDrift);
    }

    // 2. Aplicação do teto máximo de horas offline
    const isCapped = rawDeltaSeconds > maxAllowedSeconds;
    const effectiveSeconds = isCapped ? maxAllowedSeconds : Math.floor(rawDeltaSeconds);

    // 3. Cálculo de moedas acumuladas com precisão BigNumber
    const accumulatedGains: Partial<Record<CurrencyType, BigNumber>> = {};
    const secondsBn = BigNumber.from(effectiveSeconds);

    for (const [currStr, rate] of Object.entries(input.idleRatesPerSecond)) {
      if (rate !== undefined) {
        const curr = currStr as CurrencyType;
        const rateBn = BigNumber.from(rate);
        accumulatedGains[curr] = rateBn.mul(secondsBn);
      }
    }

    // 4. Alimentação do Banco de Piloto Automático (Auto-Play)
    const potentialAutoPlaySec = Math.floor(effectiveSeconds * fillRatio);
    const spaceInBank = Math.max(0, maxAutoPlayBank - input.currentAutoPlayBankSeconds);
    const autoPlaySecondsAdded = Math.min(potentialAutoPlaySec, spaceInBank);
    const newAutoPlayBankSeconds = input.currentAutoPlayBankSeconds + autoPlaySecondsAdded;

    return {
      realElapsedSeconds: Math.floor(rawDeltaSeconds),
      effectiveElapsedSeconds: effectiveSeconds,
      wasCappedByMaxHours: isCapped,
      wasClockDriftDetected: false,
      accumulatedGains,
      newAutoPlayBankSeconds,
      autoPlaySecondsAdded,
    };
  }

  private static buildZeroResult(
    currentBank: number,
    clockDriftDetected: boolean
  ): OfflineGainsResult {
    return {
      realElapsedSeconds: 0,
      effectiveElapsedSeconds: 0,
      wasCappedByMaxHours: false,
      wasClockDriftDetected: clockDriftDetected,
      accumulatedGains: {},
      newAutoPlayBankSeconds: currentBank,
      autoPlaySecondsAdded: 0,
    };
  }
}
