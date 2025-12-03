import React, { useState, useEffect, useRef } from 'react';
import { Timer, Pause, Play, RefreshCw, Zap, Edit3 } from 'lucide-react';

interface StopwatchProps {
  onTimeUpdate: (time: number) => void;
  initialTime?: number;
}

const Stopwatch: React.FC<StopwatchProps> = ({ onTimeUpdate, initialTime = 0 }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(initialTime);
  const [editValue, setEditValue] = useState(initialTime.toFixed(1));
  const startTimeRef = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);

  const animate = (time: number) => {
    if (startTimeRef.current !== null) {
      const now = Date.now();
      const delta = (now - startTimeRef.current) / 1000;
      setElapsedTime((prev) => {
        const newTime = prev + delta;
        startTimeRef.current = now; 
        return newTime;
      });
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      startTimeRef.current = null;
      // When stopping, sync the edit value to the measured time
      setEditValue(elapsedTime.toFixed(1));
      onTimeUpdate(elapsedTime);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  // Propagate time changes when stopped (e.g. manual edits)
  useEffect(() => {
    if(!isRunning) {
        onTimeUpdate(elapsedTime);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsedTime]);

  // Sync with prop changes if needed (e.g. parent reset)
  useEffect(() => {
    if (!isRunning && Math.abs(initialTime - elapsedTime) > 0.01) {
        setElapsedTime(initialTime);
        setEditValue(initialTime.toFixed(1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTime]);


  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setEditValue("0.0");
    onTimeUpdate(0);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const commitManualChange = () => {
    // Replace comma with dot for international support
    let val = parseFloat(editValue.replace(',', '.'));
    if (isNaN(val) || val < 0) val = 0;
    
    setElapsedTime(val);
    setEditValue(val.toFixed(1));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="bg-industrial-800 rounded-2xl p-6 shadow-xl border border-industrial-700 flex flex-col items-center justify-center space-y-6 relative overflow-hidden transition-all duration-300">
      <div className="flex items-center space-x-2 text-industrial-400 uppercase text-xs font-bold tracking-wider relative z-10">
        <Timer size={16} />
        <span>Chronomètre de Soudage</span>
      </div>

      {/* Time Display / Input */}
      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="flex items-baseline justify-center w-full">
            {isRunning ? (
                <div className="font-mono text-6xl font-bold tabular-nums tracking-tighter text-industrial-accent select-none">
                    {elapsedTime.toFixed(1)}
                </div>
            ) : (
                <div className="relative group">
                    <input
                        type="text"
                        inputMode="decimal"
                        value={editValue}
                        onChange={handleInputChange}
                        onBlur={commitManualChange}
                        onKeyDown={handleKeyDown}
                        className="font-mono text-6xl font-bold tabular-nums tracking-tighter text-white bg-transparent text-center w-48 outline-none border-b-2 border-transparent focus:border-industrial-accent hover:border-industrial-600/50 transition-colors placeholder-industrial-600 rounded-lg"
                        placeholder="0.0"
                        aria-label="Temps de soudage"
                    />
                    <Edit3 size={16} className="absolute -right-4 top-1/2 -translate-y-1/2 text-industrial-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block" />
                </div>
            )}
            <span className="text-2xl text-industrial-500 ml-2 font-bold select-none">s</span>
        </div>
        
        {!isRunning && (
            <p className="text-xs text-industrial-500 mt-2 font-medium opacity-60 animate-fade-in-up">
                Touchez le temps pour corriger
            </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex w-full items-center justify-center space-x-4 relative z-10">
        <button
          onClick={handleReset}
          disabled={isRunning && elapsedTime > 0}
          className="p-4 rounded-full bg-industrial-700 text-industrial-300 hover:bg-industrial-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          aria-label="Réinitialiser"
        >
          <RefreshCw size={24} />
        </button>

        <button
          onClick={toggleTimer}
          className={`
            flex-1 h-16 rounded-full flex items-center justify-center space-x-3 font-bold text-lg shadow-lg transition-colors
            ${isRunning 
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30' 
              : 'bg-industrial-accent hover:bg-industrial-accentHover text-industrial-900 shadow-amber-500/30'}
          `}
        >
          {isRunning ? (
            <>
              <Pause size={24} fill="currentColor" />
              <span>ARRÊTER</span>
            </>
          ) : (
            <>
              <Play size={24} fill="currentColor" />
              <span>{elapsedTime > 0 ? 'REPRENDRE' : 'SOUDER'}</span>
            </>
          )}
        </button>
      </div>
      
      {/* Background Pulse Effect */}
      {isRunning && (
        <div className="absolute inset-0 bg-gradient-to-t from-industrial-accent/5 to-transparent pointer-events-none animate-pulse-fast"></div>
      )}
    </div>
  );
};

export default Stopwatch;