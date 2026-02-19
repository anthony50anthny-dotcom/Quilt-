export function componentToHex(c: number): string {
  const v = Math.max(0, Math.min(255, c | 0));
  return v.toString(16).padStart(2, '0');
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(ch => ch + ch).join('');
  }
  const num = parseInt(hex, 16);
  if (isNaN(num)) return { r: 0, g: 0, b: 0 };
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
