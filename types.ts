export type OperationType = 'ADDITION' | 'SUBTRACTION';

export type TrainingMode = 'DOUBLES' | 'COMPLEMENTS_10' | 'BRIDGE_10';

export interface MathProblem {
  id: string;
  type: OperationType;
  numbers: number[]; // The operands (top to bottom)
  expectedResult: number;
}

export interface TrainingProblem {
  id: string;
  mode: TrainingMode;
  questionText: string;
  expectedResult: number;
}

export interface ColumnState {
  userInput: string; // The main answer digit
  carryInput: string; // The carry/borrow digit above
  isCorrect: boolean;
  isLocked: boolean; // Once correct, it locks
}

export interface GameState {
  score: number;
  streak: number;
}