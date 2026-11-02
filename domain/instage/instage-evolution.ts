import { BigNumber } from '../math/bignum.ts';

export interface InStageUpgradeCosts {
  readonly weaponTierCost: number;
  readonly fireRateCost: number;
  readonly damageCost: number;
}

/**
 * Sistema de Evolução In-Stage (Upgrades Temporários da Corrida Atual).
 * Consome Cristais coletados das naves alienígenas abatidas na partida.
 */
export class InStageEvolution {
  public crystalsBalance = 0;
  public weaponTierLevel = 0;
  public fireRateLevel = 0;
  public damageMultiplierLevel = 0;

  private static readonly WEAPON_TIER_SEQUENCE: readonly string[] = [
    'SIMPLE_BULLET',
    'DOUBLE_BULLET',
    'TRIPLE_BULLET',
    'MACHINE_GUN',
    'CONTINUOUS_LASER',
    'SONIC_WAVE',
    'HEAVY_PLASMA',
  ];

  public getNextWeaponTierId(): string {
    const nextIdx = Math.min(
      this.weaponTierLevel + 1,
      InStageEvolution.WEAPON_TIER_SEQUENCE.length - 1
    );
    return InStageEvolution.WEAPON_TIER_SEQUENCE[nextIdx]!;
  }

  public getCurrentWeaponId(): string {
    const idx = Math.min(
      this.weaponTierLevel,
      InStageEvolution.WEAPON_TIER_SEQUENCE.length - 1
    );
    return InStageEvolution.WEAPON_TIER_SEQUENCE[idx]!;
  }

  public getCosts(): InStageUpgradeCosts {
    return {
      weaponTierCost: Math.floor(50 * Math.pow(1.8, this.weaponTierLevel)),
      fireRateCost: Math.floor(25 * Math.pow(1.5, this.fireRateLevel)),
      damageCost: Math.floor(30 * Math.pow(1.5, this.damageMultiplierLevel)),
    };
  }

  public addCrystals(amount: number): void {
    if (amount > 0) {
      this.crystalsBalance += amount;
    }
  }

  public upgradeWeaponTier(): boolean {
    const cost = this.getCosts().weaponTierCost;
    const isMax = this.weaponTierLevel >= InStageEvolution.WEAPON_TIER_SEQUENCE.length - 1;
    if (isMax || this.crystalsBalance < cost) return false;

    this.crystalsBalance -= cost;
    this.weaponTierLevel += 1;
    return true;
  }

  public upgradeFireRate(): boolean {
    const cost = this.getCosts().fireRateCost;
    if (this.crystalsBalance < cost) return false;

    this.crystalsBalance -= cost;
    this.fireRateLevel += 1;
    return true;
  }

  public upgradeDamage(): boolean {
    const cost = this.getCosts().damageCost;
    if (this.crystalsBalance < cost) return false;

    this.crystalsBalance -= cost;
    this.damageMultiplierLevel += 1;
    return true;
  }

  public getFireRateMultiplier(): number {
    return 1.0 + this.fireRateLevel * 0.15; // +15% por nível
  }

  public getDamageMultiplier(): BigNumber {
    return BigNumber.from(1.0 + this.damageMultiplierLevel * 0.2); // +20% por nível
  }

  public resetRun(): void {
    this.crystalsBalance = 0;
    this.weaponTierLevel = 0;
    this.fireRateLevel = 0;
    this.damageMultiplierLevel = 0;
  }
}
