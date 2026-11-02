export interface EnemyDefinition {
  readonly id: string;
  readonly name: string;
  readonly baseHealth: number;
  readonly baseDamage: number;
  readonly baseSpeed: number;
  readonly diveSpeed: number;
  readonly crystalDropAmount: number;
  readonly isBoss: boolean;
  readonly radius: number;
}

/**
 * Catálogo Desacoplado de Inimigos Alienígenas Galaga (Regra 6: Data-Driven).
 * Novos arquétipos de endgame são registrados aqui sem tocar na lógica de colisão.
 */
export const ENEMIES_CATALOG: readonly EnemyDefinition[] = [
  {
    id: 'DRONE_BEE',
    name: 'Zako Drone (Abelha Galaga)',
    baseHealth: 30,
    baseDamage: 15,
    baseSpeed: 120,
    diveSpeed: 240,
    crystalDropAmount: 5,
    isBoss: false,
    radius: 12,
  },
  {
    id: 'COMMANDER_BUTTERFLY',
    name: 'Goei Commander (Borboleta Galaga)',
    baseHealth: 80,
    baseDamage: 30,
    baseSpeed: 100,
    diveSpeed: 210,
    crystalDropAmount: 18,
    isBoss: false,
    radius: 16,
  },
  {
    id: 'GALAGA_BOSS',
    name: 'Galboss Titan (Nave-Mãe Galaga)',
    baseHealth: 600,
    baseDamage: 80,
    baseSpeed: 80,
    diveSpeed: 160,
    crystalDropAmount: 150,
    isBoss: true,
    radius: 32,
  },
];

export const ENEMIES_MAP: ReadonlyMap<string, EnemyDefinition> = new Map(
  ENEMIES_CATALOG.map((enemy) => [enemy.id, enemy])
);

export function getEnemyById(enemyId: string): EnemyDefinition {
  const found = ENEMIES_MAP.get(enemyId);
  if (!found) {
    return ENEMIES_CATALOG[0]!;
  }
  return found;
}
