// =========================
// DOM ELEMENT REFERENCES
// =========================

// Quilt settings inputs
const rowsInput = document.getElementById("rowsInput");
const colsInput = document.getElementById("colsInput");
const blockWidthInput = document.getElementById("blockWidthInput");
const blockHeightInput = document.getElementById("blockHeightInput");
const sashingWidthInput = document.getElementById("sashingWidthInput");
const sashingBorderWidthInput = document.getElementById("sashingBorderWidthInput");
const borderWidthInput = document.getElementById("borderWidthInput");

// Strip calculator inputs
const stripWidthInput = document.getElementById("stripWidthInput");
const stripLengthInput = document.getElementById("stripLengthInput");

// Fabric calculator inputs
const wofInput = document.getElementById("wofInput");
const seamInput = document.getElementById("seamInput");

// These come from main.js — but we define safe defaults here
window.sashingEnabled = window.sashingEnabled ?? true;
window.sashingBorderEnabled = window.sashingBorderEnabled ?? true;


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
  const rows = parseInt(rowsInput.value, 10) || 1;
  const cols = parseInt(colsInput.value, 10) || 1;
  const bw = parseFloat(blockWidthInput.value) || 1;
  const bh = parseFloat(blockHeightInput.value) || 1;
  const sashW = parseFloat(sashingWidthInput.value) || 0;
  const sashBorderW = (window.sashingBorderEnabled && parseFloat(sashingBorderWidthInput.value) > 0)
    ? parseFloat(sashingBorderWidthInput.value)
    : 0;
  const borderW = parseFloat(borderWidthInput.value) || 0;

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
// QUILT SIZE CALCULATOR
// =========================

function updateQuiltSize() {
  const { totalWidth, totalHeight } = getQuiltDimensions();

  const out = document.getElementById("quiltSizeOutput");
  if (!out) return;

  out.innerHTML =
    `Width: ${totalWidth.toFixed(1)} inches<br>` +
    `Height: ${totalHeight.toFixed(1)} inches`;
}


// =========================
// MAIN FABRIC CALCULATOR
// =========================

function calculateFabric() {
  const { rows, cols, bw, bh, sashW, sashBorderW, borderW, coreWidth, coreHeight, totalWidth, totalHeight } =
    getQuiltDimensions();

  const wof = parseFloat(wofInput.value) || 42;
  const seam = parseFloat(seamInput.value) || 0;

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

    const vertArea = vertCount * cutW * vertLen;
    const horizArea = horizCount * cutW * horizLen;

    sashingYards = roundToEighth((vertArea + horizArea) / (wof * 36));
  }

  // SASHING BORDER
  let sashBorderYards = 0;
  if (window.sashingBorderEnabled && sashBorderW > 0) {
    const cutW = sashBorderW + 2 * seam;

    const innerW = coreWidth;
    const innerH = coreHeight;

    const vertLen = innerH + 2 * sashBorderW + 2 * seam;
    const horizLen = innerW + 2 * sashBorderW + 2 * seam;

    const vertArea = 2 * cutW * vertLen;
    const horizArea = 2 * cutW * horizLen;

    sashBorderYards = roundToEighth((vertArea + horizArea) / (wof * 36));
  }

  // OUTER BORDER
  let borderYards = 0;
  if (borderW > 0) {
    const cutW = borderW + 2 * seam;

    const innerW = coreWidth + 2 * sashBorderW;
    const innerH = coreHeight + 2 * sashBorderW;

    const vertLen = innerH + 2 * borderW + 2 * seam;
    const horizLen = innerW + 2 * borderW + 2 * seam;

    const vertArea = 2 * cutW * vertLen;
    const horizArea = 2 * cutW * horizLen;

    borderYards = roundToEighth((vertArea + horizArea) / (wof * 36));
  }

  // BACKING
  const panels = Math.max(1, Math.ceil(totalWidth / wof));
  let backingYards = roundToEighth((panels * totalHeight) / 36);

  // TOTAL
  const totalYards = roundToEighth(
    blockYards + sashingYards + sashBorderYards + borderYards + backingYards
  );

  // OUTPUT
  let text = "";
  text += `Blocks:         ${formatYards(blockYards)} yards\n`;
  text += `Sashing:        ${formatYards(sashingYards)} yards\n`;
  text += `Sashing Border: ${formatYards(sashBorderYards)} yards\n`;
  text += `Border:         ${formatYards(borderYards)} yards\n`;
  text += `Backing:        ${formatYards(backingYards)} yards\n`;
  text += "-----------------------------\n";
  text += `Total:          ${formatYards(totalYards)} yards`;

  return text;
}


// =========================
// STRIP CALCULATOR
// =========================

function calculateStrips() {
  const stripW = parseFloat(stripWidthInput.value) || 0;
  const neededLength = parseFloat(stripLengthInput.value) || 0;
  const wof = parseFloat(wofInput.value) || 42;

  const stripsPerWOF = Math.floor(wof / stripW);
  const totalStrips = Math.ceil(neededLength / wof);
  const totalInches = totalStrips * wof;
  const yards = roundToEighth(totalInches / 36);

  const out = document.getElementById("stripCalcOutput");
  out.innerHTML =
    `Strips per WOF: ${stripsPerWOF}<br>` +
    `Total Strips Needed: ${totalStrips}<br>` +
    `Total Inches: ${totalInches}<br>` +
    `Yardage: ${formatYards(yards)} yards`;
}


// =========================
// EVENT BINDINGS
// =========================

document.getElementById("calcFabricBtn").addEventListener("click", () => {
  document.getElementById("fabricOutput").innerText = calculateFabric();
});

document.getElementById("calcStripsBtn").addEventListener("click", calculateStrips);

[
  rowsInput,
  colsInput,
  blockWidthInput,
  blockHeightInput,
  sashingWidthInput,
  sashingBorderWidthInput,
  borderWidthInput
].forEach(el => {
  el.addEventListener("input", updateQuiltSize);
});

updateQuiltSize();


// =========================
// EXPORT
// =========================

window.calculateFabric = calculateFabric;
