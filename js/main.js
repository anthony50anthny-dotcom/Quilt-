// ===== COLOR ELEMENTS =====
window.colorInput = document.getElementById('colorInput');
window.colorR = document.getElementById('colorR');
window.colorG = document.getElementById('colorG');
window.colorB = document.getElementById('colorB');

window.presetSwatches = document.querySelectorAll('.color-palette .color-swatch');
window.savedSwatches = document.querySelectorAll('.saved-swatch');

// ===== COLOR HELPERS =====
function componentToHex(c) {
  const v = Math.max(0, Math.min(255, c | 0));
  return v.toString(16).padStart(2, '0');
}

function rgbToHex(r, g, b) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(ch => ch + ch).join('');
  }
  const num = parseInt(hex, 16);
  if (isNaN(num)) return { r: 0, g: 0, b: 0 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

// ===== SET COLOR FROM HEX =====
function setColorFromHex(hex) {
  window.colorInput.value = hex;
  const { r, g, b } = hexToRgb(hex);
  window.colorR.value = r;
  window.colorG.value = g;
  window.colorB.value = b;
}

// ===== UPDATE FROM RGB =====
function updateFromRGB() {
  const r = Math.max(0, Math.min(255, parseInt(window.colorR.value, 10) || 0));
  const g = Math.max(0, Math.min(255, parseInt(window.colorG.value, 10) || 0));
  const b = Math.max(0, Math.min(255, parseInt(window.colorB.value, 10) || 0));

  window.colorR.value = r;
  window.colorG.value = g;
  window.colorB.value = b;

  const hex = rgbToHex(r, g, b);
  window.colorInput.value = hex;
}

// ===== EVENT LISTENERS =====
window.colorInput.addEventListener('input', () => {
  setColorFromHex(window.colorInput.value);
});

window.colorR.addEventListener('input', updateFromRGB);
window.colorG.addEventListener('input', updateFromRGB);
window.colorB.addEventListener('input', updateFromRGB);

// ===== PRESET SWATCHES =====
window.presetSwatches.forEach(swatch => {
  swatch.addEventListener('click', () => {
    const hex = swatch.getAttribute('data-color');
    setColorFromHex(hex);
  });
});

// ===== SAVED SWATCHES =====
window.savedSwatches.forEach(swatch => {
  swatch.addEventListener('click', () => {
    const savedColor = swatch.getAttribute('data-color');

    if (!savedColor) {
      const hex = window.colorInput.value;
      swatch.setAttribute('data-color', hex);
      swatch.style.background = hex;
      swatch.classList.remove('empty');
    } else {
      setColorFromHex(savedColor);
    }
  });

  swatch.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    swatch.removeAttribute('data-color');
    swatch.style.background = '';
    swatch.classList.add('empty');
  });
});

// ===== INITIALIZE =====
setColorFromHex(window.colorInput.value);
