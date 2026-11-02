import type { BigNumber } from '../../domain/math/bignum.ts';
import type { NumberInput } from '../../domain/math/math-types.ts';
import type { CurrencyType } from '../../domain/economy/currency.ts';

export type FastTickListener = (deltaTimeSec: number) => void;
export type SlowTickListener = (deltaTimeSec: number, elapsedTotalSec: number) => void;

export interface TickEngineConfig {
  readonly fastHz?: number; // Padrão: 60 FPS
  readonly slowHz?: number; // Padrão: 1 Hz
}

export interface OfflineCalculationInput {
  readonly lastActiveTimestampMs: number;
  readonly currentTimestampMs: number;
  readonly idleRatesPerSecond: Partial<Record<CurrencyType, NumberInput>>;
  readonly currentAutoPlayBankSeconds: number;
  readonly maxAutoPlayBankSeconds?: number;
  readonly autoPlayFillRatio?: number;
  readonly maxOfflineHours?: number;
  readonly allowedClockDriftSeconds?: number;
}

export interface OfflineGainsResult {
  readonly realElapsedSeconds: number;
  readonly effectiveElapsedSeconds: number;
  readonly wasCappedByMaxHours: boolean;
  readonly wasClockDriftDetected: boolean;
  readonly accumulatedGains: Partial<Record<CurrencyType, BigNumber>>;
  readonly newAutoPlayBankSeconds: number;
  readonly autoPlaySecondsAdded: number;
}
