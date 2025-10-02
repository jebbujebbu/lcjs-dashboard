import React from 'react';
import './App.css';
import { LCHost } from './LC.js';
import Dashboard from './pages/Dashboard.jsx';

function App() {

  return (
    // NOTE: LCHost should be defined at the top of component tree, before any and all LCJS based components
    // This let's them share the same LC context for performance benefits.
    <LCHost>
      <div className="App">
          <Dashboard />
      </div>
    </LCHost>
  );
}

export default App;