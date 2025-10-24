import type { JSX } from 'react';

import './App.css';

/** Root application shell rendered by Vite entry point. */
function App(): JSX.Element {
  return (
    <>
      {/* General information */}
      <h1>Front Office</h1>
      <p className="read-the-docs">
        Pour le front office
      </p>
    </>
  );
}

export default App;
