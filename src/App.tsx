import React from 'react';
import Calculator from './components/Calculator';
import { Flame } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-industrial-900 text-slate-100 font-sans selection:bg-industrial-accent selection:text-white flex flex-col items-center">
      
      {/* Mobile-style Header */}
      <header className="w-full max-w-md bg-industrial-900/90 backdrop-blur-md sticky top-0 z-50 border-b border-industrial-800">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-industrial-accent to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Flame className="text-white" size={24} fill="currentColor" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white leading-tight">WeldMaster AI</h1>
              <p className="text-xs text-industrial-400 font-medium">Assistant de Soudage</p>
            </div>
          </div>
          {/* Could add user profile or settings icon here */}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-md flex-1 px-4 py-6">
        <Calculator />
      </main>

      {/* Footer / Legal / Version */}
      <footer className="w-full max-w-md py-6 text-center text-industrial-600 text-xs">
        <p>Calculs basés sur EN 1011-1</p>
        <p className="mt-1 opacity-50">Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;
