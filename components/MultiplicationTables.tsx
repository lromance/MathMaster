import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, RefreshCw, HelpCircle, List, Grid3X3, LayoutGrid } from 'lucide-react';

type Mode = 'MENU' | 'VIEW_TABLE' | 'QUIZ' | 'MISSING_VALUE';

interface MultiplicationTablesProps {
  onExit: () => void;
}

const COLORS = [
  'bg-red-500 border-red-700',
  'bg-orange-500 border-orange-700',
  'bg-amber-500 border-amber-700',
  'bg-yellow-500 border-yellow-700',
  'bg-lime-500 border-lime-700',
  'bg-green-500 border-green-700',
  'bg-emerald-500 border-emerald-700',
  'bg-teal-500 border-teal-700',
  'bg-cyan-500 border-cyan-700',
  'bg-sky-500 border-sky-700',
  'bg-blue-500 border-blue-700',
  'bg-indigo-500 border-indigo-700',
  'bg-violet-500 border-violet-700',
  'bg-purple-500 border-purple-700',
  'bg-fuchsia-500 border-fuchsia-700',
  'bg-pink-500 border-pink-700',
  'bg-rose-500 border-rose-700',
];

const getPastelColor = (num: number) => COLORS[num % COLORS.length];

export default function MultiplicationTables({ onExit }: MultiplicationTablesProps) {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>('MENU');

  // --- State for VIEW_TABLE ---
  const [tableInputs, setTableInputs] = useState<string[]>(Array(11).fill(''));
  const [tableChecked, setTableChecked] = useState(false);

  // --- State for QUIZ / MISSING_VALUE ---
  const [currentFactor, setCurrentFactor] = useState(0);
  const [quizInput, setQuizInput] = useState('');
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'error'>('none');
  const [streak, setStreak] = useState(0);
  const [missingPosition, setMissingPosition] = useState<0|1|2>(0); // 0: result, 1: first factor, 2: second factor

  // Generate a new random question
  const nextQuestion = () => {
    const factor = Math.floor(Math.random() * 11); // 0 to 10
    setCurrentFactor(factor);
    setQuizInput('');
    setFeedback('none');
    
    if (mode === 'MISSING_VALUE') {
        // Randomly hide result (0), factor1 (1), or factor2 (2)
        // But if we are practicing "Table of X", usually X is fixed.
        // Let's say Table 5. 5 * ? = 20. 
        // We can hide the variable factor or the result. 
        // Hiding the fixed table number (Table 5) might be confusing if the user expects to practice Table 5.
        // Let's stick to hiding the varying factor or the result.
        setMissingPosition(Math.random() > 0.5 ? 0 : 2); 
    } else {
        setMissingPosition(0);
    }
  };

  const handleSelectTable = (num: number) => {
    setSelectedTable(num);
    setMode('MENU'); // Go to mode selection for this table
    setStreak(0);
  };

  const startMode = (m: Mode) => {
    setMode(m);
    if (m === 'VIEW_TABLE') {
      setTableInputs(Array(11).fill(''));
      setTableChecked(false);
    } else {
      nextQuestion();
    }
  };

  const checkQuiz = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedTable && selectedTable !== 0) return;
    
    const val = parseInt(quizInput);
    if (isNaN(val)) return;

    let correct = 0;
    if (mode === 'QUIZ') {
        correct = selectedTable! * currentFactor;
    } else if (mode === 'MISSING_VALUE') {
        if (missingPosition === 0) correct = selectedTable! * currentFactor;
        else if (missingPosition === 2) correct = currentFactor; 
        // Note: currentFactor is the random number (0-10).
        // Equation: TableNum * currentFactor = Result
        // If missingPosition == 2, we show TableNum * ? = Result. The answer is currentFactor.
    }

    if (val === correct) {
      setFeedback('correct');
      setStreak(s => s + 1);
      setTimeout(() => nextQuestion(), 1000);
    } else {
      setFeedback('error');
      setStreak(0);
    }
  };
  
  const checkFullTable = () => {
    setTableChecked(true);
  };

  // --- RENDERERS ---

  if (selectedTable === null) {
    return (
      <div className="min-h-screen bg-indigo-50 flex flex-col items-center p-4">
        <div className="w-full max-w-4xl mb-6 flex items-center">
             <button onClick={onExit} className="p-2 bg-white rounded-full text-slate-500 shadow hover:bg-slate-100 mr-4">
                <ArrowLeft />
             </button>
             <h1 className="text-2xl sm:text-4xl font-black text-slate-800">Tablas de Multiplicar</h1>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-4xl">
          {Array.from({ length: 13 }).map((_, i) => (
            <button
              key={i}
              onClick={() => handleSelectTable(i)}
              className={`${getPastelColor(i)} hover:brightness-110 text-white text-4xl sm:text-6xl font-black py-8 rounded-3xl shadow-lg border-b-8 active:border-b-0 active:translate-y-2 transition-all`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'MENU') {
    return (
      <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border-b-8 border-indigo-200 p-8 w-full max-w-md text-center relative">
          <button onClick={() => setSelectedTable(null)} className="absolute left-4 top-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full">
            <ArrowLeft />
          </button>
          
          <div className={`inline-block w-20 h-20 rounded-full ${getPastelColor(selectedTable)} border-b-4 flex items-center justify-center text-white text-4xl font-black mb-4`}>
            {selectedTable}
          </div>
          
          <h2 className="text-3xl font-bold text-slate-800 mb-8">Elige una actividad</h2>
          
          <div className="space-y-4">
            <button onClick={() => startMode('VIEW_TABLE')} className="w-full flex items-center gap-4 p-4 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-2xl font-bold text-xl transition-colors">
                <div className="bg-white p-2 rounded-lg"><List size={32} className="text-blue-500"/></div>
                Rellenar Tabla
            </button>
            <button onClick={() => startMode('QUIZ')} className="w-full flex items-center gap-4 p-4 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-2xl font-bold text-xl transition-colors">
                <div className="bg-white p-2 rounded-lg"><HelpCircle size={32} className="text-purple-500"/></div>
                Preguntas
            </button>
            <button onClick={() => startMode('MISSING_VALUE')} className="w-full flex items-center gap-4 p-4 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-2xl font-bold text-xl transition-colors">
                <div className="bg-white p-2 rounded-lg"><Grid3X3 size={32} className="text-orange-500"/></div>
                Completar Huecos
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'VIEW_TABLE') {
    return (
      <div className="min-h-screen bg-blue-50 flex flex-col items-center p-4 pb-20">
         <div className="w-full max-w-md flex items-center mb-6 sticky top-0 bg-blue-50 py-4 z-10">
             <button onClick={() => setMode('MENU')} className="p-2 bg-white rounded-full text-slate-500 shadow hover:bg-slate-100 mr-4">
                <ArrowLeft />
             </button>
             <h2 className="text-2xl font-black text-slate-800">Tabla del {selectedTable}</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border-b-4 border-slate-200 p-6 w-full max-w-md space-y-4">
            {Array.from({ length: 11 }).map((_, i) => {
                const isCorrect = parseInt(tableInputs[i]) === selectedTable * i;
                const showStatus = tableChecked;
                
                return (
                    <div key={i} className="flex items-center justify-between text-2xl sm:text-3xl font-bold text-slate-700">
                        <div className="flex items-center gap-2 w-1/2">
                            <span className="text-blue-500">{selectedTable}</span>
                            <span className="text-slate-400">×</span>
                            <span className="text-purple-500">{i}</span>
                            <span className="text-slate-400">=</span>
                        </div>
                        <div className="relative w-1/2">
                            <input 
                                type="tel" 
                                value={tableInputs[i]}
                                onChange={(e) => {
                                    const newInputs = [...tableInputs];
                                    newInputs[i] = e.target.value;
                                    setTableInputs(newInputs);
                                    setTableChecked(false);
                                }}
                                className={`w-full bg-slate-100 rounded-lg p-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-400 ${showStatus ? (isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') : ''}`}
                            />
                            {showStatus && isCorrect && <div className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500"><Check /></div>}
                        </div>
                    </div>
                );
            })}
        </div>

        <div className="fixed bottom-6 left-0 right-0 p-4 flex justify-center pointer-events-none">
             <button 
                onClick={checkFullTable}
                className="pointer-events-auto bg-green-500 hover:bg-green-600 text-white text-xl font-bold py-4 px-12 rounded-full shadow-xl border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all flex items-center gap-3"
             >
                <Check size={28} /> Comprobar
             </button>
        </div>
      </div>
    );
  }

  // QUIZ & MISSING VALUE
  const isMissingResult = mode === 'QUIZ' || (mode === 'MISSING_VALUE' && missingPosition === 0);
  const isMissingFactor = mode === 'MISSING_VALUE' && missingPosition === 2;

  return (
      <div className="min-h-screen bg-purple-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md flex items-center mb-6 absolute top-4 left-4">
             <button onClick={() => setMode('MENU')} className="p-2 bg-white rounded-full text-slate-500 shadow hover:bg-slate-100">
                <ArrowLeft />
             </button>
        </div>

        <div className={`bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center border-b-8 ${feedback === 'correct' ? 'border-green-200' : (feedback === 'error' ? 'border-red-200' : 'border-purple-200')}`}>
            <div className="mb-4 text-sm font-bold text-purple-400 uppercase tracking-wider">
                {mode === 'QUIZ' ? 'Preguntas Rápidas' : 'Completa la operación'}
            </div>
            
            <div className="flex items-center justify-center gap-2 text-5xl sm:text-7xl font-black text-slate-700 mb-12">
                {/* FIRST NUMBER (Always selectedTable in this context) */}
                <span className="text-blue-500">{selectedTable}</span>
                
                <span className="text-slate-300">×</span>
                
                {/* SECOND NUMBER */}
                {isMissingFactor ? (
                     <div className="w-24 h-24 bg-slate-100 rounded-xl border-4 border-slate-300 flex items-center justify-center text-slate-400">?</div>
                ) : (
                    <span className="text-purple-500">{currentFactor}</span>
                )}
                
                <span className="text-slate-300">=</span>

                {/* RESULT */}
                {isMissingResult ? (
                    <div className="w-24 h-24 bg-slate-100 rounded-xl border-4 border-slate-300 flex items-center justify-center text-slate-400">?</div>
                ) : (
                    <span className="text-slate-800">{selectedTable! * currentFactor}</span>
                )}
            </div>

            <form onSubmit={checkQuiz} className="mb-6">
                <input 
                    type="tel" 
                    autoFocus
                    value={quizInput}
                    onChange={(e) => setQuizInput(e.target.value)}
                    placeholder="?"
                    className={`w-full text-center text-4xl font-bold p-4 rounded-2xl border-4 focus:outline-none transition-colors ${feedback === 'error' ? 'border-red-400 bg-red-50' : (feedback === 'correct' ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-slate-50 focus:border-blue-400')}`}
                />
                <button 
                    type="submit"
                    className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white text-xl font-bold py-4 rounded-2xl shadow-lg border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all"
                >
                    Comprobar
                </button>
            </form>

            <div className="flex justify-between items-center text-slate-400 font-semibold">
                 <span>Racha: <strong className="text-blue-500">{streak}</strong></span>
            </div>
        </div>
      </div>
  );
}
