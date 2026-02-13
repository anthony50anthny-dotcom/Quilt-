document.addEventListener("DOMContentLoaded", () => {

  // ===== INITIALIZE ZOOM =====
  zoomSlider.addEventListener('input', () => {
    updateZoom();
  });

  // ===== BUILD GRID BUTTON =====
  document.getElementById('buildGridBtn').addEventListener('click', () => {
    buildGrid();
  });

  // ===== TOGGLE SASHING =====
  document.getElementById('toggleSashingBtn').addEventListener('click', () => {
    window.sashingEnabled = !window.sashingEnabled;
    buildGrid();
  });

  // ===== TOGGLE SASHING BORDER =====
  document.getElementById('toggleSashingBorderBtn').addEventListener('click', () => {
    window.sashingBorderEnabled = !window.sashingBorderEnabled;
    buildGrid();
  });

  // ===== CALCULATE FABRIC =====
  document.getElementById('calcFabricBtn').addEventListener('click', () => {
    const result = calculateFabric();
    document.getElementById('fabricOutput').textContent = result;
  });

  // ===== CALCULATOR PANEL TOGGLE =====
  document.getElementById('calcTab').addEventListener('click', () => {
    document.getElementById('calcPanel').classList.toggle('open');
  });
// ===== QUILT SIZE LISTENERS =====
function attachSizeListeners() {
  const inputs = [
    rowsInput, colsInput,
    blockWidthInput, blockHeightInput,
    sashingWidthInput, sashingBorderWidthInput,
    borderWidthInput
  ];

  inputs.forEach(inp => {
    inp.addEventListener("input", updateQuiltSizeDisplay);
  });
}

attachSizeListeners();
updateQuiltSizeDisplay();
  // ===== INITIAL BUILD =====
  buildGrid();
  updateZoom();

});
