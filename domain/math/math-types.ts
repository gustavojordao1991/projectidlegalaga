/**
 * Contratos de tipos para o motor de matemática incremental de Galaga Idle.
 * Suporta representação em ponto flutuante estendido (mantissa + expoente).
 */

export type ComparisonResult = -1 | 0 | 1;

export type NumberInput = number | string | BigNumberLike;

export interface BigNumberLike {
  readonly mantissa: number;
  readonly exponent: number;
}

export type FormatNotation = 'standard' | 'alphabetical' | 'scientific' | 'engineering';

export interface FormatOptions {
  readonly notation?: FormatNotation;
  readonly decimals?: number;
  readonly scientificThreshold?: number;
  readonly smallThreshold?: number;
}

export interface SerializableBigNumber {
  readonly mantissa: number;
  readonly exponent: number;
}
