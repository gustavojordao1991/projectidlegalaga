import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CurrencyType, Wallet, InsufficientFundsError } from '../../domain/economy/index.ts';
import { BigNumber } from '../../domain/math/index.ts';

describe('Wallet & Multi-Currency Module', () => {
  it('deve inicializar com saldo zero para todas as moedas', () => {
    const wallet = Wallet.createEmpty();
    assert.equal(wallet.getBalance(CurrencyType.CREDITS).toNumber(), 0);
    assert.equal(wallet.getBalance(CurrencyType.ANTIMATTER).toNumber(), 0);
  });

  it('deve depositar e sacar créditos com integridade', () => {
    let wallet = Wallet.createEmpty();
    wallet = wallet.deposit(CurrencyType.CREDITS, 1000);
    assert.equal(wallet.getBalance(CurrencyType.CREDITS).toNumber(), 1000);

    wallet = wallet.withdraw(CurrencyType.CREDITS, 400);
    assert.equal(wallet.getBalance(CurrencyType.CREDITS).toNumber(), 600);
  });

  it('deve rejeitar saque quando o saldo for insuficiente', () => {
    const wallet = Wallet.createEmpty().deposit(CurrencyType.DARK_MATTER, 50);

    assert.throws(
      () => wallet.withdraw(CurrencyType.DARK_MATTER, 100),
      (err: unknown) => err instanceof InsufficientFundsError
    );
  });

  it('deve suportar operações com valores exponenciais gigantes', () => {
    let wallet = Wallet.createEmpty();
    const giantAmount = BigNumber.from('1e400');
    wallet = wallet.deposit(CurrencyType.COSMIC_SHARDS, giantAmount);

    assert.equal(wallet.getBalance(CurrencyType.COSMIC_SHARDS).exponent, 400);
  });

  it('deve zerar apenas moedas voláteis in-stage quando solicitado', () => {
    let wallet = Wallet.createEmpty()
      .deposit(CurrencyType.CREDITS, 5000)
      .deposit(CurrencyType.STAGE_CRYSTALS, 250);

    wallet = wallet.resetVolatiles();
    assert.equal(wallet.getBalance(CurrencyType.STAGE_CRYSTALS).toNumber(), 0);
    assert.equal(wallet.getBalance(CurrencyType.CREDITS).toNumber(), 5000);
  });

  it('deve zerar moedas de camadas inferiores durante reset de prestígio', () => {
    let wallet = Wallet.createEmpty()
      .deposit(CurrencyType.CREDITS, 10000)
      .deposit(CurrencyType.ANTIMATTER, 5)
      .deposit(CurrencyType.QUANTUM_CORES, 2);

    // Reset de Prestígio Layer 2 (Quantum) zera créditos e Layer 1 (Antimatter), mantendo Layer 2
    wallet = wallet.resetPrestige(2);
    assert.equal(wallet.getBalance(CurrencyType.CREDITS).toNumber(), 0);
    assert.equal(wallet.getBalance(CurrencyType.ANTIMATTER).toNumber(), 0);
    assert.equal(wallet.getBalance(CurrencyType.QUANTUM_CORES).toNumber(), 2);
  });
});
