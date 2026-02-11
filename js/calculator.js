// ===== FRACTION HELPERS =====
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

function toMixedFraction(value, denom = 4) {
  if (!isFinite(value)) return '';
  const sign = value < 0 ? -1 : 1;
  value = Math.abs(value);
  let whole = Math.floor(value);
  let frac = value - whole;
  let num = Math.round(frac * denom);

  if (num === 0) {
    return (sign < 0 ? '-' : '') + whole.toString();
  }

  if (num === denom) {
    whole += 1;
    num = 0;
  }

  if (num === 0) {
    return (sign < 0 ? '-' : '') + whole.toString();
  }

  const g = gcd(num, denom);
  num /= g;
  denom /= g;

  const fracStr = num + '/' + denom;
  if (whole === 0) {
    return (sign < 0 ? '-' : '') + fracStr;
  }
  return (sign < 0 ? '-' : '') + whole + ' ' + fracStr;
}

function roundToQuarter(yards) {
  return Math.round(yards * 4) / 4;
}

function formatYards(yards) {
  return toMixedFraction(yards, 4);
}

// ===== GET QUILT DIMENSIONS =====
function getQuiltDimensions() {
  const rows = parseInt(rowsInput.value, 10) || 1;
  const cols = parseInt(colsInput.value, 10) || 1;
  const bw = parseFloat(blockWidthInput.value) || 1;
  const bh = parseFloat(blockHeightInput.value) || 1;
  const sashW = parseFloat(sashingWidthInput.value) || 0;
  const sashBorderW = (sashingBorderEnabled && parseFloat(sashingBorderWidthInput.value) > 0)
    ? parseFloat(sashingBorderWidthInput.value)
    : 0;
  const borderW = parseFloat(borderWidthInput.value) || 0;

  const coreWidth =
    cols * bw + (cols - 1) * (sashingEnabled ? sashW : 0);

  const coreHeight =
    rows * bh + (rows - 1) * (sashingEnabled ? sashW : 0);

  const totalWidth =
    coreWidth + 2 * sashBorderW + 2 * borderW;

  const totalHeight =
    coreHeight + 2 * sashBorderW + 2 * borderW;

  return {
    rows, cols, bw, bh,
    sashW, sashBorderW, borderW,
    coreWidth, coreHeight,
    totalWidth, totalHeight
  };
}

// ===== CALCULATE FABRIC =====
function calculateFabric() {
  const { rows, cols, bw, bh, sashW, sashBorderW, borderW, coreWidth, coreHeight, totalWidth, totalHeight } =
    getQuiltDimensions();

  const wof = parseFloat(wofInput.value) || 42;
  const seam = parseFloat(seamInput.value) || 0;

  // Blocks
  const blockCutW = bw + 2 * seam;
  const blockCutH = bh + 2 * seam;
  const blockArea = blockCutW * blockCutH * rows * cols;
  let blockYards = blockArea / (wof * 36);
  blockYards = roundToQuarter(blockYards);

  // Sashing
  let sashingYards = 0;
  if (sashingEnabled && sashW > 0) {
    const sashCutW = sashW + 2 * seam;

    const vertCount = Math.max(cols - 1, 0);
    const vertLenFinished = coreHeight;
    const vertCutLen = vertLenFinished + 2 * seam;
    const vertArea = vertCount * sashCutW * vertCutLen;

    const horizCount = Math.max(rows - 1, 0);
    const horizLenFinished = coreWidth;
    const horizCutLen = horizLenFinished + 2 * seam;
    const horizArea = horizCount * sashCutW * horizCutLen;

    sashingYards = (vertArea + horizArea) / (wof * 36);
    sashingYards = roundToQuarter(sashingYards);
  }

  // Sashing Border
  let sashBorderYards = 0;
  if (sashingBorderEnabled && sashBorderW > 0) {
    const borderCutW = sashBorderW + 2 * seam;
    const innerW = coreWidth;
    const innerH = coreHeight;

    const vertLenFinished = innerH + 2 * sashBorderW;
    const horizLenFinished = innerW + 2 * sashBorderW;

    const vertCutLen = vertLenFinished + 2 * seam;
    const horizCutLen = horizLenFinished + 2 * seam;

    const vertArea = 2 * borderCutW * vertCutLen;
    const horizArea = 2 * borderCutW * horizCutLen;

    sashBorderYards = (vertArea + horizArea) / (wof * 36);
    sashBorderYards = roundToQuarter(sashBorderYards);
  }

  // Outer Border
  let borderYards = 0;
  if (borderW > 0) {
    const borderCutW = borderW + 2 * seam;
    const innerW = coreWidth + 2 * sashBorderW;
    const innerH = coreHeight + 2 * sashBorderW;

    const vertLenFinished = innerH + 2 * borderW;
    const horizLenFinished = innerW + 2 * borderW;

    const vertCutLen = vertLenFinished + 2 * seam;
    const horizCutLen = horizLenFinished + 2 * seam;

    const vertArea = 2 * borderCutW * vertCutLen;
    const horizArea = 2 * borderCutW * horizCutLen;

    borderYards = (vertArea + horizArea) / (wof * 36);
    borderYards = roundToQuarter(borderYards);
  }

  // Backing
  const panels = Math.max(1, Math.ceil(totalWidth / wof));
  let backingYards = (panels * totalHeight) / 36;
  backingYards = roundToQuarter(backingYards);

  const totalYards =
    blockYards + sashingYards + sashBorderYards + borderYards + backingYards;
  const roundedTotal = roundToQuarter(totalYards);

  let text = '';
  text += `Blocks:         ${formatYards(blockYards)} yards\n`;
  text += `Sashing:        ${formatYards(sashingYards)} yards\n`;
  text += `Sashing Border: ${formatYards(sashBorderYards)} yards\n`;
  text += `Border:         ${formatYards(borderYards)} yards\n`;
  text += `Backing:        ${formatYards(backingYards)} yards\n`;
  text += '-----------------------------\n';
  text += `Total:          ${formatYards(roundedTotal)} yards`;

  return text;
}

// ===== EXPORT =====
window.calculateFabric = calculateFabric;