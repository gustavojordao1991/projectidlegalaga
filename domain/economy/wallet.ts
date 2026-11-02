import { BigNumber } from '../math/bignum.ts';
import type { NumberInput, SerializableBigNumber } from '../math/math-types.ts';
import { CurrencyType, CURRENCY_REGISTRY } from './currency.ts';
import { InsufficientFundsError, InvalidAmountError } from './wallet-errors.ts';

export type WalletBalances = ReadonlyMap<CurrencyType, BigNumber>;

/**
 * Entidade agregadora imutável da Carteira Multi-Moedas de Galaga Idle.
 * Suporta operações matemáticas de alta escala com BigNumber.
 */
export class Wallet {
  private readonly balances: Map<CurrencyType, BigNumber>;

  private constructor(initialBalances?: Map<CurrencyType, BigNumber>) {
    this.balances = new Map();

    const allTypes = Object.values(CurrencyType) as CurrencyType[];
    for (const type of allTypes) {
      const balance = initialBalances?.get(type) ?? BigNumber.ZERO;
      this.balances.set(type, balance);
    }
  }

  public static createEmpty(): Wallet {
    return new Wallet();
  }

  public static fromJSON(
    data: Partial<Record<CurrencyType, SerializableBigNumber>>
  ): Wallet {
    const map = new Map<CurrencyType, BigNumber>();
    for (const [key, val] of Object.entries(data)) {
      if (val && Object.values(CurrencyType).includes(key as CurrencyType)) {
        map.set(key as CurrencyType, BigNumber.from(val));
      }
    }
    return new Wallet(map);
  }

  public getBalance(currency: CurrencyType): BigNumber {
    return this.balances.get(currency) ?? BigNumber.ZERO;
  }

  public has(currency: CurrencyType, required: NumberInput): boolean {
    const requiredBn = BigNumber.from(required);
    if (requiredBn.isNegative()) return false;
    const current = this.getBalance(currency);
    return current.gte(requiredBn);
  }

  public deposit(currency: CurrencyType, amount: NumberInput): Wallet {
    const depositBn = BigNumber.from(amount);
    if (depositBn.isNegative()) {
      throw new InvalidAmountError('Depósitos negativos não são permitidos.');
    }
    if (depositBn.isZero()) return this;

    const nextMap = new Map(this.balances);
    const updated = this.getBalance(currency).add(depositBn);
    nextMap.set(currency, updated);
    return new Wallet(nextMap);
  }

  public withdraw(currency: CurrencyType, amount: NumberInput): Wallet {
    const withdrawBn = BigNumber.from(amount);
    if (withdrawBn.isNegative()) {
      throw new InvalidAmountError('Saques com valor negativo não são permitidos.');
    }
    if (withdrawBn.isZero()) return this;

    const current = this.getBalance(currency);
    if (current.lt(withdrawBn)) {
      throw new InsufficientFundsError(
        currency,
        withdrawBn.toString(),
        current.toString()
      );
    }

    const nextMap = new Map(this.balances);
    nextMap.set(currency, current.sub(withdrawBn));
    return new Wallet(nextMap);
  }

  public canAfford(costs: Partial<Record<CurrencyType, NumberInput>>): boolean {
    const entries = Object.entries(costs) as [CurrencyType, NumberInput][];
    return entries.every(([curr, amount]) => this.has(curr, amount));
  }

  public payMultiple(costs: Partial<Record<CurrencyType, NumberInput>>): Wallet {
    if (!this.canAfford(costs)) {
      const entries = Object.entries(costs) as [CurrencyType, NumberInput][];
      const failingEntry = entries.find(([curr, amount]) => !this.has(curr, amount));
      if (failingEntry) {
        const [curr, amount] = failingEntry;
        throw new InsufficientFundsError(
          curr,
          BigNumber.from(amount).toString(),
          this.getBalance(curr).toString()
        );
      }
    }

    const nextMap = new Map(this.balances);
    for (const [currStr, amount] of Object.entries(costs)) {
      const curr = currStr as CurrencyType;
      const subBn = BigNumber.from(amount);
      const current = nextMap.get(curr) ?? BigNumber.ZERO;
      nextMap.set(curr, current.sub(subBn));
    }
    return new Wallet(nextMap);
  }

  public resetVolatiles(): Wallet {
    const nextMap = new Map(this.balances);
    for (const [type, meta] of Object.entries(CURRENCY_REGISTRY)) {
      if (meta.isVolatile) {
        nextMap.set(type as CurrencyType, BigNumber.ZERO);
      }
    }
    return new Wallet(nextMap);
  }

  public resetPrestige(prestigeLayer: number): Wallet {
    const nextMap = new Map(this.balances);
    for (const [type, meta] of Object.entries(CURRENCY_REGISTRY)) {
      // Moedas de camada inferior à acionada são zeradas no prestígio
      if (meta.prestigeLayer < prestigeLayer && meta.type !== CurrencyType.DARK_MATTER) {
        nextMap.set(type as CurrencyType, BigNumber.ZERO);
      }
    }
    return new Wallet(nextMap);
  }

  public toJSON(): Record<CurrencyType, SerializableBigNumber> {
    const result = {} as Record<CurrencyType, SerializableBigNumber>;
    for (const [key, value] of this.balances.entries()) {
      result[key] = value.toJSON();
    }
    return result;
  }
}
