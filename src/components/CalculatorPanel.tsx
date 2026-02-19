import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { calculateFabric, calculateStrips, getQuiltDimensions } from '../utils/calculator';

export function CalculatorPanel() {
  const { state, dispatch } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [fabricOutput, setFabricOutput] = useState('');
  const [stripOutput, setStripOutput] = useState('');

  const cfg = {
    rows: state.rows,
    cols: state.cols,
    blockWidth: state.blockWidth,
    blockHeight: state.blockHeight,
    sashingEnabled: state.sashingEnabled,
    sashingWidth: state.sashingWidth,
    sashingBorderEnabled: state.sashingBorderEnabled,
    sashingBorderWidth: state.sashingBorderWidth,
    borderWidth: state.borderWidth,
    wof: state.wof,
    seam: state.seam,
    bindingStripWidth: state.bindingStripWidth,
    sashStripWidth: state.sashStripWidth,
  };

  const dims = getQuiltDimensions(cfg);

  return (
    <div id="calcPanel" className={isOpen ? 'open' : ''}>
      <div id="calcTab" onClick={() => setIsOpen(o => !o)}>Calculators</div>

      <div id="calcPanelInner">
        <h2>Quilt Calculators</h2>

        <label>Fabric width (WOF, inches)
          <input type="number" value={state.wof} min={20}
            onChange={e => dispatch({ type: 'SET_WOF', value: parseFloat(e.target.value) || 42 })} />
        </label>

        <label>Seam allowance (inches, per side)
          <input type="number" value={state.seam} step={0.0625} min={0}
            onChange={e => dispatch({ type: 'SET_SEAM', value: parseFloat(e.target.value) || 0 })} />
        </label>

        <button onClick={() => setFabricOutput(calculateFabric(cfg))}>
          Calculate Fabric Yardage
        </button>
        <div className="calc-output">{fabricOutput}</div>

        <hr />

        <h3>Quilt Size</h3>
        <div className="calc-output">
          Width: {dims.totalWidth > 0 ? `${dims.totalWidth} inches` : '—'}<br />
          Height: {dims.totalHeight > 0 ? `${dims.totalHeight} inches` : '—'}
        </div>

        <hr />

        <h3>Strip Calculator</h3>

        <label>Sashing Strip Width (cut width, inches):
          <input type="number" value={state.sashStripWidth} min={0} step={0.25}
            onChange={e => dispatch({ type: 'SET_SASH_STRIP_WIDTH', value: parseFloat(e.target.value) || 0 })} />
        </label>

        <label>Binding Strip Width (cut width, inches):
          <input type="number" value={state.bindingStripWidth} min={0} step={0.25}
            onChange={e => dispatch({ type: 'SET_BINDING_STRIP_WIDTH', value: parseFloat(e.target.value) || 0 })} />
        </label>

        <button onClick={() => setStripOutput(calculateStrips(cfg))}>
          Calculate Strips
        </button>

        <div id="stripCalcOutput" className="calc-output">
          {stripOutput || (
            <>
              Sashing Strips Needed: —<br />
              Sashing Border Strips Needed: —<br />
              Binding Strips Needed: —<br />
              Total Strips: —<br />
              Total Inches: —<br />
              Yardage: —
            </>
          )}
        </div>
      </div>
    </div>
  );
}
