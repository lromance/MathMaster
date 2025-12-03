import React, { useState, useEffect, useCallback } from 'react';
import { MathProblem } from '../types';
import { solveColumn } from '../utils/mathLogic';
import DigitInput from './DigitInput';
import { Check, ArrowLeft } from 'lucide-react';

interface MathBoardProps {
  problem: MathProblem;
  onComplete: () => void;
  onExit: () => void;
}

const TOTAL_COLUMNS = 6; // 5 digits + 1 extra for potential final carry

// Helper to safely get a digit from a number at a specific column index (0 is rightmost)
const getDigit = (number: number, colIndex: number) => {
  const str = number.toString();
  const padded = str.padStart(6, '0');
  const charIndex = padded.length - 1 - colIndex;
  if (charIndex < 0) return 0;
  return parseInt(padded[charIndex]);
};

const MathBoard: React.FC<MathBoardProps> = ({ problem, onComplete, onExit }) => {
  // We process from right (index 0) to left (index 5)
  // Visual layout is Left -> Right (5 -> 0)
  
  // State for inputs
  const [resultInputs, setResultInputs] = useState<string[]>(Array(TOTAL_COLUMNS).fill(''));
  
  // Two rows of auxiliary bubbles
  // ADDITION: Only topBubbles are used (for carries).
  // SUBTRACTION: 
  //   topBubbles = Indicators of "borrowing" (adding 10 to top). User enters '1'.
  //   bottomBubbles = Indicators of "equal addition" (adding 1 to next bottom). User enters 'Bottom+1'.
  const [topBubbles, setTopBubbles] = useState<string[]>(Array(TOTAL_COLUMNS).fill(''));
  const [bottomBubbles, setBottomBubbles] = useState<string[]>(Array(TOTAL_COLUMNS).fill(''));
  
  const [activeColumn, setActiveColumn] = useState(0);
  const [columnStatus, setColumnStatus] = useState<'default' | 'error' | 'correct'>('default');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  
  // Pre-calculated correct answers
  const [expectedValues, setExpectedValues] = useState<{res: number, carry: number}[]>([]);

  useEffect(() => {
    // Pre-calculate answers
    const calculated: {res: number, carry: number}[] = [];
    let currentCarry = 0;
    
    for (let i = 0; i < TOTAL_COLUMNS; i++) {
      const { resultDigit, nextCarry } = solveColumn(problem, i, currentCarry);
      calculated.push({ res: resultDigit, carry: nextCarry });
      currentCarry = nextCarry;
    }
    setExpectedValues(calculated);
    
    // Reset state
    setResultInputs(Array(TOTAL_COLUMNS).fill(''));
    setTopBubbles(Array(TOTAL_COLUMNS).fill(''));
    setBottomBubbles(Array(TOTAL_COLUMNS).fill(''));
    setActiveColumn(0);
    setColumnStatus('default');
    setFeedbackMessage('¡Empieza por la derecha!');
  }, [problem]);

  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<string[]>>, 
    arr: string[], 
    val: string, 
    index: number
  ) => {
    const newArr = [...arr];
    newArr[index] = val;
    setter(newArr);
    setColumnStatus('default');
  };

  const validateCurrentStep = useCallback(() => {
    const expected = expectedValues[activeColumn];
    const userRes = parseInt(resultInputs[activeColumn]);
    
    // 1. Validate Result
    if (isNaN(userRes)) {
      setFeedbackMessage("Falta el resultado.");
      setColumnStatus('error');
      return;
    }

    if (userRes !== expected.res) {
      setFeedbackMessage("El resultado no es correcto. Inténtalo de nuevo.");
      setColumnStatus('error');
      return;
    }

    // 2. Validate Aux Bubbles
    const nextColIdx = activeColumn + 1;
    
    if (problem.type === 'ADDITION') {
        // Validation for Addition (Top Bubbles = Carries)
        const carryVal = parseInt(topBubbles[nextColIdx]) || 0;
        
        if (expected.carry > 0) {
            if (carryVal !== expected.carry) {
                setFeedbackMessage(`¡No te olvides de la llevada! (Arriba de la siguiente columna)`);
                setColumnStatus('error');
                return;
            }
        } else {
            if (topBubbles[nextColIdx] && topBubbles[nextColIdx] !== '0') {
                setFeedbackMessage("Aquí no hay llevada.");
                setColumnStatus('error');
                return;
            }
        }

    } else {
        // Validation for Subtraction
        // Logic: 
        // If we borrowed (expected.carry === 1):
        //   1. This column's TOP bubble must correspond to the borrow (usually '1').
        //   2. Next column's BOTTOM bubble must be 'NextBottom + 1'.
        
        // Check 1: Top Bubble of CURRENT column (Did we mark the borrow?)
        // Note: expected.carry from solveColumn=1 means "We borrowed for THIS column".
        const currentTopBubbleVal = topBubbles[activeColumn];
        if (expected.carry > 0) {
             if (currentTopBubbleVal !== '1') {
                 setFeedbackMessage("Como el número de arriba es menor, pon un 1 para convertirlo en 1" + getDigit(problem.numbers[0], activeColumn) + ".");
                 setColumnStatus('error');
                 return;
             }
        } else {
            if (currentTopBubbleVal && currentTopBubbleVal !== '0') {
                setFeedbackMessage("No hace falta pedir prestado aquí.");
                setColumnStatus('error');
                return;
            }
        }

        // Check 2: Bottom Bubble of NEXT column (Equal addition)
        if (nextColIdx < TOTAL_COLUMNS) {
            const nextBottomBubbleVal = bottomBubbles[nextColIdx];
            
            if (expected.carry > 0) {
                const nextBottomDigit = getDigit(problem.numbers[1], nextColIdx);
                const expectedNextBottom = (nextBottomDigit + 1).toString();
                
                if (nextBottomBubbleVal !== expectedNextBottom) {
                    setFeedbackMessage(`Ahora suma 1 al número de abajo de la siguiente columna (${nextBottomDigit} + 1).`);
                    setColumnStatus('error');
                    return;
                }
            } else {
                if (nextBottomBubbleVal && nextBottomBubbleVal !== '0') {
                    setFeedbackMessage("No nos llevamos ninguna a la siguiente columna.");
                    setColumnStatus('error');
                    return;
                }
            }
        }
    }

    // Success
    setColumnStatus('correct');
    setFeedbackMessage("¡Muy bien!");
    
    if (activeColumn < TOTAL_COLUMNS - 1) {
      setTimeout(() => {
        setActiveColumn(prev => prev + 1);
        setColumnStatus('default');
        setFeedbackMessage('');
      }, 500);
    } else {
      onComplete();
    }

  }, [activeColumn, resultInputs, topBubbles, bottomBubbles, expectedValues, problem, onComplete]);


  const renderColumn = (visualIndex: number) => {
    const logicalIndex = TOTAL_COLUMNS - 1 - visualIndex;
    
    const isActive = logicalIndex === activeColumn;
    const isPast = logicalIndex < activeColumn;
    
    // Determine editability
    const canEditTop = isActive; 
    const canEditBottom = (activeColumn === logicalIndex - 1); 

    // Get digits
    const topNumberDigits = problem.numbers.slice(0, problem.numbers.length - 1); // For addition could be multiple
    const bottomNumberDigit = problem.numbers[problem.numbers.length - 1]; // Last one is bottom

    // Special handling for Subtraction (Always 2 numbers) vs Addition
    const isSubtraction = problem.type === 'SUBTRACTION';
    
    // Check if bottom number is modified by a bubble
    const hasBottomBubble = isSubtraction && bottomBubbles[logicalIndex] !== '' && bottomBubbles[logicalIndex] !== '0';

    return (
        <div key={visualIndex} className="flex flex-col items-center w-14 sm:w-24 relative">
          
          {/* ROW 1: Top Bubbles (For Addition Only) */}
          {!isSubtraction && (
             <div className="h-10 mb-0 flex items-end justify-center z-20">
                <DigitInput 
                    value={topBubbles[logicalIndex]}
                    onChange={(v) => handleInputChange(setTopBubbles, topBubbles, v, logicalIndex)}
                    isReadOnly={!(activeColumn === logicalIndex - 1)}
                    variant="carry"
                    status={isPast || isActive ? 'correct' : (activeColumn === logicalIndex - 1 && columnStatus === 'error' ? 'error' : 'default')}
                />
             </div>
          )}
          
          {/* Spacer for Subtraction to preserve vertical spacing if needed */}
          {isSubtraction && <div className="h-10 mb-0" />}

          {/* Numbers Area */}
          <div className="flex flex-col w-full items-center justify-end z-10">
             
             {/* Top Numbers */}
             {topNumberDigits.map((num, idx) => (
                <div key={idx} className="relative w-full h-12 sm:h-16 flex items-center justify-center">
                    
                    {/* SUBTRACTION TOP BUBBLE - Positioned left of digit */}
                    {isSubtraction && (
                         <div className="absolute right-1/2 mr-3 sm:mr-5 -top-2 sm:top-1 z-20">
                             <DigitInput 
                                value={topBubbles[logicalIndex]}
                                onChange={(v) => handleInputChange(setTopBubbles, topBubbles, v, logicalIndex)}
                                isReadOnly={!canEditTop}
                                variant="carry"
                                status={isPast ? 'correct' : (isActive && columnStatus === 'error' ? 'error' : 'default')}
                            />
                         </div>
                    )}
                    
                    <span className="text-4xl sm:text-6xl text-slate-700 leading-none select-none">
                        {getDigit(num, logicalIndex)}
                    </span>
                </div>
             ))}

             {/* Bottom Number */}
             <div className="relative w-full h-12 sm:h-16 flex items-center justify-center">
                <span className={hasBottomBubble ? "text-slate-300 relative select-none" : "text-4xl sm:text-6xl text-slate-700 leading-none select-none"}>
                    {getDigit(bottomNumberDigit, logicalIndex)}
                    {/* Strikethrough for modified bottom number */}
                    {hasBottomBubble && (
                        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="w-full h-1 bg-red-400 transform -rotate-12"></span>
                        </span>
                    )}
                </span>
             </div>

          </div>
          
          {/* ROW 2: Bottom Bubbles (Subtraction Only) */}
          {isSubtraction && (
              <div className="h-10 mt-1 flex items-start justify-center w-full relative">
                   <DigitInput 
                    value={bottomBubbles[logicalIndex]}
                    onChange={(v) => handleInputChange(setBottomBubbles, bottomBubbles, v, logicalIndex)}
                    isReadOnly={!canEditBottom} 
                    variant="carry"
                    maxLength={2} 
                    status={(isPast || isActive) ? 'correct' : (activeColumn === logicalIndex - 1 && columnStatus === 'error' ? 'error' : 'default')}
                  />
              </div>
          )}
  
          {/* Line */}
           <div className={`w-full h-1 bg-slate-800 rounded-full ${isSubtraction ? 'my-1' : 'mt-1 mb-3'}`}></div>

          {/* Result */}
          <div className="relative">
            <DigitInput 
              value={resultInputs[logicalIndex]}
              onChange={(v) => handleInputChange(setResultInputs, resultInputs, v, logicalIndex)}
              isReadOnly={!isActive} 
              isFocused={isActive && !resultInputs[logicalIndex]}
              status={isPast ? 'correct' : (isActive && columnStatus === 'error' ? 'error' : 'default')}
              onEnter={isActive ? validateCurrentStep : undefined}
            />
          </div>
        </div>
      );
  };

  const symbol = problem.type === 'ADDITION' ? '+' : '-';

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-2 sm:p-4">
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-6">
        <button onClick={onExit} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg flex items-center gap-2">
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Menú</span>
        </button>
        <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
           {problem.type === 'ADDITION' ? 'Suma' : 'Resta'}
        </div>
        <div className="w-10"></div> 
      </div>

      {/* Board Card */}
      <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-10 w-full relative border-b-8 border-blue-200">
        
        <div className="absolute left-2 sm:left-6 top-1/2 -translate-y-12 text-5xl sm:text-7xl text-slate-200 font-bold select-none">
          {symbol}
        </div>

        <div className="flex justify-center items-end mb-6">
          {Array.from({ length: TOTAL_COLUMNS }).map((_, i) => renderColumn(i))}
        </div>

        <div className="h-14 flex items-center justify-center text-center px-4">
          {feedbackMessage && (
            <p className={`text-lg font-medium leading-tight ${columnStatus === 'error' ? 'text-red-500' : 'text-blue-600'}`}>
              {feedbackMessage}
            </p>
          )}
        </div>

        <div className="flex justify-center mt-4">
           <button
            onClick={validateCurrentStep}
            disabled={activeColumn >= TOTAL_COLUMNS}
            className={`
              flex items-center gap-2 px-8 py-3 rounded-full text-xl font-bold text-white transition-all transform active:scale-95
              ${columnStatus === 'error' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-green-500 hover:bg-green-600 shadow-green-200'}
              shadow-lg
            `}
           >
             <Check size={28} strokeWidth={3} />
             Comprobar
           </button>
        </div>
      </div>
      
      <div className="flex gap-2 mt-8 justify-center">
        {Array.from({ length: TOTAL_COLUMNS }).map((_, i) => {
            const logicalIndex = TOTAL_COLUMNS - 1 - i;
            const isCompleted = logicalIndex < activeColumn;
            const isCurrent = logicalIndex === activeColumn;
            return (
                <div 
                  key={i} 
                  className={`w-3 h-3 rounded-full transition-colors ${isCompleted ? 'bg-green-500' : isCurrent ? 'bg-blue-500 scale-125' : 'bg-slate-200'}`} 
                />
            );
        })}
      </div>
    </div>
  );
};

export default MathBoard;