import type { ShipHullDefinition } from './combat-types.ts';

/**
 * Catálogo Desacoplado de Modelos de Chassi de Naves (Regra 6: Data-Driven).
 * Novos modelos de endgame são adicionados nesta matriz sem alterações na engine.
 */
export const SHIPS_CATALOG: readonly ShipHullDefinition[] = [
  {
    id: 'CORVETTE_ALPHA',
    name: 'Corveta Alpha',
    description: 'Chassi padrão da Federação Galáctica. Equilíbrio entre blindagem e manobrabilidade.',
    baseMaxHealth: 100,
    baseMaxShield: 50,
    shieldRegenPerSec: 5,
    speedPxPerSec: 320,
    defaultWeaponId: 'SIMPLE_BULLET',
  },
  {
    id: 'DESTROYER_BETA',
    name: 'Destróier Beta Titan',
    description: 'Nave de defesa pesada com escudos reforçados e menor agilidade lateral.',
    baseMaxHealth: 250,
    baseMaxShield: 150,
    shieldRegenPerSec: 12,
    speedPxPerSec: 220,
    defaultWeaponId: 'DOUBLE_BULLET',
  },
  {
    id: 'INTERCEPTOR_OMEGA',
    name: 'Interceptor Ômega Hyper',
    description: 'Nave tática ultrarrápida projetada para esquiva ágil e rajadas concentradas.',
    baseMaxHealth: 70,
    baseMaxShield: 30,
    shieldRegenPerSec: 8,
    speedPxPerSec: 460,
    defaultWeaponId: 'MACHINE_GUN',
  },
];

export const SHIPS_MAP: ReadonlyMap<string, ShipHullDefinition> = new Map(
  SHIPS_CATALOG.map((ship) => [ship.id, ship])
);

export function getShipHullById(hullId: string): ShipHullDefinition {
  const found = SHIPS_MAP.get(hullId);
  if (!found) {
    return SHIPS_CATALOG[0]!;
  }
  return found;
}
