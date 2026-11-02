/**
 * Tipos e metadados de moedas do universo Galaga Idle + CIFI.
 * Suporta moedas base, in-stage, evolução, premium e 3 camadas de prestígio.
 */

export const CurrencyType = {
  // 1. Moeda Base (Persistente entre ondas)
  CREDITS: 'CREDITS',

  // 2. Moeda In-Stage (Volátil por partida/onda)
  STAGE_CRYSTALS: 'STAGE_CRYSTALS',

  // 3. Tokens de Evolução de Frotas/Naves
  EVOLUTION_TOKENS: 'EVOLUTION_TOKENS',

  // 4. Moeda Premium
  DARK_MATTER: 'DARK_MATTER',

  // 5. Prestígio Layer 1 (Stellar Reset)
  ANTIMATTER: 'ANTIMATTER',

  // 6. Prestígio Layer 2 (Quantum Collapse)
  QUANTUM_CORES: 'QUANTUM_CORES',

  // 7. Prestígio Layer 3 (Cosmic Singularity)
  COSMIC_SHARDS: 'COSMIC_SHARDS',
} as const;

export type CurrencyType = (typeof CurrencyType)[keyof typeof CurrencyType];

export interface CurrencyMetadata {
  readonly type: CurrencyType;
  readonly name: string;
  readonly symbol: string;
  readonly description: string;
  readonly prestigeLayer: number; // 0 = standard, 1 = layer 1, 2 = layer 2, 3 = layer 3
  readonly isVolatile: boolean;   // true se é zerada no reset de onda
}

/**
 * Lookup Table O(1) com catálogo completo de moedas da economia.
 */
export const CURRENCY_REGISTRY: Readonly<Record<CurrencyType, CurrencyMetadata>> = {
  [CurrencyType.CREDITS]: {
    type: CurrencyType.CREDITS,
    name: 'Créditos Estelares',
    symbol: 'CR',
    description: 'Moeda universal padrão para compra e melhoria contínua de armamentos da nave.',
    prestigeLayer: 0,
    isVolatile: false,
  },
  [CurrencyType.STAGE_CRYSTALS]: {
    type: CurrencyType.STAGE_CRYSTALS,
    name: 'Cristais In-Stage',
    symbol: 'CRY',
    description: 'Energia volátil dropada por naves Galaga durante a batalha em andamento.',
    prestigeLayer: 0,
    isVolatile: true,
  },
  [CurrencyType.EVOLUTION_TOKENS]: {
    type: CurrencyType.EVOLUTION_TOKENS,
    name: 'Tokens de Evolução',
    symbol: 'EVO',
    description: 'Módulos tecnológicos obtidos ao derrotar esquadrões de elite e chefes.',
    prestigeLayer: 0,
    isVolatile: false,
  },
  [CurrencyType.DARK_MATTER]: {
    type: CurrencyType.DARK_MATTER,
    name: 'Matéria Escura (Premium)',
    symbol: 'DM',
    description: 'Recurso condensado raro utilizado para protocolos acelerados e cosméticos.',
    prestigeLayer: 0,
    isVolatile: false,
  },
  [CurrencyType.ANTIMATTER]: {
    type: CurrencyType.ANTIMATTER,
    name: 'Antimatéria (Prestígio L1)',
    symbol: 'AM',
    description: 'Obtida no primeiro colapso de setor. Aumenta o dano base de todas as armas.',
    prestigeLayer: 1,
    isVolatile: false,
  },
  [CurrencyType.QUANTUM_CORES]: {
    type: CurrencyType.QUANTUM_CORES,
    name: 'Núcleos Quânticos (Prestígio L2)',
    symbol: 'QC',
    description: 'Obtido ao reiniciar a galáxia. Desbloqueia nós avançados da árvore tecnológica.',
    prestigeLayer: 2,
    isVolatile: false,
  },
  [CurrencyType.COSMIC_SHARDS]: {
    type: CurrencyType.COSMIC_SHARDS,
    name: 'Fragmentos Cósmicos (Prestígio L3)',
    symbol: 'CS',
    description: 'Singularidade universal máxima estilo CIFI para modificadores permanentes.',
    prestigeLayer: 3,
    isVolatile: false,
  },
};
