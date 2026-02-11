// ===== COLOR ELEMENTS =====
const colorInput = document.getElementById('colorInput');
const colorR = document.getElementById('colorR');
const colorG = document.getElementById('colorG');
const colorB = document.getElementById('colorB');

const presetSwatches = document.querySelectorAll('.color-palette .color-swatch');
const savedSwatches = document.querySelectorAll('.saved-swatch');

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
  colorInput.value = hex;
  const { r, g, b } = hexToRgb(hex);
  colorR.value = r;
  colorG.value = g;
  colorB.value = b;
}

// ===== UPDATE FROM RGB =====
function updateFromRGB() {
  const r = Math.max(0, Math.min(255, parseInt(colorR.value, 10) || 0));
  const g = Math.max(0, Math.min(255, parseInt(colorG.value, 10) || 0));
  const b = Math.max(0, Math.min(255, parseInt(colorB.value, 10) || 0));

  colorR.value = r;
  colorG.value = g;
  colorB.value = b;

  const hex = rgbToHex(r, g, b);
  colorInput.value = hex;
}

// ===== EVENT LISTENERS =====
colorInput.addEventListener('input', () => {
  setColorFromHex(colorInput.value);
});

colorR.addEventListener('input', updateFromRGB);
colorG.addEventListener('input', updateFromRGB);
colorB.addEventListener('input', updateFromRGB);


// ===== PRESET SWATCHES =====
presetSwatches.forEach(swatch => {
  swatch.addEventListener('click', () => {
    const hex = swatch.getAttribute('data-color');
    setColorFromHex(hex);
  });
});


// ===== SAVED SWATCHES =====
savedSwatches.forEach(swatch => {
  swatch.addEventListener('click', () => {
    const savedColor = swatch.getAttribute('data-color');

    if (!savedColor) {
      // Save new color
      const hex = colorInput.value;
      swatch.setAttribute('data-color', hex);
      swatch.style.background = hex;
      swatch.classList.remove('empty');
    } else {
      // Load saved color
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
setColorFromHex(colorInput.value);
