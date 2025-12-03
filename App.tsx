import React, { useState } from 'react';
import { MathProblem, OperationType, TrainingProblem, TrainingMode } from './types';
import { generateProblem, generateTrainingProblem } from './utils/mathLogic';
import MathBoard from './components/MathBoard';
import MentalTraining from './components/MentalTraining';
import { Play, Settings, Calculator, RefreshCw, Trophy, Brain, Zap, ArrowLeft } from 'lucide-react';

type AppSection = 'MENU' | 'MATH_BOARD' | 'TRAINING_MENU' | 'TRAINING_GAME';

function App() {
  const [section, setSection] = useState<AppSection>('MENU');
  
  // Math Board State
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [gameMode, setGameMode] = useState<OperationType | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [streak, setStreak] = useState(0);

  // Training State
  const [trainingMode, setTrainingMode] = useState<TrainingMode | null>(null);
  const [trainingProblem, setTrainingProblem] = useState<TrainingProblem | null>(null);

  // --- Math Board Logic ---
  const startMathBoard = (type: OperationType) => {
    setGameMode(type);
    setCurrentProblem(generateProblem(type));
    setShowSuccess(false);
    setSection('MATH_BOARD');
  };

  const handleMathBoardComplete = () => {
    setShowSuccess(true);
    setStreak(s => s + 1);
  };

  const nextMathBoardProblem = () => {
    if (gameMode) {
      setCurrentProblem(generateProblem(gameMode));
      setShowSuccess(false);
    }
  };

  // --- Training Logic ---
  const startTraining = (mode: TrainingMode) => {
    setTrainingMode(mode);
    setTrainingProblem(generateTrainingProblem(mode));
    setSection('TRAINING_GAME');
  };

  const nextTrainingProblem = () => {
    if (trainingMode) {
      setTrainingProblem(generateTrainingProblem(trainingMode));
      setStreak(s => s + 1);
    }
  };

  // --- Navigation ---
  const exitToMenu = () => {
    setSection('MENU');
    setGameMode(null);
    setTrainingMode(null);
    setShowSuccess(false);
  };

  const exitToTrainingMenu = () => {
    setSection('TRAINING_MENU');
    setTrainingMode(null);
  };

  // ---------------- RENDER ----------------

  // 1. Success Screen (Math Board Only)
  if (showSuccess && section === 'MATH_BOARD') {
    return (
      <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-300 via-transparent to-transparent"></div>
        
        <div className="z-10 bg-white rounded-3xl shadow-2xl p-10 text-center max-w-sm w-full animate-[bounce_1s_infinite]">
          <div className="inline-block p-4 bg-yellow-100 text-yellow-500 rounded-full mb-6">
            <Trophy size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">¡Excelente!</h2>
          <p className="text-slate-500 mb-8">Has resuelto la operación correctamente.</p>
          
          <button 
            onClick={nextMathBoardProblem}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xl font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"
          >
            <RefreshCw size={24} />
            Siguiente
          </button>
          
          <button 
            onClick={exitToMenu}
            className="mt-4 text-slate-400 hover:text-slate-600 font-semibold"
          >
            Volver al menú
          </button>
        </div>
      </div>
    );
  }

  // 2. Math Board Game
  if (section === 'MATH_BOARD' && currentProblem) {
    return (
      <div className="min-h-screen bg-blue-50 py-8">
        <MathBoard 
          problem={currentProblem} 
          onComplete={handleMathBoardComplete} 
          onExit={exitToMenu}
        />
      </div>
    );
  }

  // 3. Training Game
  if (section === 'TRAINING_GAME' && trainingProblem && trainingMode) {
    return (
      <div className="min-h-screen bg-purple-50 py-8">
        <MentalTraining 
          problem={trainingProblem}
          mode={trainingMode}
          onNext={nextTrainingProblem}
          onExit={exitToTrainingMenu}
        />
      </div>
    );
  }

  // 4. Training Menu
  if (section === 'TRAINING_MENU') {
    return (
      <div className="min-h-screen bg-purple-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border-b-8 border-purple-200 p-8 text-center relative">
          <button onClick={exitToMenu} className="absolute left-4 top-4 text-slate-400 hover:bg-slate-100 p-2 rounded-full">
            <ArrowLeft size={24} />
          </button>

          <div className="mb-6 flex justify-center text-purple-500 mt-4">
            <Brain size={64} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Cálculo Mental</h1>
          <p className="text-slate-500 mb-8">¡Entrena tu cerebro con ejercicios rápidos!</p>

          <div className="space-y-4">
            <button 
              onClick={() => startTraining('DOUBLES')}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-lg font-bold py-4 rounded-2xl shadow-lg border-b-4 border-indigo-700 active:border-b-0 active:translate-y-1 transition-all"
            >
              Dobles (6 + 6)
            </button>
            <button 
              onClick={() => startTraining('COMPLEMENTS_10')}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white text-lg font-bold py-4 rounded-2xl shadow-lg border-b-4 border-pink-700 active:border-b-0 active:translate-y-1 transition-all"
            >
              Amigos del 10 (Del 7 al 10)
            </button>
            <button 
              onClick={() => startTraining('BRIDGE_10')}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white text-lg font-bold py-4 rounded-2xl shadow-lg border-b-4 border-purple-700 active:border-b-0 active:translate-y-1 transition-all"
            >
              Cruzar el 10 (Del 7 al 13)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Main Menu (Default)
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border-b-8 border-blue-200 p-8 text-center">
        <div className="mb-8 flex justify-center text-blue-500">
          <Calculator size={64} />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-800 mb-2">MathMaster</h1>
        <p className="text-slate-500 mb-8">¡Aprende a sumar y restar!</p>

        <div className="space-y-4">
          <button 
            onClick={() => startMathBoard('ADDITION')}
            className="w-full bg-green-500 hover:bg-green-600 text-white text-xl font-bold py-4 rounded-2xl shadow-lg border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-3"
          >
            <span className="text-3xl">+</span> Sumas
          </button>
          
          <button 
            onClick={() => startMathBoard('SUBTRACTION')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xl font-bold py-4 rounded-2xl shadow-lg border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-3"
          >
            <span className="text-3xl">-</span> Restas
          </button>

          <button 
            onClick={() => setSection('TRAINING_MENU')}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white text-xl font-bold py-4 rounded-2xl shadow-lg border-b-4 border-purple-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-3"
          >
             <Brain size={28} /> Entrenamiento
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center text-slate-400 text-sm">
            <span>Racha actual: <strong className="text-blue-500 text-lg">{streak}</strong></span>
            <span className="flex items-center gap-1"><Trophy size={14}/> ¡Tú puedes!</span>
        </div>
      </div>
    </div>
  );
}

export default App;