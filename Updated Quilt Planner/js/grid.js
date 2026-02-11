// ===== GRID ELEMENTS =====
const quiltGrid = document.getElementById('quiltGrid');
const zoomSlider = document.getElementById('zoomSlider');
const zoomLabel = document.getElementById('zoomLabel');

// ===== INPUTS =====
const rowsInput = document.getElementById('rowsInput');
const colsInput = document.getElementById('colsInput');
const blockWidthInput = document.getElementById('blockWidthInput');
const blockHeightInput = document.getElementById('blockHeightInput');

const sashingWidthInput = document.getElementById('sashingWidthInput');
const sashingColorPicker = document.getElementById('sashingColorPicker');

const sashingBorderWidthInput = document.getElementById('sashingBorderWidthInput');
const sashingBorderColorPicker = document.getElementById('sashingBorderColorPicker');

const borderWidthInput = document.getElementById('borderWidthInput');
const borderColorPicker = document.getElementById('borderColorPicker');

const colorInput = document.getElementById('colorInput');

// ===== STATE =====
let sashingEnabled = true;
let sashingBorderEnabled = true;

// ===== CONSTANTS =====
const pxPerInch = 20;

// ===== ZOOM =====
function updateZoom() {
  const val = parseInt(zoomSlider.value, 10) || 100;
  quiltGrid.style.transform = `scale(${val / 100})`;
  zoomLabel.textContent = val + '%';
}

// ===== BUILD GRID =====
function buildGrid() {
  const rows = parseInt(rowsInput.value, 10) || 1;
  const cols = parseInt(colsInput.value, 10) || 1;
  const bw = parseInt(blockWidthInput.value, 10) || 1;
  const bh = parseInt(blockHeightInput.value, 10) || 1;

  const sashW = parseInt(sashingWidthInput.value, 10) || 0;
  const sashBorderW = (sashingBorderEnabled ? parseInt(sashingBorderWidthInput.value, 10) || 0 : 0);
  const borderW = parseInt(borderWidthInput.value, 10) || 0;

  const sashColor = sashingColorPicker.value;
  const sashBorderColor = sashingBorderColorPicker.value;
  const borderColor = borderColorPicker.value;

  quiltGrid.innerHTML = '';

  const coreWidthIn =
    cols * bw +
    (sashingEnabled && sashW > 0 ? (cols - 1) * sashW : 0);

  const coreHeightIn =
    rows * bh +
    (sashingEnabled && sashW > 0 ? (rows - 1) * sashW : 0);

  const totalWidthIn =
    coreWidthIn + 2 * sashBorderW + 2 * borderW;

  const totalHeightIn =
    coreHeightIn + 2 * sashBorderW + 2 * borderW;

  quiltGrid.style.gridTemplateColumns =
    `repeat(${totalWidthIn}, ${pxPerInch}px)`;
  quiltGrid.style.gridTemplateRows =
    `repeat(${totalHeightIn}, ${pxPerInch}px)`;

  for (let r = 0; r < totalHeightIn; r++) {
    for (let c = 0; c < totalWidthIn; c++) {
      const mini = document.createElement('div');
      mini.className = 'mini';

      let color = '#ffffff';

      const inBorder =
        borderW > 0 &&
        (r < borderW ||
         r >= totalHeightIn - borderW ||
         c < borderW ||
         c >= totalWidthIn - borderW);

      const inSashBorder =
        sashBorderW > 0 &&
        r >= borderW &&
        r < totalHeightIn - borderW &&
        c >= borderW &&
        c < totalWidthIn - borderW &&
        (r < borderW + sashBorderW ||
         r >= totalHeightIn - borderW - sashBorderW ||
         c < borderW + sashBorderW ||
         c >= totalWidthIn - borderW - sashBorderW);

      const coreTop = borderW + sashBorderW;
      const coreLeft = borderW + sashBorderW;
      const coreBottom = totalHeightIn - borderW - sashBorderW;
      const coreRight = totalWidthIn - borderW - sashBorderW;

      let inSashing = false;
      if (
        sashingEnabled &&
        sashW > 0 &&
        r >= coreTop &&
        r < coreBottom &&
        c >= coreLeft &&
        c < coreRight
      ) {
        const coreR = r - coreTop;
        const coreC = c - coreLeft;

        const repeatH = bh + sashW;
        const repeatW = bw + sashW;

        const blockRowIndex = Math.floor(coreR / repeatH);
        const posInRepeatH = coreR % repeatH;
        const blockColIndex = Math.floor(coreC / repeatW);
        const posInRepeatW = coreC % repeatW;

        const isHorizontalSash =
          blockRowIndex < rows - 1 &&
          posInRepeatH >= bh &&
          posInRepeatH < bh + sashW;

        const isVerticalSash =
          blockColIndex < cols - 1 &&
          posInRepeatW >= bw &&
          posInRepeatW < bw + sashW;

        inSashing = isHorizontalSash || isVerticalSash;
      }

      if (inBorder) {
        color = borderColor;
      } else if (inSashBorder) {
        color = sashBorderColor;
      } else if (inSashing) {
        color = sashColor;
      }

      mini.style.backgroundColor = color;

      mini.addEventListener('click', () => {
        mini.style.backgroundColor = colorInput.value;
      });

      quiltGrid.appendChild(mini);
    }
  }
}

// ===== EXPORTS =====
window.buildGrid = buildGrid;
window.updateZoom = updateZoom;
window.sashingEnabled = sashingEnabled;
window.sashingBorderEnabled = sashingBorderEnabled;

