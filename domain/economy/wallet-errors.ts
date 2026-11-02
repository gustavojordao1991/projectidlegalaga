import { CurrencyType } from './currency.ts';

/**
 * Erros de domínio especializados para a economia e carteira.
 * Fornecem contexto auditável sem expor dados sensíveis.
 */
export class WalletError extends Error {
  public constructor(message: string) {
    super(`[Economy.Wallet] ${message}`);
    this.name = 'WalletError';
  }
}

export class InsufficientFundsError extends WalletError {
  public readonly currency: CurrencyType;
  public readonly required: string;
  public readonly current: string;

  public constructor(
    currency: CurrencyType,
    required: string,
    current: string
  ) {
    super(
      `Saldo insuficiente de ${currency}. Necessário: ${required}, Saldo Disponível: ${current}.`
    );
    this.name = 'InsufficientFundsError';
    this.currency = currency;
    this.required = required;
    this.current = current;
  }
}

export class InvalidAmountError extends WalletError {
  public constructor(message: string) {
    super(`Valor monetário inválido: ${message}`);
    this.name = 'InvalidAmountError';
  }
}
