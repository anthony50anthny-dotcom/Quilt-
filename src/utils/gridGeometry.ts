export const PX_PER_INCH = 20;

export interface GridConfig {
  rows: number;
  cols: number;
  blockWidth: number;
  blockHeight: number;
  sashingEnabled: boolean;
  sashingWidth: number;
  sashingBorderEnabled: boolean;
  sashingBorderWidth: number;
  borderWidth: number;
}

export interface GridDimensions {
  totalWidthIn: number;
  totalHeightIn: number;
  coreWidthIn: number;
  coreHeightIn: number;
  borderW: number;
  sashBorderW: number;
  sashW: number;
  coreTop: number;
  coreLeft: number;
  coreBottom: number;
  coreRight: number;
}

export function computeGridDimensions(cfg: GridConfig): GridDimensions {
  const sashW = cfg.sashingEnabled ? cfg.sashingWidth : 0;
  const sashBorderW = cfg.sashingBorderEnabled ? cfg.sashingBorderWidth : 0;
  const borderW = cfg.borderWidth;

  const coreWidthIn = cfg.cols * cfg.blockWidth + (sashW > 0 ? (cfg.cols - 1) * sashW : 0);
  const coreHeightIn = cfg.rows * cfg.blockHeight + (sashW > 0 ? (cfg.rows - 1) * sashW : 0);

  const totalWidthIn = coreWidthIn + 2 * sashBorderW + 2 * borderW;
  const totalHeightIn = coreHeightIn + 2 * sashBorderW + 2 * borderW;

  return {
    totalWidthIn,
    totalHeightIn,
    coreWidthIn,
    coreHeightIn,
    borderW,
    sashBorderW,
    sashW,
    coreTop: borderW + sashBorderW,
    coreLeft: borderW + sashBorderW,
    coreBottom: totalHeightIn - borderW - sashBorderW,
    coreRight: totalWidthIn - borderW - sashBorderW,
  };
}

export type CellType = 'border' | 'sashBorder' | 'sashing' | 'block';

export function getCellType(
  r: number,
  c: number,
  cfg: GridConfig,
  dims: GridDimensions,
): CellType {
  const {
    totalWidthIn, totalHeightIn,
    borderW, sashBorderW, sashW,
    coreTop, coreLeft, coreBottom, coreRight,
  } = dims;

  if (borderW > 0 && (r < borderW || r >= totalHeightIn - borderW || c < borderW || c >= totalWidthIn - borderW)) {
    return 'border';
  }

  if (
    sashBorderW > 0 &&
    r >= borderW && r < totalHeightIn - borderW &&
    c >= borderW && c < totalWidthIn - borderW &&
    (r < coreTop || r >= coreBottom || c < coreLeft || c >= coreRight)
  ) {
    return 'sashBorder';
  }

  if (cfg.sashingEnabled && sashW > 0 && r >= coreTop && r < coreBottom && c >= coreLeft && c < coreRight) {
    const coreR = r - coreTop;
    const coreC = c - coreLeft;
    const repeatH = cfg.blockHeight + sashW;
    const repeatW = cfg.blockWidth + sashW;
    const blockRowIndex = Math.floor(coreR / repeatH);
    const posInRepeatH = coreR % repeatH;
    const blockColIndex = Math.floor(coreC / repeatW);
    const posInRepeatW = coreC % repeatW;
    const isHorizSash = blockRowIndex < cfg.rows - 1 && posInRepeatH >= cfg.blockHeight;
    const isVertSash = blockColIndex < cfg.cols - 1 && posInRepeatW >= cfg.blockWidth;
    if (isHorizSash || isVertSash) return 'sashing';
  }

  return 'block';
}

export function makePaintLayer(rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(''));
}
