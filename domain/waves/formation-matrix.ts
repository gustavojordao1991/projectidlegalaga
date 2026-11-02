export interface GridSlotPosition {
  readonly x: number;
  readonly y: number;
}

/**
 * Matriz de Formação Clássica Galaga com Oscilação em Enxame.
 */
export class FormationMatrix {
  public static readonly ROWS = 4;
  public static readonly COLS = 8;
  public static readonly COL_SPACING = 48;
  public static readonly ROW_SPACING = 38;

  public static calculateTargetSlot(
    row: number,
    col: number,
    elapsedTimeSec: number,
    originX = 70,
    originY = 120
  ): GridSlotPosition {
    // Oscilação senoidal suave em bloco do enxame Galaga
    const swarmOffsetX = Math.sin(elapsedTimeSec * 1.5) * 22;
    const swarmOffsetY = Math.cos(elapsedTimeSec * 0.8) * 8;

    const x = originX + col * this.COL_SPACING + swarmOffsetX;
    const y = originY + row * this.ROW_SPACING + swarmOffsetY;

    return { x, y };
  }

  public static updateEnteringEnemy(
    currentX: number,
    currentY: number,
    targetX: number,
    targetY: number,
    speed: number,
    dt: number
  ): { x: number; y: number; arrived: boolean } {
    const dx = targetX - currentX;
    const dy = targetY - currentY;
    const dist = Math.hypot(dx, dy);

    if (dist <= speed * dt || dist < 2) {
      return { x: targetX, y: targetY, arrived: true };
    }

    const ratio = (speed * dt) / dist;
    return {
      x: currentX + dx * ratio,
      y: currentY + dy * ratio,
      arrived: false,
    };
  }

  public static calculateDivePosition(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    progress: number
  ): GridSlotPosition {
    // Curva paramétrica de mergulho Galaga (arco em parábola com retorno ao topo)
    const t = Math.min(1.0, Math.max(0.0, progress));
    const arcX = startX + (targetX - startX) * t + Math.sin(t * Math.PI) * 50;
    const arcY = startY + (targetY - startY) * t;

    return { x: arcX, y: arcY };
  }
}
