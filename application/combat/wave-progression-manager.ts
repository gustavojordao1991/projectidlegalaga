export interface WaveProgressionResult {
  readonly currentWave: number;
  readonly isAdvancing: boolean;
  readonly highestWaveUnlocked: number;
}

/**
 * Gerenciador de Progressão Automática de Ondas e Modo Farm de Galaga Idle.
 * Regras: Toggle livre na HUD e recuo configurável na derrota (1 wave vs. início do setor).
 */
export class WaveProgressionManager {
  public currentWave: number;
  public highestWaveUnlocked: number;
  public autoAdvanceEnabled: boolean;
  public retreatToSectorStartOnDefeat: boolean;

  public constructor(
    initialWave = 1,
    autoAdvanceEnabled = true,
    retreatToSectorStartOnDefeat = false
  ) {
    this.currentWave = Math.max(1, initialWave);
    this.highestWaveUnlocked = this.currentWave;
    this.autoAdvanceEnabled = autoAdvanceEnabled;
    this.retreatToSectorStartOnDefeat = retreatToSectorStartOnDefeat;
  }

  public completeCurrentWave(): WaveProgressionResult {
    if (this.autoAdvanceEnabled) {
      this.currentWave += 1;
      this.highestWaveUnlocked = Math.max(this.highestWaveUnlocked, this.currentWave);
      return {
        currentWave: this.currentWave,
        isAdvancing: true,
        highestWaveUnlocked: this.highestWaveUnlocked,
      };
    }

    // Modo Farm (Auto-Advance desativado): repete a fase atual para farm infinito
    return {
      currentWave: this.currentWave,
      isAdvancing: false,
      highestWaveUnlocked: this.highestWaveUnlocked,
    };
  }

  public failCurrentWave(): { safeWave: number } {
    let safeWave: number;

    if (this.retreatToSectorStartOnDefeat) {
      // Ex: Wave 9 -> 1; Wave 10 -> 1; Wave 19 -> 11; Wave 20 -> 11
      const sectorBase = Math.floor((this.currentWave - 1) / 10) * 10 + 1;
      safeWave = Math.max(1, sectorBase);
    } else {
      // Padrão: recua apenas para a wave imediatamente anterior
      safeWave = Math.max(1, this.currentWave - 1);
    }

    this.currentWave = safeWave;
    this.autoAdvanceEnabled = false; // Desativa o avanço para proteção anti-loop de morte

    return { safeWave };
  }

  public toggleAutoAdvance(): boolean {
    this.autoAdvanceEnabled = !this.autoAdvanceEnabled;
    return this.autoAdvanceEnabled;
  }

  public setAutoAdvance(enabled: boolean): void {
    this.autoAdvanceEnabled = enabled;
  }

  public setRetreatOption(retreatToSectorStart: boolean): void {
    this.retreatToSectorStartOnDefeat = retreatToSectorStart;
  }
}
