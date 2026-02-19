import { useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { ControlPanel } from './components/ControlPanel';
import { GridViewer } from './components/GridViewer';
import { CalculatorPanel } from './components/CalculatorPanel';
import './app.css';

function AppInner() {
  const { state, dispatch } = useAppContext();

  // Sync dark mode class on body
  useEffect(() => {
    document.body.classList.toggle('dark', state.darkMode);
  }, [state.darkMode]);

  // Build grid on first mount
  useEffect(() => {
    dispatch({ type: 'BUILD_GRID' });
  }, []);

  return (
    <>
      <h1>Quilt Planner</h1>
      <button
        className="dark-toggle"
        onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
      >
        {state.darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>

      <div className="main-layout">
        <ControlPanel />
        <GridViewer />
      </div>

      <CalculatorPanel />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
