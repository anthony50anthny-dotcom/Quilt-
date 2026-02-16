// =========================
// DARK MODE
// =========================
const darkToggle = document.getElementById("darkModeToggle");

darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  darkToggle.textContent = document.body.classList.contains("dark")
    ? "Light Mode"
    : "Dark Mode";
});

// =========================
// GRID BUTTONS + TOGGLES
// =========================
document.getElementById("buildGridBtn").addEventListener("click", () => {
  buildGrid();
});

document.getElementById("toggleSashingBtn").addEventListener("click", () => {
  window.sashingEnabled = !window.sashingEnabled;
  buildGrid();
});

document.getElementById("toggleSashingBorderBtn").addEventListener("click", () => {
  window.sashingBorderEnabled = !window.sashingBorderEnabled;
  buildGrid();
});

// =========================
// ZOOM
// =========================
zoomSlider.addEventListener("input", updateZoom);

// =========================
// SLIDE-OUT CALCULATOR PANEL (LIKE FILE 1)
// =========================
const calcPanel = document.getElementById("calcPanel");
const calcTab = document.getElementById("calcTab");

if (calcPanel && calcTab) {
  calcTab.addEventListener("click", () => {
    calcPanel.classList.toggle("open");
  });
}

// =========================
// INIT
// =========================
buildGrid();
updateZoom();
// =========================
// COLOR BOX PREVIEW (shows selected color in the square)
// =========================
function syncColorBox(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const box = input.closest(".color-box");
  if (!box) return;

  const paint = () => {
    box.style.backgroundColor = input.value;
  };

  // set initial color
  paint();

  // update on change
  input.addEventListener("input", paint);
  input.addEventListener("change", paint);
}

// Wire up your three pickers
syncColorBox("sashingColorPicker");
syncColorBox("sashingBorderColorPicker");
syncColorBox("borderColorPicker");
