// =========================
// INITIAL EVENT WIRING
// =========================

// =========================
// DARK MODE TOGGLE
// =========================
const darkToggle = document.getElementById("darkModeToggle");

darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  // Update button text
  if (document.body.classList.contains("dark")) {
    darkToggle.textContent = "Light Mode";
  } else {
    darkToggle.textContent = "Dark Mode";
  }
});
// =========================
// COLOR BOX PREVIEW SYNC
// =========================

// Sashing preview
document.getElementById("sashingColorPicker").addEventListener("input", (e) => {
  e.target.parentElement.style.backgroundColor = e.target.value;
});

// Sashing Border preview
document.getElementById("sashingBorderColorPicker").addEventListener("input", (e) => {
  e.target.parentElement.style.backgroundColor = e.target.value;
});

// Outer Border preview
document.getElementById("borderColorPicker").addEventListener("input", (e) => {
  e.target.parentElement.style.backgroundColor = e.target.value;
});
// Build grid button
document.getElementById("buildGridBtn").addEventListener("click", () => {
  buildGrid();
  updateQuiltSizeDisplay();
});

// Toggle sashing
document.getElementById("toggleSashingBtn").addEventListener("click", () => {
  window.sashingEnabled = !window.sashingEnabled;
  buildGrid();
  updateQuiltSizeDisplay();
});

// Toggle sashing border
document.getElementById("toggleSashingBorderBtn").addEventListener("click", () => {
  window.sashingBorderEnabled = !window.sashingBorderEnabled;
  buildGrid();
  updateQuiltSizeDisplay();
});

// Zoom slider
zoomSlider.addEventListener("input", updateZoom);

// Fabric calculator
document.getElementById("calcFabricBtn").addEventListener("click", () => {
  calculateFabric();
});

// Strip calculator
document.getElementById("calcStripsBtn").addEventListener("click", () => {
  calculateStrips();
});

// =========================
// SLIDE-OUT CALCULATOR PANEL
// =========================
const calcPanel = document.getElementById("calcPanel");
const calcTab = document.getElementById("calcTab");

calcTab.addEventListener("click", () => {
  calcPanel.classList.toggle("open");
});

// =========================
// INITIALIZE APP
// =========================
function initialize() {
  buildGrid();
  updateZoom();
  updateQuiltSizeDisplay();
}

initialize();
