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
// FABRIC UPLOAD
// =========================
document.getElementById("fabricUpload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    window.fabricImageURL = evt.target.result;
    window.fabricModeActive = true;
    const btn = document.getElementById("fabricToggleBtn");
    btn.disabled = false;
    btn.textContent = "Fabric Mode: On";
    btn.classList.add("fabric-active");
  };
  reader.readAsDataURL(file);
});

document.getElementById("fabricRepeatInput").addEventListener("input", () => {
  const val = parseFloat(document.getElementById("fabricRepeatInput").value);
  if (val > 0) window.fabricRepeatInches = val;
});

document.getElementById("fabricToggleBtn").addEventListener("click", () => {
  window.fabricModeActive = !window.fabricModeActive;
  const btn = document.getElementById("fabricToggleBtn");
  btn.textContent = window.fabricModeActive ? "Fabric Mode: On" : "Fabric Mode: Off";
  btn.classList.toggle("fabric-active", window.fabricModeActive);
});

document.getElementById("clearFabricBtn").addEventListener("click", () => {
  window.fabricImageURL = null;
  window.fabricModeActive = false;
  document.getElementById("fabricUpload").value = "";
  const btn = document.getElementById("fabricToggleBtn");
  btn.disabled = true;
  btn.textContent = "Fabric Mode: Off";
  btn.classList.remove("fabric-active");
});

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
