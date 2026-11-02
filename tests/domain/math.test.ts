import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BigNumber, BigNumberFormatter } from '../../domain/math/index.ts';

describe('BigNumber & Math Module', () => {
  it('deve somar valores pequenos e exponenciais corretamente', () => {
    const a = BigNumber.from(500);
    const b = BigNumber.from(250);
    const sum = a.add(b);
    assert.equal(sum.toNumber(), 750);

    const huge1 = BigNumber.from('1e400');
    const huge2 = BigNumber.from('2e400');
    const hugeSum = huge1.add(huge2);
    assert.equal(hugeSum.exponent, 400);
    assert.equal(hugeSum.mantissa, 3);
  });

  it('deve multiplicar e dividir números acima de 1e308', () => {
    const a = BigNumber.from('1e200');
    const b = BigNumber.from('1e150');
    const product = a.mul(b);
    assert.equal(product.exponent, 350);
    assert.equal(product.mantissa, 1);

    const div = product.div(a);
    assert.equal(div.exponent, 150);
    assert.equal(div.mantissa, 1);
  });

  it('deve calcular potência com precisão', () => {
    const base = BigNumber.from(2);
    const pow10 = base.pow(10);
    assert.equal(pow10.toNumber(), 1024);
  });

  it('deve formatar sufixos arcade padrão (K, M, B, T)', () => {
    assert.equal(BigNumberFormatter.format(950), '950');
    assert.equal(BigNumberFormatter.format(1500), '1.50 K');
    assert.equal(BigNumberFormatter.format(1000000), '1.00 M');
    assert.equal(BigNumberFormatter.format('1e12'), '1.00 T');
  });

  it('deve formatar notação alfabética (aa, ab) para valores ultra altos', () => {
    const valAa = BigNumber.from('1e15'); // Tier 5 -> aa
    assert.equal(BigNumberFormatter.format(valAa, { notation: 'alphabetical' }), '1.00 aa');

    const valAb = BigNumber.from('1e18'); // Tier 6 -> ab
    assert.equal(BigNumberFormatter.format(valAb, { notation: 'alphabetical' }), '1.00 ab');

    // Quando ultrapassa a tabela standard (tier >= 22 / 1e66), deve adotar automaticamente alphabetical
    const valBeyondStandard = BigNumber.from('1e66');
    assert.match(BigNumberFormatter.format(valBeyondStandard), /^[0-9.]+\s+[a-z]{2}$/);
  });

  it('deve alternar para notação científica quando ultrapassar limite ou explicitamente pedido', () => {
    const huge = BigNumber.from('1.5e500');
    assert.equal(
      BigNumberFormatter.format(huge, { notation: 'scientific' }),
      '1.50e500'
    );
  });
});
