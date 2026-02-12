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

// ===== STRIP-BASED YARDAGE HELPER =====
function stripYardage(stripWidth, stripLengths, wof) {
  if (stripWidth <= 0) return 0;

  const stripsPerWOF = Math.floor(wof / stripWidth);
  if (stripsPerWOF < 1) return Infinity;

  const totalStrips = stripLengths.length;
  const wofCuts = Math.ceil(totalStrips / stripsPerWOF);

  const totalInches = stripLengths.reduce((a, b) => a + b, 0);

  return totalInches / 36;
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

  // ===== BLOCKS (area-based is fine) =====
  const blockCutW = bw + 2 * seam;
  const blockCutH = bh + 2 * seam;
  const blockArea = blockCutW * blockCutH * rows * cols;
  let blockYards = blockArea / (wof * 36);
  blockYards = roundToQuarter(blockYards);

  // ===== SASHING (strip-based) =====
  let sashingYards = 0;
  if (sashingEnabled && sashW > 0) {
    const cutW = sashW + 2 * seam;
    const stripLengths = [];

    // Vertical sashing strips
    for (let i = 0; i < cols - 1; i++) {
      stripLengths.push(coreHeight + 2 * seam);
    }

    // Horizontal sashing strips
    for (let i = 0; i < rows - 1; i++) {
      stripLengths.push(coreWidth + 2 * seam);
    }

    sashingYards = stripYardage(cutW, stripLengths, wof);
    sashingYards = roundToQuarter(sashingYards);
  }

  // ===== SASHING BORDER (strip-based) =====
  let sashBorderYards = 0;
  if (sashingBorderEnabled && sashBorderW > 0) {
    const cutW = sashBorderW + 2 * seam;

    const innerW = coreWidth;
    const innerH = coreHeight;

    const stripLengths = [
      innerH + 2 * sashBorderW + 2 * seam,
      innerH + 2 * sashBorderW + 2 * seam,
      innerW + 2 * sashBorderW + 2 * seam,
      innerW + 2 * sashBorderW + 2 * seam
    ];

    sashBorderYards = stripYardage(cutW, stripLengths, wof);
    sashBorderYards = roundToQuarter(sashBorderYards);
  }

  // ===== OUTER BORDER (strip-based) =====
  let borderYards = 0;
  if (borderW > 0) {
    const cutW = borderW + 2 * seam;

    const innerW = coreWidth + 2 * sashBorderW;
    const innerH = coreHeight + 2 * sashBorderW;

    const stripLengths = [
      innerH + 2 * borderW + 2 * seam,
      innerH + 2 * borderW + 2 * seam,
      innerW + 2 * borderW + 2 * seam,
      innerW + 2 * borderW + 2 * seam
    ];

    borderYards = stripYardage(cutW, stripLengths, wof);
    borderYards = roundToQuarter(borderYards);
  }

  // ===== BACKING (panel-based) =====
  const panels = Math.max(1, Math.ceil(totalWidth / wof));
  let backingYards = (panels * totalHeight) / 36;
  backingYards = roundToQuarter(backingYards);

  // ===== TOTAL =====
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
