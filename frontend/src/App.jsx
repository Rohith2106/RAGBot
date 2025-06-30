import React from 'react';
import RagBot from './components/RagBot';
import './index.css'; // Assuming you have a CSS file for global styles

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <main className="w-max p-4 max-w-4xl">
        <RagBot />
      </main>-
    </div>
  );
}

export default App;
