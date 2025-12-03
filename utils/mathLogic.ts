import { MathProblem, OperationType, TrainingProblem, TrainingMode } from "../types";

// Generate a random integer between min and max (inclusive)
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateProblem = (type: OperationType): MathProblem => {
  const isAddition = type === 'ADDITION';
  const operandCount = isAddition ? randomInt(3, 4) : 2;
  const numbers: number[] = [];
  
  // We want 5 digit numbers mostly
  const minVal = 10000;
  const maxVal = 99999;

  if (isAddition) {
    for (let i = 0; i < operandCount; i++) {
      numbers.push(randomInt(minVal, maxVal));
    }
  } else {
    // Subtraction: Ensure positive result
    const num1 = randomInt(minVal + 20000, maxVal); // Ensure top is big enough
    const num2 = randomInt(minVal, num1 - 1000); // Ensure result is at least positive and somewhat substantial
    numbers.push(num1);
    numbers.push(num2);
  }

  const expectedResult = isAddition 
    ? numbers.reduce((a, b) => a + b, 0)
    : numbers[0] - numbers[1];

  return {
    id: Date.now().toString(),
    type,
    numbers,
    expectedResult
  };
};

export const generateTrainingProblem = (mode: TrainingMode): TrainingProblem => {
  let questionText = "";
  let expectedResult = 0;

  switch (mode) {
    case 'DOUBLES': {
      // 6 + 6 = ?
      const n = randomInt(1, 10);
      questionText = `${n} + ${n}`;
      expectedResult = n + n;
      break;
    }
    case 'COMPLEMENTS_10': {
      // Del 7 al 10 van...
      const n = randomInt(1, 9);
      questionText = `Del ${n} al 10 van...`;
      expectedResult = 10 - n;
      break;
    }
    case 'BRIDGE_10': {
      // Del 7 al 13 van... (num1 0-9, num2 10-20)
      const start = randomInt(5, 9); // Starting a bit higher makes it truer "bridge" practice
      const end = randomInt(11, 19);
      questionText = `Del ${start} al ${end} van...`;
      expectedResult = end - start;
      break;
    }
  }

  return {
    id: Date.now().toString(),
    mode,
    questionText,
    expectedResult
  };
};

// Returns the expected result digit and the expected carry for the *next* column (leftward)
// columnIndex 0 is the rightmost (units)
export const solveColumn = (
  problem: MathProblem,
  columnIndex: number,
  previousCarry: number
): { resultDigit: number; nextCarry: number } => {
  
  // Get the digit at columnIndex for each number
  // Numbers are standard integers. We need to parse them from right to left.
  const digits = problem.numbers.map(num => {
    const str = num.toString();
    // Pad with zeros to be safe, though our generator uses 5 digits
    const padded = str.padStart(6, '0'); 
    // Get digit from right. Index 0 = padded.length - 1
    const charIndex = padded.length - 1 - columnIndex;
    if (charIndex < 0) return 0;
    return parseInt(padded[charIndex]);
  });

  if (problem.type === 'ADDITION') {
    const sum = digits.reduce((a, b) => a + b, 0) + previousCarry;
    const resultDigit = sum % 10;
    const nextCarry = Math.floor(sum / 10);
    return { resultDigit, nextCarry };
  } else {
    // Subtraction (Equal Additions Method / Método de sumas iguales)
    // Logic: Top - (Bottom + PreviousCarry)
    // The PreviousCarry here is the "1" that was added to the bottom of THIS column 
    // because the previous column (to the right) needed to borrow.
    
    const top = digits[0];
    const bottom = digits[1];
    
    // Effective bottom is the digit itself plus any carry coming from the right
    const effectiveBottom = bottom + previousCarry;
    
    let resultDigit: number;
    let nextCarry = 0;

    if (top < effectiveBottom) {
      // If top is smaller, we "borrow" (add 10 to top)
      // This implies we must pay back 1 to the bottom of the NEXT column (left).
      resultDigit = (top + 10) - effectiveBottom;
      nextCarry = 1;
    } else {
      resultDigit = top - effectiveBottom;
      nextCarry = 0;
    }

    return { resultDigit, nextCarry };
  }
};