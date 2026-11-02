import { BigNumber } from './bignum.ts';
import type { FormatOptions, NumberInput } from './math-types.ts';

/**
 * Formatador de alto desempenho com Lookup Tables O(1) para jogos incrementais.
 * Suporta notação arcade padrão (K, M, B, T...), alfabética (aa, ab, ac...) e científica.
 */
export class BigNumberFormatter {
  private static readonly STANDARD_SUFFIXES: readonly string[] = [
    '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No',
    'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Ocd', 'Nod', 'Vg'
  ];

  private static readonly ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

  public static format(input: NumberInput, options: FormatOptions = {}): string {
    const bn = BigNumber.from(input);
    const notation = options.notation ?? 'standard';
    const decimals = options.decimals ?? 2;
    const sciThreshold = options.scientificThreshold ?? 308;

    if (bn.isZero()) return '0';
    if (bn.isNegative()) return `-${this.format(bn.abs(), options)}`;

    if (bn.exponent < 3) {
      const val = bn.toNumber();
      return Number.isInteger(val) ? val.toString() : val.toFixed(decimals);
    }

    if (bn.exponent >= sciThreshold || notation === 'scientific') {
      return this.formatScientific(bn, decimals);
    }

    const formatterMap: Record<string, () => string> = {
      standard: () => this.formatStandard(bn, decimals),
      alphabetical: () => this.formatAlphabetical(bn, decimals),
      engineering: () => this.formatEngineering(bn, decimals),
      scientific: () => this.formatScientific(bn, decimals),
    };

    const handler = formatterMap[notation] ?? formatterMap.standard;
    return handler();
  }

  private static formatStandard(bn: BigNumber, decimals: number): string {
    const tier = Math.floor(bn.exponent / 3);
    if (tier < this.STANDARD_SUFFIXES.length) {
      const remainder = bn.exponent % 3;
      const displayVal = bn.mantissa * Math.pow(10, remainder);
      return `${displayVal.toFixed(decimals)} ${this.STANDARD_SUFFIXES[tier]}`.trim();
    }
    return this.formatAlphabetical(bn, decimals);
  }

  private static formatAlphabetical(bn: BigNumber, decimals: number): string {
    const tier = Math.floor(bn.exponent / 3);
    const remainder = bn.exponent % 3;
    const displayVal = bn.mantissa * Math.pow(10, remainder);
    const suffix = this.getAlphabeticalSuffix(tier);
    return `${displayVal.toFixed(decimals)} ${suffix}`;
  }

  private static getAlphabeticalSuffix(tier: number): string {
    // tier 1 = K, tier 4 = T. Inicia 'aa' em tier 5 (10^15)
    const alphaIndex = Math.max(0, tier - 5);
    const base = this.ALPHABET.length;

    const firstChar = this.ALPHABET[Math.floor(alphaIndex / base) % base] ?? 'a';
    const secondChar = this.ALPHABET[alphaIndex % base];
    return `${firstChar}${secondChar}`;
  }

  private static formatEngineering(bn: BigNumber, decimals: number): string {
    const remainder = ((bn.exponent % 3) + 3) % 3;
    const engineeringExp = bn.exponent - remainder;
    const displayVal = bn.mantissa * Math.pow(10, remainder);
    return `${displayVal.toFixed(decimals)}e${engineeringExp}`;
  }

  private static formatScientific(bn: BigNumber, decimals: number): string {
    return `${bn.mantissa.toFixed(decimals)}e${bn.exponent}`;
  }
}
