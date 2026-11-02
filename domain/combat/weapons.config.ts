import type { WeaponDefinition } from './combat-types.ts';

/**
 * Catálogo Desacoplado de Armas de Galaga Idle (Regra 6: Data-Driven).
 * Novas armas do endgame são adicionadas apenas inserindo novos registros nesta matriz.
 */
export const WEAPONS_CATALOG: readonly WeaponDefinition[] = [
  {
    id: 'SIMPLE_BULLET',
    name: 'Canhão Vulcano Simples',
    description: 'Disparo cinético padrão de alta cadência e precisão centralizada.',
    pattern: 'SINGLE',
    baseDamageMultiplier: 1.0,
    fireRateHz: 4.0,
    projectileSpeed: 600,
    projectileRadius: 4,
    pierceCount: 1,
    spreadAngleRad: 0,
    burstCount: 1,
    knockbackForce: 0,
    lifespanSeconds: 2.0,
  },
  {
    id: 'DOUBLE_BULLET',
    name: 'Canhões Gêmeos',
    description: 'Dois projéteis paralelos cobrindo maior largura horizontal da tela.',
    pattern: 'DOUBLE',
    baseDamageMultiplier: 1.0,
    fireRateHz: 3.5,
    projectileSpeed: 600,
    projectileRadius: 4,
    pierceCount: 1,
    spreadAngleRad: 0,
    burstCount: 2,
    knockbackForce: 0,
    lifespanSeconds: 2.0,
  },
  {
    id: 'TRIPLE_BULLET',
    name: 'Canhão Tríplice Estelar',
    description: 'Três projéteis disparados em formação simultânea frontal.',
    pattern: 'TRIPLE',
    baseDamageMultiplier: 1.0,
    fireRateHz: 3.0,
    projectileSpeed: 620,
    projectileRadius: 4,
    pierceCount: 1,
    spreadAngleRad: 0,
    burstCount: 3,
    knockbackForce: 0,
    lifespanSeconds: 2.0,
  },
  {
    id: 'MACHINE_GUN',
    name: 'Metralhadora Gatling Orbital',
    description: 'Cadência ultrarrápida contínua com leve dispersão e dano moderado.',
    pattern: 'BURST_GATLING',
    baseDamageMultiplier: 0.6,
    fireRateHz: 12.0,
    projectileSpeed: 750,
    projectileRadius: 3,
    pierceCount: 1,
    spreadAngleRad: 0.12,
    burstCount: 1,
    knockbackForce: 5,
    lifespanSeconds: 1.8,
  },
  {
    id: 'CONTINUOUS_LASER',
    name: 'Feixe Laser Contínuo',
    description: 'Raio de plasma concentrado que perfura todos os inimigos da linha.',
    pattern: 'BEAM_LASER',
    baseDamageMultiplier: 1.8,
    fireRateHz: 2.5,
    projectileSpeed: 1000,
    projectileRadius: 5,
    pierceCount: 99,
    spreadAngleRad: 0,
    burstCount: 1,
    knockbackForce: 0,
    lifespanSeconds: 1.5,
  },
  {
    id: 'LIGHTNING_BEAM',
    name: 'Emissor de Raios Quânticos',
    description: 'Descargas elétricas ionizantes com extrema velocidade e perfuração média.',
    pattern: 'CHAIN_LIGHTNING',
    baseDamageMultiplier: 2.2,
    fireRateHz: 2.0,
    projectileSpeed: 1100,
    projectileRadius: 6,
    pierceCount: 4,
    spreadAngleRad: 0.05,
    burstCount: 1,
    knockbackForce: 15,
    lifespanSeconds: 1.2,
  },
  {
    id: 'SONIC_WAVE',
    name: 'Canhão de Onda Sônica',
    description: 'Onda de choque em arco com dano em área e repulsão física (knockback).',
    pattern: 'SHOCK_WAVE',
    baseDamageMultiplier: 2.5,
    fireRateHz: 1.5,
    projectileSpeed: 450,
    projectileRadius: 18,
    pierceCount: 10,
    spreadAngleRad: 0,
    burstCount: 1,
    knockbackForce: 150,
    lifespanSeconds: 2.5,
  },
  {
    id: 'CONE_SPREAD',
    name: 'Dispersor em Cone Angular',
    description: 'Leque de 5 projéteis varrendo o céu contra enxames espalhados.',
    pattern: 'CONE_SPREAD',
    baseDamageMultiplier: 0.8,
    fireRateHz: 2.2,
    projectileSpeed: 550,
    projectileRadius: 4,
    pierceCount: 1,
    spreadAngleRad: 0.35,
    burstCount: 5,
    knockbackForce: 10,
    lifespanSeconds: 1.9,
  },
  {
    id: 'HEAVY_PLASMA',
    name: 'Torpedo de Plasma Pesado',
    description: 'Tiros curtos e lentos de curtíssimo alcance com impacto destrutivo massivo.',
    pattern: 'HEAVY_PLASMA',
    baseDamageMultiplier: 6.0,
    fireRateHz: 1.0,
    projectileSpeed: 280,
    projectileRadius: 12,
    pierceCount: 2,
    spreadAngleRad: 0,
    burstCount: 1,
    knockbackForce: 80,
    lifespanSeconds: 1.0,
  },
];

/**
 * Tabela de Consulta O(1) de Armas indexada por ID.
 */
export const WEAPONS_MAP: ReadonlyMap<string, WeaponDefinition> = new Map(
  WEAPONS_CATALOG.map((weapon) => [weapon.id, weapon])
);

export function getWeaponById(weaponId: string): WeaponDefinition {
  const found = WEAPONS_MAP.get(weaponId);
  if (!found) {
    return WEAPONS_CATALOG[0]!; // Fallback seguro para arma inicial
  }
  return found;
}
