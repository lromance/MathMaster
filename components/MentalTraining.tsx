import React, { useState, useRef, useEffect } from 'react';
import { TrainingProblem, TrainingMode } from '../types';
import { Check, ArrowLeft, Brain } from 'lucide-react';

interface MentalTrainingProps {
  problem: TrainingProblem;
  mode: TrainingMode;
  onNext: () => void;
  onExit: () => void;
}

const MentalTraining: React.FC<MentalTrainingProps> = ({ problem, mode, onNext, onExit }) => {
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<'default' | 'correct' | 'error'>('default');
  const [feedback, setFeedback] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Reset state when problem changes
    setInputValue('');
    setStatus('default');
    setFeedback('');
    if (inputRef.current) inputRef.current.focus();
  }, [problem]);

  const handleSubmit = () => {
    if (!inputValue) return;

    const val = parseInt(inputValue);
    if (val === problem.expectedResult) {
      setStatus('correct');
      setFeedback('¡Correcto!');
      setTimeout(onNext, 1000); // Auto advance after 1s
    } else {
      setStatus('error');
      setFeedback('¡Inténtalo de nuevo!');
      setInputValue('');
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const getTitle = () => {
    switch(mode) {
      case 'DOUBLES': return 'Dobles';
      case 'COMPLEMENTS_10': return 'Amigos del 10';
      case 'BRIDGE_10': return 'Cruzar el 10';
      default: return 'Entrenamiento';
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto p-4">
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-8">
        <button onClick={onExit} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg flex items-center gap-2">
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Menú</span>
        </button>
        <div className="text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-2">
           <Brain size={16} />
           {getTitle()}
        </div>
        <div className="w-10"></div> 
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full border-b-8 border-purple-200 flex flex-col items-center">
        
        <div className="text-4xl sm:text-5xl font-bold text-slate-700 mb-8 text-center leading-relaxed">
          {problem.questionText}
        </div>

        <div className="w-full flex justify-center mb-6">
          <input
            ref={inputRef}
            type="number"
            pattern="[0-9]*"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="?"
            className={`
              w-32 h-20 text-center text-5xl font-bold rounded-2xl border-4 outline-none transition-all
              ${status === 'error' ? 'border-red-400 bg-red-50 text-red-600 animate-pulse' : 
                status === 'correct' ? 'border-green-400 bg-green-50 text-green-600' : 
                'border-slate-200 focus:border-purple-400 text-slate-700'}
            `}
          />
        </div>

        <div className="h-8 mb-4 text-center">
          {feedback && (
            <p className={`text-lg font-bold ${status === 'error' ? 'text-red-500' : 'text-green-500'}`}>
              {feedback}
            </p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          className={`
            w-full flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-xl font-bold text-white transition-all transform active:scale-95 shadow-lg
            ${status === 'correct' ? 'bg-green-500 hover:bg-green-600 shadow-green-200' : 'bg-purple-500 hover:bg-purple-600 shadow-purple-200'}
          `}
        >
          {status === 'correct' ? <Check size={28} /> : 'Comprobar'}
        </button>

      </div>
    </div>
  );
};

export default MentalTraining;