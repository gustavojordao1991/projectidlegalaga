import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Ship, ProjectilePool, WEAPONS_CATALOG, getWeaponById } from '../../domain/combat/index.ts';
import { BigNumber } from '../../domain/math/index.ts';

describe('Domain Combat: Ship, Weapons & Projectile Pool', () => {
  it('deve carregar o catálogo de armas dinâmico sem hardcoding', () => {
    assert.ok(WEAPONS_CATALOG.length >= 9);
    const gatling = getWeaponById('MACHINE_GUN');
    assert.equal(gatling.pattern, 'BURST_GATLING');
    assert.equal(gatling.fireRateHz, 12.0);

    const sonic = getWeaponById('SONIC_WAVE');
    assert.equal(sonic.pattern, 'SHOCK_WAVE');
    assert.ok(sonic.knockbackForce > 100);
  });

  it('deve movimentar a nave respeitando os limites da tela', () => {
    const ship = new Ship('CORVETTE_ALPHA', 200, 700);
    ship.moveTowards(400, 0.5, 20, 460); // 320 px/s * 0.5 = +160 px -> x = 360
    assert.equal(ship.x, 360);

    ship.teleport(500, 20, 460);
    assert.equal(ship.x, 460); // Clamp no maxX
  });

  it('escudo deve absorver dano antes de afetar a vida da nave', () => {
    const ship = new Ship('CORVETTE_ALPHA', 200, 700);
    // Escudo: 50, Vida: 100
    ship.takeDamage(BigNumber.from(30));
    assert.equal(ship.currentShield.toNumber(), 20);
    assert.equal(ship.currentHealth.toNumber(), 100);

    ship.takeDamage(BigNumber.from(40)); // Consome 20 de escudo + 20 de vida
    assert.equal(ship.currentShield.toNumber(), 0);
    assert.equal(ship.currentHealth.toNumber(), 80);
  });

  it('deve disparar rajadas da metralhadora reaproveitando projéteis do pool', () => {
    const pool = new ProjectilePool(50);
    const ship = new Ship('INTERCEPTOR_OMEGA', 200, 700);
    ship.switchWeapon('MACHINE_GUN');

    const fired = ship.fire(pool);
    assert.equal(fired.length, 1);
    assert.equal(fired[0]!.weaponId, 'MACHINE_GUN');
    assert.ok(fired[0]!.isActive);

    pool.update(2.0, 800); // 2 segundos excedem lifespan (1.8s) -> desativa
    assert.equal(fired[0]!.isActive, false);
  });
});
