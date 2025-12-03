import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Zap, Ruler, ChevronDown, Activity, Sparkles, RefreshCw, Save, History, Trash2, Download, Briefcase, User, FileText, ClipboardList } from 'lucide-react';
import { WeldingParams, WeldingProcess, CalculationResult, WeldingPass } from '../types';
import { PROCESS_EFFICIENCY, INITIAL_PARAMS } from '../constants';
import Stopwatch from './Stopwatch';
import { analyzeWeld } from '../services/geminiService';

const Calculator: React.FC = () => {
  const [params, setParams] = useState<WeldingParams>(INITIAL_PARAMS);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [passes, setPasses] = useState<WeldingPass[]>([]);

  // Math Logic
  const calculate = useCallback(() => {
    if (params.time > 0 && params.length > 0) {
      // k factor
      const k = PROCESS_EFFICIENCY[params.process];
      
      // Power (Watts) = U * I
      const power = params.voltage * params.current;
      
      // Travel Speed v (mm/s) = Length / Time
      const travelSpeed = params.length / params.time;
      
      // Heat Input Q = k * (U * I) / v * 10^-3  (kJ/mm)
      // Or simply: k * (U * I * t) / L * 10^-3
      const heatInput = (k * params.voltage * params.current * params.time) / (params.length * 1000);

      setResult({
        heatInput,
        travelSpeed,
        power,
        isValid: !isNaN(heatInput) && isFinite(heatInput)
      });
      // Clear old analysis when result changes significantly
      setAiAnalysis(null);
    } else {
      setResult(null);
    }
  }, [params]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleInputChange = (field: keyof WeldingParams, value: string | number) => {
    setParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSavePass = () => {
    if (!result || !result.isValid) return;

    const newPass: WeldingPass = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      process: params.process,
      current: params.current,
      voltage: params.voltage,
      length: params.length,
      time: params.time,
      heatInput: result.heatInput,
      kFactor: PROCESS_EFFICIENCY[params.process],
      projectName: params.projectName,
      welderName: params.welderName,
      weldName: params.weldName
    };

    setPasses(prev => [newPass, ...prev]);
  };

  const handleDeletePass = (id: string) => {
    setPasses(prev => prev.filter(p => p.id !== id));
  };

  // Logic ported from Dart V6 for Excel Export
  const handleExportExcel = () => {
    if (passes.length === 0) return;

    // 1. Create Headers
    const headers = [
      'Date', 
      'Heure', 
      'Projet',
      'Soudeur',
      'Nom Soudure',
      'Procédé', 
      'Tension (V)', 
      'Intensité (A)', 
      'Longueur (mm)', 
      'Temps (s)', 
      'Facteur k', 
      'Énergie (kJ/mm)'
    ];

    // 2. Create CSV Content
    const csvContent = passes.map(p => {
      const dateObj = new Date(p.timestamp);
      const date = dateObj.toLocaleDateString('fr-FR');
      const time = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      
      // Helper to safely quote strings for CSV
      const q = (str: string | undefined) => `"${(str || '').replace(/"/g, '""')}"`;

      return [
        date,
        time,
        q(p.projectName),
        q(p.welderName),
        q(p.weldName),
        q(p.process), 
        p.voltage,
        p.current,
        p.length,
        p.time.toFixed(1).replace('.', ','), // Excel FR often expects comma
        p.kFactor,
        p.heatInput.toFixed(3).replace('.', ',')
      ].join(';'); // Semicolon delimiter for Excel FR
    });

    const csvString = [headers.join(';'), ...csvContent].join('\n');
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for proper UTF-8 in Excel
    
    // 3. Trigger Download
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, "");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Rapport_Soudure_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAnalysis = async () => {
    if (!result) return;
    setIsAnalyzing(true);
    const analysis = await analyzeWeld(params, result);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  return (
    <div className="pb-24 space-y-6">
      
      {/* 1. Traçabilité Inputs */}
      <div className="bg-industrial-800 rounded-2xl p-6 shadow-lg border border-industrial-700 space-y-4">
         <div className="flex items-center space-x-2 text-industrial-400 uppercase text-xs font-bold tracking-wider mb-2">
            <ClipboardList size={16} />
            <span>Traçabilité</span>
         </div>
         
         <div className="space-y-3">
             {/* Project Name */}
             <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-industrial-500">
                    <Briefcase size={16} />
                </div>
                <input
                    type="text"
                    placeholder="Nom du Projet"
                    value={params.projectName}
                    onChange={(e) => handleInputChange('projectName', e.target.value)}
                    className="w-full bg-industrial-900 text-white rounded-xl pl-10 pr-4 py-3 border border-industrial-600 focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent outline-none transition-colors text-sm"
                />
             </div>

             <div className="grid grid-cols-2 gap-3">
                 {/* Welder Name */}
                 <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-industrial-500">
                        <User size={16} />
                    </div>
                    <input
                        type="text"
                        placeholder="Soudeur"
                        value={params.welderName}
                        onChange={(e) => handleInputChange('welderName', e.target.value)}
                        className="w-full bg-industrial-900 text-white rounded-xl pl-10 pr-4 py-3 border border-industrial-600 focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent outline-none transition-colors text-sm"
                    />
                 </div>
                 
                 {/* Weld ID/Name */}
                 <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-industrial-500">
                        <FileText size={16} />
                    </div>
                    <input
                        type="text"
                        placeholder="Ref. Soudure"
                        value={params.weldName}
                        onChange={(e) => handleInputChange('weldName', e.target.value)}
                        className="w-full bg-industrial-900 text-white rounded-xl pl-10 pr-4 py-3 border border-industrial-600 focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent outline-none transition-colors text-sm"
                    />
                 </div>
             </div>
         </div>
      </div>

      {/* 2. Stopwatch Section */}
      <Stopwatch 
        onTimeUpdate={(t) => handleInputChange('time', t)} 
        initialTime={params.time}
      />

      {/* 3. Technical Inputs Section */}
      <div className="bg-industrial-800 rounded-2xl p-6 shadow-lg border border-industrial-700 space-y-5">
        <div className="flex items-center space-x-2 text-industrial-400 uppercase text-xs font-bold tracking-wider mb-2">
          <Settings size={16} />
          <span>Paramètres</span>
        </div>

        {/* Process Selector */}
        <div className="space-y-2">
          <label className="text-sm text-industrial-300 font-medium ml-1">Procédé de soudage</label>
          <div className="relative">
            <select
              value={params.process}
              onChange={(e) => handleInputChange('process', e.target.value)}
              className="w-full appearance-none bg-industrial-900 text-white rounded-xl px-4 py-4 pr-10 border border-industrial-600 focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent outline-none transition-colors"
            >
              {Object.values(WeldingProcess).map((proc) => (
                <option key={proc} value={proc}>{proc}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-industrial-500 pointer-events-none" size={20} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Amperage */}
          <div className="space-y-2">
            <label className="text-sm text-industrial-300 font-medium ml-1 flex items-center">
              <Zap size={14} className="mr-1 text-yellow-500" />
              Intensité (A)
            </label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={params.current || ''}
              onChange={(e) => handleInputChange('current', parseFloat(e.target.value))}
              className="w-full bg-industrial-900 text-white rounded-xl px-4 py-4 border border-industrial-600 focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent outline-none transition-colors font-mono text-lg"
            />
          </div>

          {/* Voltage */}
          <div className="space-y-2">
            <label className="text-sm text-industrial-300 font-medium ml-1 flex items-center">
              <Activity size={14} className="mr-1 text-blue-400" />
              Tension (V)
            </label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={params.voltage || ''}
              onChange={(e) => handleInputChange('voltage', parseFloat(e.target.value))}
              className="w-full bg-industrial-900 text-white rounded-xl px-4 py-4 border border-industrial-600 focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent outline-none transition-colors font-mono text-lg"
            />
          </div>
        </div>

        {/* Length Input */}
        <div className="space-y-2">
          <label className="text-sm text-industrial-300 font-medium ml-1 flex items-center">
            <Ruler size={14} className="mr-1 text-green-400" />
            Longueur Soudée (mm)
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              placeholder="Ex: 150"
              value={params.length || ''}
              onChange={(e) => handleInputChange('length', parseFloat(e.target.value))}
              className="w-full bg-industrial-900 text-white rounded-xl px-4 py-4 border border-industrial-600 focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent outline-none transition-colors font-mono text-lg"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-industrial-500 text-sm font-bold pointer-events-none">
              mm
            </div>
          </div>
          <p className="text-xs text-industrial-500 ml-1">
            Mesurez la longueur du cordon après avoir arrêté le chronomètre.
          </p>
        </div>
      </div>

      {/* 4. Result Card (Moved Down) */}
      <div className="bg-gradient-to-br from-industrial-800 to-industrial-900 rounded-3xl p-6 border border-industrial-700 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Activity size={120} />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-industrial-400 text-sm font-bold uppercase tracking-widest mb-1">Énergie de Soudage</h2>
          <div className="flex items-baseline space-x-2">
            <span className="text-5xl font-bold text-white tracking-tighter">
              {result ? result.heatInput.toFixed(3) : '---'}
            </span>
            <span className="text-xl text-industrial-400">kJ/mm</span>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
             <div className="bg-industrial-900/50 rounded-lg p-3 backdrop-blur-sm border border-industrial-700/50">
               <span className="block text-xs text-industrial-500 mb-1">Facteur k</span>
               <span className="text-lg font-mono text-industrial-200">{PROCESS_EFFICIENCY[params.process]}</span>
             </div>
             <div className="bg-industrial-900/50 rounded-lg p-3 backdrop-blur-sm border border-industrial-700/50">
               <span className="block text-xs text-industrial-500 mb-1">Puissance</span>
               <span className="text-lg font-mono text-industrial-200">
                 {result ? (result.power / 1000).toFixed(1) : '-'} <span className="text-xs">kW</span>
               </span>
             </div>
          </div>
        </div>
      </div>

      {/* 5. Action Buttons */}
      {result && result.isValid && (
        <div className="flex flex-col gap-3 animate-fade-in-up">
           <div className="flex gap-3">
             <button
                onClick={handleSavePass}
                className="flex-1 bg-industrial-700 hover:bg-industrial-600 text-white font-bold py-4 px-4 rounded-2xl shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-95"
             >
                <Save size={20} className="text-emerald-400" />
                <span>Enregistrer</span>
             </button>
             
             <button
               onClick={handleAnalysis}
               disabled={isAnalyzing}
               className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 px-4 rounded-2xl shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
             >
               {isAnalyzing ? (
                 <RefreshCw className="animate-spin" size={20} />
               ) : (
                 <Sparkles size={20} />
               )}
               <span>Analyser IA</span>
             </button>
           </div>

           {aiAnalysis && (
             <div className="bg-industrial-800/80 rounded-2xl p-6 border border-indigo-500/30">
                <div className="flex items-center space-x-2 text-indigo-400 mb-4">
                  <Sparkles size={18} />
                  <span className="font-bold text-sm uppercase tracking-wider">Analyse Gemini</span>
                </div>
                <div className="prose prose-invert prose-sm max-w-none text-industrial-200 leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                </div>
             </div>
           )}
        </div>
      )}

      {/* 6. Saved Passes History */}
      {passes.length > 0 && (
        <div className="bg-industrial-800 rounded-2xl p-6 shadow-lg border border-industrial-700 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center space-x-2 text-industrial-400 uppercase text-xs font-bold tracking-wider">
                  <History size={16} />
                  <span>Historique ({passes.length})</span>
               </div>
               
               {/* Export Button */}
               <button 
                 onClick={handleExportExcel}
                 className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors text-xs font-bold uppercase tracking-wider"
               >
                 <Download size={14} />
                 <span>Excel</span>
               </button>
            </div>
            
            <div className="space-y-3">
              {passes.map((pass, index) => {
                const date = new Date(pass.timestamp);
                const timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                const dateStr = date.toLocaleDateString([], {day: '2-digit', month: '2-digit'});
                
                return (
                  <div key={pass.id} className="bg-industrial-900/60 rounded-xl p-4 border border-industrial-700/50 flex flex-col gap-3">
                     <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                             <span className="text-xs font-bold text-industrial-500 uppercase">
                                {pass.weldName ? `Ref: ${pass.weldName}` : `Passe #${passes.length - index}`}
                             </span>
                             <span className="text-xs text-industrial-600 font-mono bg-industrial-950 px-1.5 py-0.5 rounded flex items-center">
                                {dateStr} - {timeStr}
                             </span>
                          </div>
                          <div className="text-sm font-medium text-white truncate max-w-[200px]">{pass.process.split('(')[0]}</div>
                          {(pass.projectName || pass.welderName) && (
                              <div className="text-xs text-industrial-400 mt-1 flex items-center space-x-2">
                                  {pass.projectName && <span>📁 {pass.projectName}</span>}
                                  {pass.welderName && <span>👤 {pass.welderName}</span>}
                              </div>
                          )}
                        </div>
                        <div className="text-right">
                           <div className="text-xl font-bold text-industrial-accent">{pass.heatInput.toFixed(3)} <span className="text-xs text-industrial-500 font-normal">kJ/mm</span></div>
                           <div className="text-xs text-industrial-500">k = {pass.kFactor}</div>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-4 gap-2 text-center text-xs text-industrial-300 bg-industrial-950/30 rounded-lg p-2">
                        <div>
                           <div className="text-industrial-500 mb-1">I (A)</div>
                           <div className="font-mono">{pass.current}</div>
                        </div>
                        <div>
                           <div className="text-industrial-500 mb-1">U (V)</div>
                           <div className="font-mono">{pass.voltage}</div>
                        </div>
                        <div>
                           <div className="text-industrial-500 mb-1">L (mm)</div>
                           <div className="font-mono">{pass.length}</div>
                        </div>
                        <div>
                           <div className="text-industrial-500 mb-1">t (s)</div>
                           <div className="font-mono">{pass.time.toFixed(1)}</div>
                        </div>
                     </div>

                     <button 
                       onClick={() => handleDeletePass(pass.id)}
                       className="self-end flex items-center space-x-1 text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors"
                     >
                       <Trash2 size={12} />
                       <span>Supprimer</span>
                     </button>
                  </div>
                );
              })}
            </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;