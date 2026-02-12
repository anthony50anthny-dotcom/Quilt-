// ===== GRID ELEMENTS =====
window.quiltGrid = document.getElementById('quiltGrid');
window.zoomSlider = document.getElementById('zoomSlider');
window.zoomLabel = document.getElementById('zoomLabel');

// ===== INPUTS =====
window.rowsInput = document.getElementById('rowsInput');
window.colsInput = document.getElementById('colsInput');
window.blockWidthInput = document.getElementById('blockWidthInput');
window.blockHeightInput = document.getElementById('blockHeightInput');

window.sashingWidthInput = document.getElementById('sashingWidthInput');
window.sashingColorPicker = document.getElementById('sashingColorPicker');

window.sashingBorderWidthInput = document.getElementById('sashingBorderWidthInput');
window.sashingBorderColorPicker = document.getElementById('sashingBorderColorPicker');

window.borderWidthInput = document.getElementById('borderWidthInput');
window.borderColorPicker = document.getElementById('borderColorPicker');

window.colorInput = document.getElementById('colorInput');

// ===== STATE =====
window.sashingEnabled = true;
window.sashingBorderEnabled = true;

// ===== CONSTANTS =====
window.pxPerInch = 20;

// ===== ZOOM =====
function updateZoom() {
  const val = parseInt(window.zoomSlider.value, 10) || 100;
  window.quiltGrid.style.transform = `scale(${val / 100})`;
  window.zoomLabel.textContent = val + '%';
}

// ===== BUILD GRID =====
function buildGrid() {
  const rows = parseInt(window.rowsInput.value, 10) || 1;
  const cols = parseInt(window.colsInput.value, 10) || 1;
  const bw = parseInt(window.blockWidthInput.value, 10) || 1;
  const bh = parseInt(window.blockHeightInput.value, 10) || 1;

  const sashW = parseInt(window.sashingWidthInput.value, 10) || 0;
  const sashBorderW = (window.sashingBorderEnabled ? parseInt(window.sashingBorderWidthInput.value, 10) || 0 : 0);
  const borderW = parseInt(window.borderWidthInput.value, 10) || 0;

  const sashColor = window.sashingColorPicker.value;
  const sashBorderColor = window.sashingBorderColorPicker.value;
  const borderColor = window.borderColorPicker.value;

  window.quiltGrid.innerHTML = '';

  const coreWidthIn =
    cols * bw +
    (window.sashingEnabled && sashW > 0 ? (cols - 1) * sashW : 0);

  const coreHeightIn =
    rows * bh +
    (window.sashingEnabled && sashW > 0 ? (rows - 1) * sashW : 0);

  const totalWidthIn =
    coreWidthIn + 2 * sashBorderW + 2 * borderW;

  const totalHeightIn =
    coreHeightIn + 2 * sashBorderW + 2 * borderW;

  window.quiltGrid.style.gridTemplateColumns =
    `repeat(${totalWidthIn}, ${window.pxPerInch}px)`;
  window.quiltGrid.style.gridTemplateRows =
    `repeat(${totalHeightIn}, ${window.pxPerInch}px)`;

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
        window.sashingEnabled &&
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
        mini.style.backgroundColor = window.colorInput.value;
      });

      window.quiltGrid.appendChild(mini);
    }
  }
}

// ===== EXPORTS =====
window.buildGrid = buildGrid;
window.updateZoom = updateZoom;
