import React, { useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { importLayout } from '../utils/layoutSerializer';
import { exportLayout } from '../utils/layoutSerializer';

const PRESET_COLORS = ['#ffffff', '#d9d9d9', '#555555', '#000000', '#ff0000', '#0066ff', '#00aa55', '#d4af37'];

export function ControlPanel() {
  const { state, dispatch } = useAppContext();
  const fabricInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  function handleFabricUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      dispatch({ type: 'SET_FABRIC_URL', url: evt.target!.result as string });
    };
    reader.readAsDataURL(file);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const layout = await importLayout(file);
      dispatch({ type: 'IMPORT_LAYOUT', layout });
    } catch (err) {
      alert('Failed to import layout: ' + (err as Error).message);
    }
    e.target.value = '';
  }

  return (
    <div className="panel controls">
      <h2>Quilt Settings</h2>

      <label>Rows (blocks)
        <input type="number" value={state.rows} min={1}
          onChange={e => dispatch({ type: 'SET_ROWS', value: parseInt(e.target.value) || 1 })} />
      </label>

      <label>Columns (blocks)
        <input type="number" value={state.cols} min={1}
          onChange={e => dispatch({ type: 'SET_COLS', value: parseInt(e.target.value) || 1 })} />
      </label>

      <label>Block width (inches)
        <input type="number" value={state.blockWidth} min={1}
          onChange={e => dispatch({ type: 'SET_BLOCK_WIDTH', value: parseInt(e.target.value) || 1 })} />
      </label>

      <label>Block height (inches)
        <input type="number" value={state.blockHeight} min={1}
          onChange={e => dispatch({ type: 'SET_BLOCK_HEIGHT', value: parseInt(e.target.value) || 1 })} />
      </label>

      <label>Sashing width (inches)</label>
      <div className="inline-row">
        <input type="number" value={state.sashingWidth} min={0}
          onChange={e => dispatch({ type: 'SET_SASHING_WIDTH', value: parseInt(e.target.value) || 0 })} />
        <div className="color-box" style={{ backgroundColor: state.sashingColor }}>
          <input type="color" value={state.sashingColor}
            onChange={e => dispatch({ type: 'SET_SASHING_COLOR', value: e.target.value })} />
        </div>
      </div>

      <button onClick={() => dispatch({ type: 'TOGGLE_SASHING' })}>
        Toggle Sashing {state.sashingEnabled ? 'Off' : 'On'}
      </button>

      <label>Sashing Border width (inches)</label>
      <div className="inline-row">
        <input type="number" value={state.sashingBorderWidth} min={0}
          onChange={e => dispatch({ type: 'SET_SASHING_BORDER_WIDTH', value: parseInt(e.target.value) || 0 })} />
        <div className="color-box" style={{ backgroundColor: state.sashingBorderColor }}>
          <input type="color" value={state.sashingBorderColor}
            onChange={e => dispatch({ type: 'SET_SASHING_BORDER_COLOR', value: e.target.value })} />
        </div>
      </div>

      <button onClick={() => dispatch({ type: 'TOGGLE_SASHING_BORDER' })}>
        Toggle Sashing Border {state.sashingBorderEnabled ? 'Off' : 'On'}
      </button>

      <label>Border width (inches)</label>
      <div className="inline-row">
        <input type="number" value={state.borderWidth} min={0}
          onChange={e => dispatch({ type: 'SET_BORDER_WIDTH', value: parseInt(e.target.value) || 0 })} />
        <div className="color-box" style={{ backgroundColor: state.borderColor }}>
          <input type="color" value={state.borderColor}
            onChange={e => dispatch({ type: 'SET_BORDER_COLOR', value: e.target.value })} />
        </div>
      </div>

      <label>Fabric Image Upload
        <input type="file" accept="image/*" ref={fabricInputRef} onChange={handleFabricUpload} />
      </label>

      <label>Fabric repeat size (inches)
        <input type="number" value={state.fabricRepeatInches} min={1} step={0.5}
          onChange={e => {
            const val = parseFloat(e.target.value);
            if (val > 0) dispatch({ type: 'SET_FABRIC_REPEAT', value: val });
          }} />
      </label>

      <button
        disabled={!state.fabricImageURL}
        className={state.fabricModeActive ? 'fabric-active' : ''}
        onClick={() => dispatch({ type: 'TOGGLE_FABRIC_MODE' })}
      >
        Fabric Mode: {state.fabricModeActive ? 'On' : 'Off'}
      </button>

      <button onClick={() => {
        dispatch({ type: 'CLEAR_FABRIC' });
        if (fabricInputRef.current) fabricInputRef.current.value = '';
      }}>
        Clear Fabric
      </button>

      <label>Active Color
        <input type="color" value={state.activeColor}
          onChange={e => dispatch({ type: 'SET_ACTIVE_COLOR', value: e.target.value })} />
      </label>

      <button onClick={() => dispatch({ type: 'BUILD_GRID' })}>
        Build / Update Grid
      </button>

      <div className="color-section">
        <h3>Preset Colors</h3>
        <div className="color-palette">
          {PRESET_COLORS.map(color => (
            <div
              key={color}
              className="color-swatch"
              style={{ background: color }}
              onClick={() => dispatch({ type: 'SET_ACTIVE_COLOR', value: color })}
            />
          ))}
        </div>

        <h3>Saved Colors</h3>
        <div className="color-saved-row">
          {state.savedColors.map((color, i) => (
            <div
              key={i}
              className={`color-swatch${color ? '' : ' empty'}`}
              style={color ? { background: color } : {}}
              onClick={() => {
                if (!color) dispatch({ type: 'SAVE_COLOR', index: i });
                else dispatch({ type: 'LOAD_COLOR', index: i });
              }}
              onContextMenu={e => {
                e.preventDefault();
                dispatch({ type: 'CLEAR_SAVED_COLOR', index: i });
              }}
            />
          ))}
        </div>
      </div>

      <hr style={{ margin: '16px 0' }} />

      <button onClick={() => exportLayout(state)}>Export Layout (.json)</button>

      <label>Import Layout
        <input type="file" accept=".json" ref={importInputRef} onChange={handleImport} />
      </label>
    </div>
  );
}
