export interface QuiltCalcConfig {
  rows: number;
  cols: number;
  blockWidth: number;
  blockHeight: number;
  sashingEnabled: boolean;
  sashingWidth: number;
  sashingBorderEnabled: boolean;
  sashingBorderWidth: number;
  borderWidth: number;
  wof: number;
  seam: number;
  bindingStripWidth: number;
  sashStripWidth: number;
}

export interface QuiltDimensions {
  rows: number;
  cols: number;
  sashW: number;
  sashBorderW: number;
  borderW: number;
  coreWidth: number;
  coreHeight: number;
  totalWidth: number;
  totalHeight: number;
}

export function getQuiltDimensions(cfg: QuiltCalcConfig): QuiltDimensions {
  const sashW = cfg.sashingEnabled ? cfg.sashingWidth : 0;
  const sashBorderW = cfg.sashingBorderEnabled ? cfg.sashingBorderWidth : 0;
  const borderW = cfg.borderWidth;
  const coreWidth = cfg.cols * cfg.blockWidth + (cfg.cols - 1) * sashW;
  const coreHeight = cfg.rows * cfg.blockHeight + (cfg.rows - 1) * sashW;
  return {
    rows: cfg.rows, cols: cfg.cols,
    sashW, sashBorderW, borderW,
    coreWidth, coreHeight,
    totalWidth: coreWidth + 2 * sashBorderW + 2 * borderW,
    totalHeight: coreHeight + 2 * sashBorderW + 2 * borderW,
  };
}

function roundToFourth(yards: number): number {
  if (!isFinite(yards)) return 0;
  const whole = Math.floor(yards);
  const quarter = Math.round((yards - whole) * 4) / 4;
  return quarter === 1 ? whole + 1 : whole + quarter;
}

function toMixedFraction(value: number): string {
  if (!isFinite(value)) return '';
  const whole = Math.floor(value);
  const fourths = Math.round((value - whole) * 4);
  if (fourths === 0) return `${whole}`;
  if (fourths === 4) return `${whole + 1}`;
  return whole > 0 ? `${whole} ${fourths}/4` : `${fourths}/4`;
}

export function calculateFabric(cfg: QuiltCalcConfig): string {
  const { rows, cols, sashW, sashBorderW, borderW, coreWidth, coreHeight, totalWidth, totalHeight } =
    getQuiltDimensions(cfg);
  const { wof, seam, blockWidth, blockHeight } = cfg;

  const blockYards = roundToFourth(
    (blockWidth + 2 * seam) * (blockHeight + 2 * seam) * rows * cols / (wof * 36)
  );

  let sashingYards = 0;
  if (sashW > 0) {
    const cutW = sashW + 2 * seam;
    const area = (cols - 1) * cutW * (coreHeight + 2 * seam) + (rows - 1) * cutW * (coreWidth + 2 * seam);
    sashingYards = roundToFourth(area / (wof * 36));
  }

  let sashBorderYards = 0;
  if (sashBorderW > 0) {
    const cutW = sashBorderW + 2 * seam;
    const vertLen = coreHeight + 2 * sashBorderW + 2 * seam;
    const horizLen = coreWidth + 2 * sashBorderW + 2 * seam;
    sashBorderYards = roundToFourth((2 * cutW * vertLen + 2 * cutW * horizLen) / (wof * 36));
  }

  let borderYards = 0;
  if (borderW > 0) {
    const cutW = borderW + 2 * seam;
    const innerW = coreWidth + 2 * sashBorderW;
    const innerH = coreHeight + 2 * sashBorderW;
    borderYards = roundToFourth(
      (2 * cutW * (innerH + 2 * borderW + 2 * seam) + 2 * cutW * (innerW + 2 * borderW + 2 * seam)) / (wof * 36)
    );
  }

  const backingYards = roundToFourth(Math.max(1, Math.ceil(totalWidth / wof)) * totalHeight / 36);
  const stripsBinding = Math.ceil(2 * (totalWidth + totalHeight) / wof);
  const bindingYards = roundToFourth(stripsBinding * cfg.bindingStripWidth / 36);

  const totalYards = roundToFourth(blockYards + sashingYards + sashBorderYards + borderYards + backingYards + bindingYards);

  const fmt = toMixedFraction;
  return [
    `Blocks:         ${fmt(blockYards)} yards`,
    `Sashing:        ${fmt(sashingYards)} yards`,
    `Sashing Border: ${fmt(sashBorderYards)} yards`,
    `Border:         ${fmt(borderYards)} yards`,
    `Backing:        ${fmt(backingYards)} yards`,
    `Binding:        ${fmt(bindingYards)} yards`,
    '-----------------------------',
    `Total:          ${fmt(totalYards)} yards`,
  ].join('\n');
}

export function calculateStrips(cfg: QuiltCalcConfig): string {
  const { rows, cols, sashW, coreWidth, coreHeight, totalWidth, totalHeight } = getQuiltDimensions(cfg);
  const { wof, sashStripWidth, bindingStripWidth } = cfg;

  const stripsSashing = Math.ceil(((cols - 1) * coreHeight + (rows - 1) * coreWidth) / wof);
  const stripsSashBorder = Math.ceil(2 * (coreWidth + coreHeight) / wof);
  const stripsBinding = Math.ceil(2 * (totalWidth + totalHeight) / wof);
  const totalInches = stripsSashing * sashStripWidth + stripsSashBorder * sashStripWidth + stripsBinding * bindingStripWidth;

  // suppress sashing strips when sashing is 0-width
  const effectiveSashStrips = sashW > 0 ? stripsSashing : 0;
  const effectiveTotal = effectiveSashStrips + stripsSashBorder + stripsBinding;

  return [
    `Sashing Strips Needed: ${effectiveSashStrips}`,
    `Sashing Border Strips Needed: ${stripsSashBorder}`,
    `Binding Strips Needed: ${stripsBinding}`,
    `Total Strips: ${effectiveTotal}`,
    `Total Inches: ${totalInches.toFixed(1)}`,
    `Yardage: ${toMixedFraction(roundToFourth(totalInches / 36))} yards`,
  ].join('\n');
}
