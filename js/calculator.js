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
// FRACTION + ROUNDING HELPERS
// =========================

function roundToEighth(yards) {
  if (!isFinite(yards)) return 0;

  let whole = Math.floor(yards);
  let frac = yards - whole;

  const steps = [
    { max: 0.000, val: 0 },
    { max: 0.125, val: 1/8 },
    { max: 0.25,  val: 1/4 },
    { max: 1/3,   val: 1/3 },
    { max: 0.375, val: 3/8 },
    { max: 0.5,   val: 1/2 },
    { max: 0.625, val: 5/8 },
    { max: 2/3,   val: 2/3 },
    { max: 0.75,  val: 3/4 },
    { max: 0.875, val: 7/8 },
  ];

  let chosen = null;
  for (const step of steps) {
    if (frac <= step.max) {
      chosen = step.val;
      break;
    }
  }

  if (chosen === null) {
    whole += 1;
    frac = 0;
  } else {
    frac = chosen;
  }

  return whole + frac;
}

function toMixedFraction(value) {
  if (!isFinite(value)) return "";

  const whole = Math.floor(value);
  const frac = value - whole;

  const eighths = Math.round(frac * 8);
  if (eighths === 0) return `${whole}`;
  if (eighths === 8) return `${whole + 1}`;

  return whole > 0 ? `${whole} ${eighths}/8` : `${eighths}/8`;
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
  let blockYards = roundToEighth(blockArea / (wof * 36));

  // SASHING
  let sashingYards = 0;
  if (window.sashingEnabled && sashW > 0) {
    const cutW = sashW + 2 * seam;

    const vertCount = Math.max(cols - 1, 0);
    const horizCount = Math.max(rows - 1, 0);

    const vertLen = coreHeight + 2 * seam;
    const horizLen = coreWidth + 2 * seam;

    const totalArea = vertCount * cutW * vertLen + horizCount * cutW * horizLen;
    sashingYards = roundToEighth(totalArea / (wof * 36));
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
    sashBorderYards = roundToEighth(totalArea / (wof * 36));
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
    borderYards = roundToEighth(totalArea / (wof * 36));
  }

  // BACKING
  const panels = Math.max(1, Math.ceil(totalWidth / wof));
  let backingYards = roundToEighth((panels * totalHeight) / 36);

  // BINDING (strip-based)
  const bindStripW = parseFloat(window.bindingStripWidthInput.value) || 0;
  const perimeter = 2 * (totalWidth + totalHeight);
  const stripsBinding = Math.ceil(perimeter / wof);
  let bindingYards = roundToEighth((stripsBinding * bindStripW) / 36);

  // TOTAL
  const totalYards =
    blockYards +
    sashingYards +
    sashBorderYards +
    borderYards +
    backingYards +
    bindingYards;

  const roundedTotal = roundToEighth(totalYards);

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

  const yards = roundToEighth(totalInches / 36);

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
