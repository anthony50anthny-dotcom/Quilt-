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

// =========================
// STATE
// =========================
window.sashingEnabled = true;
window.sashingBorderEnabled = true;

// =========================
// CONSTANTS
// =========================
window.pxPerInch = 20; // 1 inch = 1 cell = 20px

// =========================
// GRID SIZE (CELL COUNTS)
// =========================
window.gridCols = 0;
window.gridRows = 0;

// =========================
// ZOOM
// =========================
function updateZoom() {
  const val = parseInt(window.zoomSlider.value, 10) || 100;
  const scale = val / 100;

  quiltGrid.style.transform = `scale(${scale})`;
  quiltGrid.style.transformOrigin = "top left";

  window.zoomLabel.textContent = val + "%";
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

  // Clear grid
  quiltGrid.innerHTML = "";

  // =========================
  // DIMENSION MATH (IN INCHES = CELLS)
  // =========================

  const coreWidthIn =
    cols * bw +
    (window.sashingEnabled && sashW > 0 ? (cols - 1) * sashW : 0);

  const coreHeightIn =
    rows * bh +
    (window.sashingEnabled && sashW > 0 ? (rows - 1) * sashW : 0);

  const totalWidthIn = coreWidthIn + 2 * sashBorderW + 2 * borderW;
  const totalHeightIn = coreHeightIn + 2 * sashBorderW + 2 * borderW;

  // Store cell counts
  window.gridCols = totalWidthIn;
  window.gridRows = totalHeightIn;

  // Apply CSS grid sizing
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

      let color = "#ffffff";

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
        color = borderColor;
      } else if (inSashBorder) {
        color = sashBorderColor;
      } else if (inSashing) {
        color = sashColor;
      }

      mini.style.backgroundColor = color;

      // CLICK TO FILL
      mini.addEventListener("click", () => {
        mini.style.backgroundColor = window.colorInput.value;
      });

      quiltGrid.appendChild(mini);
    }
  }
}

// =========================
// DRAG-TO-FILL
// =========================

let isDragging = false;
let dragStart = null;
let dragEnd = null;
let selectionBox = null;

// Convert mouse to cell (zoom aware)
function getCellFromMouse(event) {
  const rect = quiltGrid.getBoundingClientRect();
  const zoom = parseInt(window.zoomSlider.value, 10) / 100;

  const x = (event.clientX - rect.left) / zoom;
  const y = (event.clientY - rect.top) / zoom;

  const col = Math.floor(x / pxPerInch);
  const row = Math.floor(y / pxPerInch);

  return { row, col };
}

// Create selection overlay
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

// Update selection rectangle
function updateSelectionBox() {
  if (!dragStart || !dragEnd) return;

  const minRow = Math.min(dragStart.row, dragEnd.row);
  const maxRow = Math.max(dragStart.row, dragEnd.row);
  const minCol = Math.min(dragStart.col, dragEnd.col);
  const maxCol = Math.max(dragStart.col, dragEnd.col);

  const top = minRow * pxPerInch;
  const left = minCol * pxPerInch;
  const width = (maxCol - minCol + 1) * pxPerInch;
  const height = (maxRow - minRow + 1) * pxPerInch;

  ensureSelectionBox();
  selectionBox.style.display = "block";
  selectionBox.style.top = top + "px";
  selectionBox.style.left = left + "px";
  selectionBox.style.width = width + "px";
  selectionBox.style.height = height + "px";
}

// Fill rectangle
function fillRectangle() {
  if (!dragStart || !dragEnd) return;

  const minRow = Math.min(dragStart.row, dragEnd.row);
  const maxRow = Math.max(dragStart.row, dragEnd.row);
  const minCol = Math.min(dragStart.col, dragEnd.col);
  const maxCol = Math.max(dragStart.col, dragEnd.col);

  const children = quiltGrid.children;

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      const index = r * window.gridCols + c;
      const cell = children[index];
      if (cell) {
        cell.style.backgroundColor = window.colorInput.value;
      }
    }
  }
}

// Mouse events
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

// Exports
window.buildGrid = buildGrid;
window.updateZoom = updateZoom;
