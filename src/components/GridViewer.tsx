import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { getCellType, computeGridDimensions, PX_PER_INCH } from '../utils/gridGeometry';

const FABRIC_MARKER = '__fabric__';

interface DragState {
  isDragging: boolean;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export function GridViewer() {
  const { state, dispatch } = useAppContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const fabricImgRef = useRef<HTMLImageElement | null>(null);
  const drag = useRef<DragState>({ isDragging: false, startRow: 0, startCol: 0, endRow: 0, endCol: 0 });
  const [selBox, setSelBox] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  // Load fabric image when URL changes
  useEffect(() => {
    if (!state.fabricImageURL) {
      fabricImgRef.current = null;
      return;
    }
    const img = new Image();
    img.onload = () => { fabricImgRef.current = img; };
    img.src = state.fabricImageURL;
  }, [state.fabricImageURL]);

  // Redraw canvas whenever grid state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || state.gridCols === 0 || state.gridRows === 0) return;

    const ctx = canvas.getContext('2d')!;
    canvas.width = state.gridCols * PX_PER_INCH;
    canvas.height = state.gridRows * PX_PER_INCH;

    const cfg = {
      rows: state.rows, cols: state.cols,
      blockWidth: state.blockWidth, blockHeight: state.blockHeight,
      sashingEnabled: state.sashingEnabled, sashingWidth: state.sashingWidth,
      sashingBorderEnabled: state.sashingBorderEnabled, sashingBorderWidth: state.sashingBorderWidth,
      borderWidth: state.borderWidth,
    };
    const dims = computeGridDimensions(cfg);

    for (let r = 0; r < state.gridRows; r++) {
      for (let c = 0; c < state.gridCols; c++) {
        const cellType = getCellType(r, c, cfg, dims);
        const paintedValue = state.paintLayer[r]?.[c] ?? '';

        if (paintedValue === FABRIC_MARKER && fabricImgRef.current) {
          drawFabricCell(ctx, r, c, fabricImgRef.current, state.fabricRepeatInches);
        } else if (paintedValue && paintedValue !== FABRIC_MARKER) {
          ctx.fillStyle = paintedValue;
          ctx.fillRect(c * PX_PER_INCH, r * PX_PER_INCH, PX_PER_INCH, PX_PER_INCH);
        } else {
          // Region color
          switch (cellType) {
            case 'border': ctx.fillStyle = state.borderColor; break;
            case 'sashBorder': ctx.fillStyle = state.sashingBorderColor; break;
            case 'sashing': ctx.fillStyle = state.sashingColor; break;
            default: ctx.fillStyle = '#ffffff';
          }
          ctx.fillRect(c * PX_PER_INCH, r * PX_PER_INCH, PX_PER_INCH, PX_PER_INCH);
        }

        // Cell border
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(c * PX_PER_INCH + 0.25, r * PX_PER_INCH + 0.25, PX_PER_INCH - 0.5, PX_PER_INCH - 0.5);
      }
    }
  }, [
    state.gridCols, state.gridRows, state.paintLayer,
    state.rows, state.cols, state.blockWidth, state.blockHeight,
    state.sashingEnabled, state.sashingWidth, state.sashingColor,
    state.sashingBorderEnabled, state.sashingBorderWidth, state.sashingBorderColor,
    state.borderWidth, state.borderColor,
    state.fabricRepeatInches, state.fabricImageURL,
  ]);

  // Auto-fit zoom after grid builds
  useEffect(() => {
    if (state.gridCols === 0 || !outerRef.current) return;
    const outer = outerRef.current;
    const styles = getComputedStyle(outer);
    const padX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
    const padY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
    const availW = outer.clientWidth - padX;
    const availH = outer.clientHeight - padY;
    const gridW = state.gridCols * PX_PER_INCH;
    const gridH = state.gridRows * PX_PER_INCH;
    if (gridW <= availW && gridH <= availH) return;
    const scale = Math.min(availW / gridW, availH / gridH);
    const pct = Math.max(50, Math.min(200, Math.floor(scale * 100)));
    dispatch({ type: 'SET_ZOOM', value: pct });
  }, [state.gridCols, state.gridRows]);

  function getCellFromEvent(e: React.MouseEvent<HTMLCanvasElement>): { row: number; col: number } {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const zoom = state.zoom / 100;
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    return {
      row: Math.floor(y / PX_PER_INCH),
      col: Math.floor(x / PX_PER_INCH),
    };
  }

  function getPaintValue(): string {
    return state.fabricImageURL && state.fabricModeActive ? FABRIC_MARKER : state.activeColor;
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const { row, col } = getCellFromEvent(e);
    drag.current = { isDragging: true, startRow: row, startCol: col, endRow: row, endCol: col };
    setSelBox(boxStyle(row, col, row, col));
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!drag.current.isDragging) return;
    const { row, col } = getCellFromEvent(e);
    drag.current.endRow = row;
    drag.current.endCol = col;
    setSelBox(boxStyle(drag.current.startRow, drag.current.startCol, row, col));
  }

  function handleMouseUp() {
    if (!drag.current.isDragging) return;
    drag.current.isDragging = false;
    setSelBox(null);

    const { startRow, startCol, endRow, endCol } = drag.current;
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);

    const value = getPaintValue();
    if (minRow === maxRow && minCol === maxCol) {
      dispatch({ type: 'PAINT_CELL', row: minRow, col: minCol, value });
    } else {
      dispatch({ type: 'PAINT_RECT', minRow, maxRow, minCol, maxCol, value });
    }
  }

  function boxStyle(r1: number, c1: number, r2: number, c2: number) {
    const minR = Math.min(r1, r2), maxR = Math.max(r1, r2);
    const minC = Math.min(c1, c2), maxC = Math.max(c1, c2);
    return {
      top: minR * PX_PER_INCH,
      left: minC * PX_PER_INCH,
      width: (maxC - minC + 1) * PX_PER_INCH,
      height: (maxR - minR + 1) * PX_PER_INCH,
    };
  }

  return (
    <div className="panel grid-wrapper">
      <div className="zoom-row">
        <strong>Zoom:</strong>
        <input
          type="range" min={50} max={200} value={state.zoom}
          onChange={e => dispatch({ type: 'SET_ZOOM', value: parseInt(e.target.value) })}
        />
        <span>{state.zoom}%</span>
      </div>

      <div id="quiltOuter" ref={outerRef}>
        <div
          style={{
            transform: `scale(${state.zoom / 100})`,
            transformOrigin: 'top center',
            position: 'relative',
            display: 'inline-block',
          }}
        >
          {state.gridCols > 0 && (
            <>
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{ display: 'block', cursor: 'crosshair' }}
              />
              {selBox && (
                <div
                  style={{
                    position: 'absolute',
                    top: selBox.top,
                    left: selBox.left,
                    width: selBox.width,
                    height: selBox.height,
                    background: 'rgba(0,120,215,0.25)',
                    border: '2px solid #0078d7',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </>
          )}
          {state.gridCols === 0 && (
            <div style={{ padding: 40, color: '#999' }}>
              Click <strong>Build / Update Grid</strong> to render the quilt.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function drawFabricCell(
  ctx: CanvasRenderingContext2D,
  r: number,
  c: number,
  img: HTMLImageElement,
  repeatInches: number,
) {
  const px = PX_PER_INCH;
  const repeatPx = repeatInches * px;
  const offsetX = (c % repeatInches) * px;
  const offsetY = (r % repeatInches) * px;

  ctx.save();
  ctx.beginPath();
  ctx.rect(c * px, r * px, px, px);
  ctx.clip();
  ctx.drawImage(img, c * px - offsetX, r * px - offsetY, repeatPx, repeatPx);
  ctx.restore();
}
