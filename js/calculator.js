// =========================
// DOM ELEMENT REFERENCES
// =========================

// Quilt settings inputs
window.rowsInput = document.getElementById("rowsInput");
window.colsInput = document.getElementById("colsInput");
window.blockWidthInput = document.getElementById("blockWidthInput");
window.blockHeightInput = document.getElementById("blockHeightInput");
window.sashingWidthInput = document.getElementById("sashingWidthInput");
window.sashingBorderWidthInput = document.getElementById("sashingBorderWidthInput");
window.borderWidthInput = document.getElementById("borderWidthInput");

// Strip calculator inputs
window.sashStripWidthInput = document.getElementById("sashStripWidthInput");
window.bindingStripWidthInput = document.getElementById("bindingStripWidthInput");

// Fabric calculator inputs
window.wofInput = document.getElementById("wofInput");
window.seamInput = document.getElementById("seamInput");


// =========================
// FRACTION + ROUNDING HELPERS (1/4 yard rounding)
// =========================

function roundToFourth(yards) {
  if (!isFinite(yards)) return 0;

  let whole = Math.floor(yards);
  let frac = yards - whole;

  // Round to nearest 1/4
  const quarter = Math.round(frac * 4) / 4;

  if (quarter === 1) {
    return whole + 1;
  }

  return whole + quarter;
}

function toMixedFraction(value) {
  if (!isFinite(value)) return "";

  const whole = Math.floor(value);
  const frac = value - whole;

  const fourths = Math.round(frac * 4);

  if (fourths === 0) return `${whole}`;
  if (fourths === 4) return `${whole + 1}`;

  return whole > 0 ? `${whole} ${fourths}/4` : `${fourths}/4`;
}

function formatYards(yards) {
  return toMixedFraction(yards);
}


// =========================
// GET QUILT DIMENSIONS
// =========================

function getQuiltDimensions() {
  const rows = parseInt(window.rowsInput.value, 10) || 1;
  const cols = parseInt(window.colsInput.value, 10) || 1;
  const bw = parseFloat(window.blockWidthInput.value) || 1;
  const bh = parseFloat(window.blockHeightInput.value) || 1;
  const sashW = parseFloat(window.sashingWidthInput.value) || 0;
  const sashBorderW = (window.sashingBorderEnabled ? parseFloat(window.sashingBorderWidthInput.value) || 0 : 0);
  const borderW = parseFloat(window.borderWidthInput.value) || 0;

  const coreWidth =
    cols * bw + (cols - 1) * (window.sashingEnabled ? sashW : 0);

  const coreHeight =
    rows * bh + (rows - 1) * (window.sashingEnabled ? sashW : 0);

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


// =========================
// QUILT SIZE DISPLAY
// =========================

function updateQuiltSizeDisplay() {
  const { totalWidth, totalHeight } = getQuiltDimensions();

  const out = document.getElementById("quiltSizeOutput");
  out.innerHTML =
    `Width: ${totalWidth} inches<br>` +
    `Height: ${totalHeight} inches`;
}

window.updateQuiltSizeDisplay = updateQuiltSizeDisplay;


// =========================
// FABRIC YARDAGE CALCULATOR
// =========================

function calculateFabric() {
  const { rows, cols, bw, bh, sashW, sashBorderW, borderW, coreWidth, coreHeight, totalWidth, totalHeight } =
    getQuiltDimensions();

  const wof = parseFloat(window.wofInput.value) || 42;
  const seam = parseFloat(window.seamInput.value) || 0;

  // BLOCKS
  const blockCutW = bw + 2 * seam;
  const blockCutH = bh + 2 * seam;
  const blockArea = blockCutW * blockCutH * rows * cols;
  let blockYards = roundToFourth(blockArea / (wof * 36));

  // SASHING
  let sashingYards = 0;
  if (window.sashingEnabled && sashW > 0) {
    const cutW = sashW + 2 * seam;

    const vertCount = Math.max(cols - 1, 0);
    const horizCount = Math.max(rows - 1, 0);

    const vertLen = coreHeight + 2 * seam;
    const horizLen = coreWidth + 2 * seam;

    const totalArea = vertCount * cutW * vertLen + horizCount * cutW * horizLen;
    sashingYards = roundToFourth(totalArea / (wof * 36));
  }

  // SASHING BORDER
  let sashBorderYards = 0;
  if (window.sashingBorderEnabled && sashBorderW > 0) {
    const cutW = sashBorderW + 2 * seam;

    const innerW = coreWidth;
    const innerH = coreHeight;

    const vertLen = innerH + 2 * sashBorderW + 2 * seam;
    const horizLen = innerW + 2 * sashBorderW + 2 * seam;

    const totalArea = 2 * cutW * vertLen + 2 * cutW * horizLen;
    sashBorderYards = roundToFourth(totalArea / (wof * 36));
  }

  // OUTER BORDER
  let borderYards = 0;
  if (borderW > 0) {
    const cutW = borderW + 2 * seam;

    const innerW = coreWidth + 2 * sashBorderW;
    const innerH = coreHeight + 2 * sashBorderW;

    const vertLen = innerH + 2 * borderW + 2 * seam;
    const horizLen = innerW + 2 * borderW + 2 * seam;

    const totalArea = 2 * cutW * vertLen + 2 * cutW * horizLen;
    borderYards = roundToFourth(totalArea / (wof * 36));
  }

  // BACKING
  const panels = Math.max(1, Math.ceil(totalWidth / wof));
  let backingYards = roundToFourth((panels * totalHeight) / 36);

  // BINDING (strip-based)
  const bindStripW = parseFloat(window.bindingStripWidthInput.value) || 0;
  const perimeter = 2 * (totalWidth + totalHeight);
  const stripsBinding = Math.ceil(perimeter / wof);
  let bindingYards = roundToFourth((stripsBinding * bindStripW) / 36);

  // TOTAL
  const totalYards =
    blockYards +
    sashingYards +
    sashBorderYards +
    borderYards +
    backingYards +
    bindingYards;

  const roundedTotal = roundToFourth(totalYards);

  // OUTPUT
  let text = "";
  text += `Blocks:         ${formatYards(blockYards)} yards\n`;
  text += `Sashing:        ${formatYards(sashingYards)} yards\n`;
  text += `Sashing Border: ${formatYards(sashBorderYards)} yards\n`;
  text += `Border:         ${formatYards(borderYards)} yards\n`;
  text += `Backing:        ${formatYards(backingYards)} yards\n`;
  text += `Binding:        ${formatYards(bindingYards)} yards\n`;
  text += "-----------------------------\n";
  text += `Total:          ${formatYards(roundedTotal)} yards`;

  return text;
}


// =========================
// STRIP CALCULATOR
// =========================

function calculateStrips() {
  const sashStripW = parseFloat(window.sashStripWidthInput.value) || 0;
  const bindStripW = parseFloat(window.bindingStripWidthInput.value) || 0;
  const wof = parseFloat(window.wofInput.value) || 42;

  const { rows, cols, coreWidth, coreHeight, totalWidth, totalHeight } = getQuiltDimensions();

  // SASHING STRIPS
  const vertCount = Math.max(cols - 1, 0);
  const horizCount = Math.max(rows - 1, 0);

  const totalSashingInches =
    vertCount * coreHeight +
    horizCount * coreWidth;

  const stripsSashing = Math.ceil(totalSashingInches / wof);

  // SASHING BORDER STRIPS
  const innerW = coreWidth;
  const innerH = coreHeight;

  const totalSashBorderInches = 2 * (innerW + innerH);
  const stripsSashBorder = Math.ceil(totalSashBorderInches / wof);

  // BINDING STRIPS
  const perimeter = 2 * (totalWidth + totalHeight);
  const stripsBinding = Math.ceil(perimeter / wof);

  // TOTAL STRIPS
  const totalStrips = stripsSashing + stripsSashBorder + stripsBinding;

  // TOTAL INCHES
  const totalInches =
    stripsSashing * sashStripW +
    stripsSashBorder * sashStripW +
    stripsBinding * bindStripW;

  const yards = roundToFourth(totalInches / 36);

  // OUTPUT
  const out = document.getElementById("stripCalcOutput");
  out.innerHTML =
    `Sashing Strips Needed: ${stripsSashing}<br>` +
    `Sashing Border Strips Needed: ${stripsSashBorder}<br>` +
    `Binding Strips Needed: ${stripsBinding}<br>` +
    `Total Strips: ${totalStrips}<br>` +
    `Total Inches: ${totalInches.toFixed(1)}<br>` +
    `Yardage: ${formatYards(yards)} yards`;
}


// =========================
// EVENT BINDINGS
// =========================

document.getElementById("calcFabricBtn").addEventListener("click", () => {
  document.getElementById("fabricOutput").textContent = calculateFabric();
});

document.getElementById("calcStripsBtn").addEventListener("click", calculateStrips);


// =========================
// EXPORT
// =========================

window.calculateFabric = calculateFabric;
