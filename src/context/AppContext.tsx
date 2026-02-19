import React, { createContext, useContext, useReducer } from 'react';
import { computeGridDimensions, makePaintLayer } from '../utils/gridGeometry';
import type { GridLayout } from '../utils/layoutSerializer';

export interface AppState {
  rows: number;
  cols: number;
  blockWidth: number;
  blockHeight: number;
  sashingWidth: number;
  sashingColor: string;
  sashingBorderWidth: number;
  sashingBorderColor: string;
  borderWidth: number;
  borderColor: string;
  sashingEnabled: boolean;
  sashingBorderEnabled: boolean;
  activeColor: string;
  savedColors: (string | null)[];
  fabricImageURL: string | null;
  fabricRepeatInches: number;
  fabricModeActive: boolean;
  darkMode: boolean;
  zoom: number;
  paintLayer: string[][];
  gridCols: number;
  gridRows: number;
  // calculator panel inputs
  wof: number;
  seam: number;
  sashStripWidth: number;
  bindingStripWidth: number;
}

type Action =
  | { type: 'SET_ROWS'; value: number }
  | { type: 'SET_COLS'; value: number }
  | { type: 'SET_BLOCK_WIDTH'; value: number }
  | { type: 'SET_BLOCK_HEIGHT'; value: number }
  | { type: 'SET_SASHING_WIDTH'; value: number }
  | { type: 'SET_SASHING_COLOR'; value: string }
  | { type: 'SET_SASHING_BORDER_WIDTH'; value: number }
  | { type: 'SET_SASHING_BORDER_COLOR'; value: string }
  | { type: 'SET_BORDER_WIDTH'; value: number }
  | { type: 'SET_BORDER_COLOR'; value: string }
  | { type: 'TOGGLE_SASHING' }
  | { type: 'TOGGLE_SASHING_BORDER' }
  | { type: 'SET_ACTIVE_COLOR'; value: string }
  | { type: 'SAVE_COLOR'; index: number }
  | { type: 'LOAD_COLOR'; index: number }
  | { type: 'CLEAR_SAVED_COLOR'; index: number }
  | { type: 'SET_FABRIC_URL'; url: string }
  | { type: 'SET_FABRIC_REPEAT'; value: number }
  | { type: 'TOGGLE_FABRIC_MODE' }
  | { type: 'CLEAR_FABRIC' }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_ZOOM'; value: number }
  | { type: 'BUILD_GRID' }
  | { type: 'PAINT_CELL'; row: number; col: number; value: string }
  | { type: 'PAINT_RECT'; minRow: number; maxRow: number; minCol: number; maxCol: number; value: string }
  | { type: 'IMPORT_LAYOUT'; layout: GridLayout }
  | { type: 'SET_WOF'; value: number }
  | { type: 'SET_SEAM'; value: number }
  | { type: 'SET_SASH_STRIP_WIDTH'; value: number }
  | { type: 'SET_BINDING_STRIP_WIDTH'; value: number };

const initialState: AppState = {
  rows: 3,
  cols: 3,
  blockWidth: 15,
  blockHeight: 18,
  sashingWidth: 2,
  sashingColor: '#bfbfbf',
  sashingBorderWidth: 2,
  sashingBorderColor: '#666666',
  borderWidth: 4,
  borderColor: '#8c8c8c',
  sashingEnabled: true,
  sashingBorderEnabled: true,
  activeColor: '#ffcc00',
  savedColors: [null, null, null, null, null, null],
  fabricImageURL: null,
  fabricRepeatInches: 6,
  fabricModeActive: false,
  darkMode: false,
  zoom: 100,
  paintLayer: [],
  gridCols: 0,
  gridRows: 0,
  wof: 42,
  seam: 0.25,
  sashStripWidth: 2,
  bindingStripWidth: 2.5,
};

function buildGridState(state: AppState): Pick<AppState, 'gridCols' | 'gridRows' | 'paintLayer'> {
  const dims = computeGridDimensions({
    rows: state.rows,
    cols: state.cols,
    blockWidth: state.blockWidth,
    blockHeight: state.blockHeight,
    sashingEnabled: state.sashingEnabled,
    sashingWidth: state.sashingWidth,
    sashingBorderEnabled: state.sashingBorderEnabled,
    sashingBorderWidth: state.sashingBorderWidth,
    borderWidth: state.borderWidth,
  });
  return {
    gridCols: dims.totalWidthIn,
    gridRows: dims.totalHeightIn,
    paintLayer: makePaintLayer(dims.totalHeightIn, dims.totalWidthIn),
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ROWS': return { ...state, rows: action.value };
    case 'SET_COLS': return { ...state, cols: action.value };
    case 'SET_BLOCK_WIDTH': return { ...state, blockWidth: action.value };
    case 'SET_BLOCK_HEIGHT': return { ...state, blockHeight: action.value };
    case 'SET_SASHING_WIDTH': return { ...state, sashingWidth: action.value };
    case 'SET_SASHING_COLOR': return { ...state, sashingColor: action.value };
    case 'SET_SASHING_BORDER_WIDTH': return { ...state, sashingBorderWidth: action.value };
    case 'SET_SASHING_BORDER_COLOR': return { ...state, sashingBorderColor: action.value };
    case 'SET_BORDER_WIDTH': return { ...state, borderWidth: action.value };
    case 'SET_BORDER_COLOR': return { ...state, borderColor: action.value };
    case 'TOGGLE_SASHING': return { ...state, sashingEnabled: !state.sashingEnabled, ...buildGridState({ ...state, sashingEnabled: !state.sashingEnabled }) };
    case 'TOGGLE_SASHING_BORDER': return { ...state, sashingBorderEnabled: !state.sashingBorderEnabled, ...buildGridState({ ...state, sashingBorderEnabled: !state.sashingBorderEnabled }) };
    case 'SET_ACTIVE_COLOR': return { ...state, activeColor: action.value };
    case 'SAVE_COLOR': {
      const savedColors = [...state.savedColors];
      savedColors[action.index] = state.activeColor;
      return { ...state, savedColors };
    }
    case 'LOAD_COLOR': {
      const color = state.savedColors[action.index];
      return color ? { ...state, activeColor: color } : state;
    }
    case 'CLEAR_SAVED_COLOR': {
      const savedColors = [...state.savedColors];
      savedColors[action.index] = null;
      return { ...state, savedColors };
    }
    case 'SET_FABRIC_URL':
      return { ...state, fabricImageURL: action.url, fabricModeActive: true };
    case 'SET_FABRIC_REPEAT':
      return { ...state, fabricRepeatInches: action.value };
    case 'TOGGLE_FABRIC_MODE':
      return { ...state, fabricModeActive: !state.fabricModeActive };
    case 'CLEAR_FABRIC':
      return { ...state, fabricImageURL: null, fabricModeActive: false };
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };
    case 'SET_ZOOM':
      return { ...state, zoom: action.value };
    case 'BUILD_GRID':
      return { ...state, ...buildGridState(state) };
    case 'PAINT_CELL': {
      const { row, col, value } = action;
      if (row < 0 || row >= state.gridRows || col < 0 || col >= state.gridCols) return state;
      const paintLayer = state.paintLayer.map((r, ri) =>
        ri === row ? r.map((c, ci) => (ci === col ? value : c)) : r
      );
      return { ...state, paintLayer };
    }
    case 'PAINT_RECT': {
      const { minRow, maxRow, minCol, maxCol, value } = action;
      const paintLayer = state.paintLayer.map((r, ri) =>
        ri >= minRow && ri <= maxRow
          ? r.map((c, ci) => (ci >= minCol && ci <= maxCol ? value : c))
          : r
      );
      return { ...state, paintLayer };
    }
    case 'IMPORT_LAYOUT': {
      const { layout } = action;
      const next: AppState = {
        ...state,
        ...layout.quilt,
        fabricRepeatInches: layout.fabricRepeatInches,
      };
      const dims = computeGridDimensions({
        rows: layout.quilt.rows,
        cols: layout.quilt.cols,
        blockWidth: layout.quilt.blockWidth,
        blockHeight: layout.quilt.blockHeight,
        sashingEnabled: layout.quilt.sashingEnabled,
        sashingWidth: layout.quilt.sashingWidth,
        sashingBorderEnabled: layout.quilt.sashingBorderEnabled,
        sashingBorderWidth: layout.quilt.sashingBorderWidth,
        borderWidth: layout.quilt.borderWidth,
      });
      return {
        ...next,
        gridCols: dims.totalWidthIn,
        gridRows: dims.totalHeightIn,
        paintLayer: layout.paintLayer,
        fabricImageURL: null,
        fabricModeActive: false,
      };
    }
    case 'SET_WOF': return { ...state, wof: action.value };
    case 'SET_SEAM': return { ...state, seam: action.value };
    case 'SET_SASH_STRIP_WIDTH': return { ...state, sashStripWidth: action.value };
    case 'SET_BINDING_STRIP_WIDTH': return { ...state, bindingStripWidth: action.value };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
