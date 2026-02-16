// =========================
// ELEMENT REFERENCES
// =========================
window.quiltGrid = document.getElementById("quiltGrid");
window.zoomSlider = document.getElementById("zoomSlider");
window.zoomLabel = document.getElementById("zoomLabel");

// Inputs
window.rowsInput = document.getElementById("rowsInput");
window.colsInput = document.getElementById("colsInput");
window.blockWidthInput = document.getElementById("blockWidthInput");
window.blockHeightInput = document.getElementById("blockHeightInput");

window.sashingWidthInput = document.getElementById("sashingWidthInput");
window.sashingColorPicker = document.getElementById("sashingColorPicker");

window.sashingBorderWidthInput = document.getElementById("sashingBorderWidthInput");
window.sashingBorderColorPicker = document.getElementById("sashingBorderColorPicker");

window.borderWidthInput = document.getElementById("borderWidthInput");
window.borderColorPicker = document.getElementById("borderColorPicker");

window.colorInput = document.getElementById("colorInput");

// Fabric image (set in main.js)
window.fabricImageURL = window.fabricImageURL || null;

// =========================
// STATE
// =========================
window.sashingEnabled = true;
window.sashingBorderEnabled = true;

// =========================
// CONSTANTS
// =========================
window.pxPerInch = 20;

// =========================
// GRID SIZE (stored in INCHES)
// =========================
window.gridCols = 0; // inches
window.gridRows = 0; // inches

// =========================
// ZOOM
// =========================
function updateZoom() {
  const val = parseInt(window.zoomSlider.value, 10) || 100;
  const scale = val / 100;

  quiltGrid.style.transform = `scale(${scale})`;
  quiltGrid.style.transformOrigin = "top center";

  window.zoomLabel.textContent = val + "%";
}

// =========================
// SMART AUTO-FIT (ONLY IF TOO BIG)
// =========================
function autoFitIfNeeded() {
  const outer = document.getElementById("quiltOuter");
  if (!outer || !window.quiltGrid) return;

  // TRUE grid size in pixels (inches * pxPerInch)
  const gridWidthPx = window.gridCols * window.pxPerInch;
  const gridHeightPx = window.gridRows * window.pxPerInch;

  // Available size in pixels inside quiltOuter (minus padding)
  const styles = getComputedStyle(outer);
  const padX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
  const padY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);

  const availW = outer.clientWidth - padX;
  const availH = outer.clientHeight - padY;

  if (availW <= 0 || availH <= 0) return;

  // If it already fits at 100%, do nothing
  if (gridWidthPx <= availW && gridHeightPx <= availH) return;

  // Fit scale (only zoom OUT)
  const scale = Math.min(availW / gridWidthPx, availH / gridHeightPx);

  // Slider range is 50–200 in your HTML; keep within that
  const percent = Math.max(50, Math.min(200, Math.floor(scale * 100)));

  window.zoomSlider.value = percent;
  updateZoom();
}

// =========================
// FABRIC TILE LOGIC
// =========================
function applyFabricToCell(cell, r, c) {
  const repeatInches = window.fabricRepeatInches || 6;
  const tileSize = repeatInches * window.pxPerInch;

  const offsetX = -(c % repeatInches) * window.pxPerInch;
  const offsetY = -(r % repeatInches) * window.pxPerInch;

  cell.style.backgroundImage = `url(${window.fabricImageURL})`;
  cell.style.backgroundSize = `${tileSize}px ${tileSize}px`;
  cell.style.backgroundRepeat = "repeat";
  cell.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
  cell.style.backgroundColor = "transparent";
}

// =========================
// BUILD GRID
// =========================
function buildGrid() {
  const rows = parseInt(rowsInput.value, 10) || 1;
  const cols = parseInt(colsInput.value, 10) || 1;
  const bw = parseInt(blockWidthInput.value, 10) || 1;
  const bh = parseInt(blockHeightInput.value, 10) || 1;

  const sashW = parseInt(sashingWidthInput.value, 10) || 0;
  const sashBorderW = window.sashingBorderEnabled
    ? parseInt(sashingBorderWidthInput.value, 10) || 0
    : 0;

  const borderW = parseInt(borderWidthInput.value, 10) || 0;

  const sashColor = sashingColorPicker.value;
  const sashBorderColor = sashingBorderColorPicker.value;
  const borderColor = borderColorPicker.value;

  quiltGrid.innerHTML = "";

  const coreWidthIn =
    cols * bw +
    (window.sashingEnabled && sashW > 0 ? (cols - 1) * sashW : 0);

  const coreHeightIn =
    rows * bh +
    (window.sashingEnabled && sashW > 0 ? (rows - 1) * sashW : 0);

  const totalWidthIn = coreWidthIn + 2 * sashBorderW + 2 * borderW;
  const totalHeightIn = coreHeightIn + 2 * sashBorderW + 2 * borderW;

  // Store in INCHES
  window.gridCols = totalWidthIn;
  window.gridRows = totalHeightIn;

  quiltGrid.style.gridTemplateColumns =
    `repeat(${totalWidthIn}, ${pxPerInch}px)`;
  quiltGrid.style.gridTemplateRows =
    `repeat(${totalHeightIn}, ${pxPerInch}px)`;

  // =========================
  // BUILD CELLS
  // =========================
  for (let r = 0; r < totalHeightIn; r++) {
    for (let c = 0; c < totalWidthIn; c++) {
      const mini = document.createElement("div");
      mini.className = "mini";

      mini.style.backgroundColor = "#ffffff";
      mini.style.backgroundImage = "none";
      mini.style.border = "1px solid rgba(0,0,0,0.15)";

      // BORDER REGION
      const inBorder =
        borderW > 0 &&
        (r < borderW ||
         r >= totalHeightIn - borderW ||
         c < borderW ||
         c >= totalWidthIn - borderW);

      // SASH BORDER REGION
      const inSashBorder =
        sashBorderW > 0 &&
        r >= borderW &&
        r < totalHeightIn - borderW &&
        c >= borderW &&
        c < totalWidthIn - borderW &&
        (
          r < borderW + sashBorderW ||
          r >= totalHeightIn - borderW - sashBorderW ||
          c < borderW + sashBorderW ||
          c >= totalWidthIn - borderW - sashBorderW
        );

      // CORE REGION
      const coreTop = borderW + sashBorderW;
      const coreLeft = borderW + sashBorderW;
      const coreBottom = totalHeightIn - borderW - sashBorderW;
      const coreRight = totalWidthIn - borderW - sashBorderW;

      // SASHING REGION
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

      // COLOR PRIORITY
      if (inBorder) {
        mini.style.backgroundColor = borderColor;
      } else if (inSashBorder) {
        mini.style.backgroundColor = sashBorderColor;
      } else if (inSashing) {
        mini.style.backgroundColor = sashColor;
      }

      // =========================
      // CLICK TO FILL
      // =========================
      mini.addEventListener("click", () => {
        if (window.fabricImageURL) {
          applyFabricToCell(mini, r, c);
        } else {
          mini.style.backgroundImage = "none";
          mini.style.backgroundColor = window.colorInput.value;
        }
      });

      quiltGrid.appendChild(mini);
    }
  }

  // After rebuild, auto-fit only if it won't fit
  autoFitIfNeeded();

  // Update size label if calculator.js provided it
  if (window.updateQuiltSizeDisplay) window.updateQuiltSizeDisplay();
}

// =========================
// DRAG-TO-FILL
// =========================
let isDragging = false;
let dragStart = null;
let dragEnd = null;
let selectionBox = null;

function getCellFromMouse(event) {
  const rect = quiltGrid.getBoundingClientRect();
  const zoom = (parseInt(window.zoomSlider.value, 10) || 100) / 100;

  const x = (event.clientX - rect.left) / zoom;
  const y = (event.clientY - rect.top) / zoom;

  return {
    row: Math.floor(y / pxPerInch),
    col: Math.floor(x / pxPerInch)
  };
}

function ensureSelectionBox() {
  if (!selectionBox) {
    selectionBox = document.createElement("div");
    selectionBox.style.position = "absolute";
    selectionBox.style.background = "rgba(0, 120, 215, 0.25)";
    selectionBox.style.border = "2px solid #0078d7";
    selectionBox.style.pointerEvents = "none";
    selectionBox.style.zIndex = "50";
    quiltGrid.appendChild(selectionBox);
  }
}

function updateSelectionBox() {
  if (!dragStart || !dragEnd) return;

  const minRow = Math.min(dragStart.row, dragEnd.row);
  const maxRow = Math.max(dragStart.row, dragEnd.row);
  const minCol = Math.min(dragStart.col, dragEnd.col);
  const maxCol = Math.max(dragStart.col, dragEnd.col);

  ensureSelectionBox();
  selectionBox.style.display = "block";
  selectionBox.style.top = minRow * pxPerInch + "px";
  selectionBox.style.left = minCol * pxPerInch + "px";
  selectionBox.style.width = (maxCol - minCol + 1) * pxPerInch + "px";
  selectionBox.style.height = (maxRow - minRow + 1) * pxPerInch + "px";
}

function fillRectangle() {
  if (!dragStart || !dragEnd) return;

  const minRow = Math.min(dragStart.row, dragEnd.row);
  const maxRow = Math.max(dragStart.row, dragEnd.row);
  const minCol = Math.min(dragStart.col, dragEnd.col);
  const maxCol = Math.max(dragStart.col, dragEnd.col);

  const children = quiltGrid.children;

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      const index = r * window.gridCols + c; // gridCols is inches count
      const cell = children[index];
      if (!cell) continue;

      if (window.fabricImageURL) {
        applyFabricToCell(cell, r, c);
      } else {
        cell.style.backgroundImage = "none";
        cell.style.backgroundColor = window.colorInput.value;
      }
    }
  }
}

quiltGrid.addEventListener("mousedown", (e) => {
  isDragging = true;
  dragStart = getCellFromMouse(e);
  dragEnd = { ...dragStart };
  updateSelectionBox();
});

quiltGrid.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  dragEnd = getCellFromMouse(e);
  updateSelectionBox();
});

document.addEventListener("mouseup", () => {
  if (!isDragging) return;
  isDragging = false;

  if (selectionBox) selectionBox.style.display = "none";

  fillRectangle();

  dragStart = null;
  dragEnd = null;
});

// Fit again if the window size changes
window.addEventListener("resize", () => {
  autoFitIfNeeded();
});

// =========================
// EXPORTS
// =========================
window.buildGrid = buildGrid;
window.updateZoom = updateZoom;
window.autoFitIfNeeded = autoFitIfNeeded;
