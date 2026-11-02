import type { BigNumber } from '../math/bignum.ts';

export interface Vector2D {
  readonly x: number;
  readonly y: number;
}

export interface BoundingBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export type WeaponPattern =
  | 'SINGLE'
  | 'DOUBLE'
  | 'TRIPLE'
  | 'BURST_GATLING'
  | 'BEAM_LASER'
  | 'CHAIN_LIGHTNING'
  | 'SHOCK_WAVE'
  | 'CONE_SPREAD'
  | 'HEAVY_PLASMA';

export interface WeaponDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly pattern: WeaponPattern;
  readonly baseDamageMultiplier: number;
  readonly fireRateHz: number;
  readonly projectileSpeed: number;
  readonly projectileRadius: number;
  readonly pierceCount: number;
  readonly spreadAngleRad: number;
  readonly burstCount: number;
  readonly knockbackForce: number;
  readonly lifespanSeconds: number;
}

export interface ShipHullDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly baseMaxHealth: number;
  readonly baseMaxShield: number;
  readonly shieldRegenPerSec: number;
  readonly speedPxPerSec: number;
  readonly defaultWeaponId: string;
}

export interface ShipCurrentState {
  currentHealth: BigNumber;
  maxHealth: BigNumber;
  currentShield: BigNumber;
  maxShield: BigNumber;
  x: number;
  y: number;
  activeWeaponId: string;
}
