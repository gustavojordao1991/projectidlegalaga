export const AutoPlayTopUpSource = {
  OFFLINE_CONVERT: 'OFFLINE_CONVERT',
  AD_REWARD: 'AD_REWARD',
  VIP_PURCHASE: 'VIP_PURCHASE',
} as const;

export type AutoPlayTopUpSource =
  (typeof AutoPlayTopUpSource)[keyof typeof AutoPlayTopUpSource];

/**
 * Gerenciador de Saldo e Combustível do Modo Auto-Play (Piloto Automático).
 * Regras: Teto inicial de 3h, limite diário de até 10 ads (+15 min cada) e pacote VIP ilimitado.
 */
export class AutoPlayFuel {
  public static readonly MAX_INITIAL_CAPACITY_SEC = 3 * 3600; // 10.800 segundos (3 horas)
  public static readonly AD_REWARD_SECONDS = 15 * 60;        // 900 segundos (15 minutos)
  public static readonly MAX_DAILY_ADS = 10;

  private balanceSeconds = 0;
  private dailyAdsWatched = 0;
  private isUnlimitedVIP = false;

  public constructor(initialSeconds = 1800, isUnlimitedVIP = false) {
    this.balanceSeconds = Math.min(
      AutoPlayFuel.MAX_INITIAL_CAPACITY_SEC,
      Math.max(0, initialSeconds)
    );
    this.isUnlimitedVIP = isUnlimitedVIP;
  }

  public getBalanceSeconds(): number {
    return this.balanceSeconds;
  }

  public getDailyAdsWatched(): number {
    return this.dailyAdsWatched;
  }

  public getRemainingDailyAds(): number {
    return Math.max(0, AutoPlayFuel.MAX_DAILY_ADS - this.dailyAdsWatched);
  }

  public isVIP(): boolean {
    return this.isUnlimitedVIP;
  }

  public hasFuel(): boolean {
    return this.isUnlimitedVIP || this.balanceSeconds > 0;
  }

  public consume(seconds: number): boolean {
    if (this.isUnlimitedVIP) return true;
    if (this.balanceSeconds <= 0) return false;

    this.balanceSeconds = Math.max(0, this.balanceSeconds - seconds);
    return this.balanceSeconds > 0;
  }

  public topUpFromOffline(seconds: number): number {
    if (this.isUnlimitedVIP) return 0;

    const availableSpace = Math.max(
      0,
      AutoPlayFuel.MAX_INITIAL_CAPACITY_SEC - this.balanceSeconds
    );
    const added = Math.min(seconds, availableSpace);
    this.balanceSeconds += added;
    return added;
  }

  public topUpFromAd(): boolean {
    if (this.isUnlimitedVIP) return true;
    if (this.dailyAdsWatched >= AutoPlayFuel.MAX_DAILY_ADS) return false;

    this.dailyAdsWatched += 1;
    this.balanceSeconds += AutoPlayFuel.AD_REWARD_SECONDS;
    return true;
  }

  public activateUnlimitedVIP(): void {
    this.isUnlimitedVIP = true;
  }

  public resetDailyAdCounter(): void {
    this.dailyAdsWatched = 0;
  }
}
