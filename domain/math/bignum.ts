import type { ComparisonResult, NumberInput, SerializableBigNumber } from './math-types.ts';

/**
 * Value Object para números de precisão arbitrária acima de 1e308.
 * Representação interna normalizada: mantissa * 10^exponent.
 * Onde mantissa in [1.0, 10.0) ou (-10.0, -1.0], ou 0 quando nulo.
 */
export class BigNumber {
  public readonly mantissa: number;
  public readonly exponent: number;

  private static readonly PRECISION_LIMIT = 16;

  private constructor(mantissa: number, exponent: number) {
    if (mantissa === 0 || !Number.isFinite(mantissa)) {
      this.mantissa = 0;
      this.exponent = 0;
      return;
    }

    let m = mantissa;
    let e = Math.floor(exponent);

    if (Math.abs(m) >= 10 || Math.abs(m) < 1) {
      const shift = Math.floor(Math.log10(Math.abs(m)));
      m /= Math.pow(10, shift);
      e += shift;
    }

    // Normalização fina para precisão flutuante
    while (Math.abs(m) >= 10) {
      m /= 10;
      e += 1;
    }
    while (Math.abs(m) < 1 && m !== 0) {
      m *= 10;
      e -= 1;
    }

    // Limpeza de drift IEEE-754 para números inteiros ou com resíduo infinitesimal
    const nearestInt = Math.round(m);
    if (Math.abs(m - nearestInt) < 1e-12) {
      m = nearestInt;
    } else {
      const roundedTo12 = Math.round(m * 1e12) / 1e12;
      if (Math.abs(m - roundedTo12) < 1e-14) {
        m = roundedTo12;
      }
    }

    this.mantissa = m;
    this.exponent = e;
  }

  public static readonly ZERO = new BigNumber(0, 0);
  public static readonly ONE = new BigNumber(1, 0);

  public static from(value: NumberInput): BigNumber {
    if (value instanceof BigNumber) return value;
    if (typeof value === 'number') return BigNumber.fromNumber(value);
    if (typeof value === 'string') return BigNumber.fromString(value);
    return new BigNumber(value.mantissa, value.exponent);
  }

  private static fromNumber(value: number): BigNumber {
    if (value === 0 || !Number.isFinite(value)) return BigNumber.ZERO;
    const exp = Math.floor(Math.log10(Math.abs(value)));
    const man = value / Math.pow(10, exp);
    return new BigNumber(man, exp);
  }

  private static fromString(value: string): BigNumber {
    const trimmed = value.trim().toLowerCase();
    if (trimmed === '0' || trimmed === '') return BigNumber.ZERO;

    const eIndex = trimmed.indexOf('e');
    if (eIndex === -1) {
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? BigNumber.fromNumber(parsed) : BigNumber.ZERO;
    }

    const man = Number(trimmed.substring(0, eIndex));
    const exp = Number(trimmed.substring(eIndex + 1));
    return new BigNumber(man, exp);
  }

  public isZero(): boolean {
    return this.mantissa === 0;
  }

  public isNegative(): boolean {
    return this.mantissa < 0;
  }

  public abs(): BigNumber {
    return this.isNegative() ? new BigNumber(-this.mantissa, this.exponent) : this;
  }

  public neg(): BigNumber {
    return new BigNumber(-this.mantissa, this.exponent);
  }

  public add(otherInput: NumberInput): BigNumber {
    const other = BigNumber.from(otherInput);
    if (this.isZero()) return other;
    if (other.isZero()) return this;

    const diff = this.exponent - other.exponent;
    if (diff >= BigNumber.PRECISION_LIMIT) return this;
    if (diff <= -BigNumber.PRECISION_LIMIT) return other;

    const alignedMantissa = this.mantissa + other.mantissa * Math.pow(10, -diff);
    return new BigNumber(alignedMantissa, this.exponent);
  }

  public sub(otherInput: NumberInput): BigNumber {
    const other = BigNumber.from(otherInput);
    return this.add(other.neg());
  }

  public mul(otherInput: NumberInput): BigNumber {
    const other = BigNumber.from(otherInput);
    if (this.isZero() || other.isZero()) return BigNumber.ZERO;
    return new BigNumber(this.mantissa * other.mantissa, this.exponent + other.exponent);
  }

  public div(otherInput: NumberInput): BigNumber {
    const other = BigNumber.from(otherInput);
    if (other.isZero()) {
      throw new Error('[BigNumber] Divisão por zero não permitida no motor de matemática.');
    }
    if (this.isZero()) return BigNumber.ZERO;
    return new BigNumber(this.mantissa / other.mantissa, this.exponent - other.exponent);
  }

  public pow(power: number): BigNumber {
    if (power === 0) return BigNumber.ONE;
    if (this.isZero()) return BigNumber.ZERO;

    const newExp = this.exponent * power;
    const newManPow = Math.pow(this.mantissa, power);

    if (Number.isFinite(newManPow) && newManPow !== 0) {
      return new BigNumber(newManPow, newExp);
    }

    const log10Val = power * (this.exponent + Math.log10(this.mantissa));
    const finalExp = Math.floor(log10Val);
    const finalMan = Math.pow(10, log10Val - finalExp);
    return new BigNumber(finalMan, finalExp);
  }

  public cmp(otherInput: NumberInput): ComparisonResult {
    const other = BigNumber.from(otherInput);
    if (this.isZero() && other.isZero()) return 0;
    if (this.isZero()) return other.isNegative() ? 1 : -1;
    if (other.isZero()) return this.isNegative() ? -1 : 1;
    if (this.isNegative() && !other.isNegative()) return -1;
    if (!this.isNegative() && other.isNegative()) return 1;

    const sign = this.isNegative() ? -1 : 1;
    if (this.exponent > other.exponent) return (1 * sign) as ComparisonResult;
    if (this.exponent < other.exponent) return (-1 * sign) as ComparisonResult;

    if (Math.abs(this.mantissa - other.mantissa) < 1e-12) return 0;
    return (this.mantissa > other.mantissa ? sign : -sign) as ComparisonResult;
  }

  public eq(other: NumberInput): boolean { return this.cmp(other) === 0; }
  public neq(other: NumberInput): boolean { return this.cmp(other) !== 0; }
  public lt(other: NumberInput): boolean { return this.cmp(other) < 0; }
  public lte(other: NumberInput): boolean { return this.cmp(other) <= 0; }
  public gt(other: NumberInput): boolean { return this.cmp(other) > 0; }
  public gte(other: NumberInput): boolean { return this.cmp(other) >= 0; }

  public toNumber(): number {
    if (this.isZero()) return 0;
    if (this.exponent > 308) return this.mantissa > 0 ? Infinity : -Infinity;
    if (this.exponent < -308) return 0;
    return this.mantissa * Math.pow(10, this.exponent);
  }

  public toJSON(): SerializableBigNumber {
    return { mantissa: this.mantissa, exponent: this.exponent };
  }

  public toString(): string {
    if (this.isZero()) return '0';
    if (this.exponent >= 0 && this.exponent < 3) {
      return (this.mantissa * Math.pow(10, this.exponent)).toFixed(0);
    }
    return `${this.mantissa.toFixed(2)}e${this.exponent}`;
  }
}
