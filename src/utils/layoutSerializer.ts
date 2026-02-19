import type { AppState } from '../context/AppContext';

export interface GridLayout {
  version: 1;
  exportedAt: string;
  quilt: {
    rows: number;
    cols: number;
    blockWidth: number;
    blockHeight: number;
    sashingEnabled: boolean;
    sashingWidth: number;
    sashingColor: string;
    sashingBorderEnabled: boolean;
    sashingBorderWidth: number;
    sashingBorderColor: string;
    borderWidth: number;
    borderColor: string;
  };
  paintLayer: string[][];
  fabricRepeatInches: number;
}

export function exportLayout(state: AppState): void {
  const layout: GridLayout = {
    version: 1,
    exportedAt: new Date().toISOString(),
    quilt: {
      rows: state.rows,
      cols: state.cols,
      blockWidth: state.blockWidth,
      blockHeight: state.blockHeight,
      sashingEnabled: state.sashingEnabled,
      sashingWidth: state.sashingWidth,
      sashingColor: state.sashingColor,
      sashingBorderEnabled: state.sashingBorderEnabled,
      sashingBorderWidth: state.sashingBorderWidth,
      sashingBorderColor: state.sashingBorderColor,
      borderWidth: state.borderWidth,
      borderColor: state.borderColor,
    },
    paintLayer: state.paintLayer,
    fabricRepeatInches: state.fabricRepeatInches,
  };

  const blob = new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quilt-layout.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function importLayout(file: File): Promise<GridLayout> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target!.result as string) as GridLayout;
        if (data.version !== 1) {
          reject(new Error('Unknown layout version'));
          return;
        }
        resolve(data);
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
