import { IRInstruction } from '../types';

export function optimizeIR(instructions: IRInstruction[]): { optimizedIr: IRInstruction[], removedCount: number } {
  // Trivial Dead Code Elimination (DCE)
  // 1. Identify variables that are defined but never used.
  // 2. Remove instructions that define those variables (unless the instruction has side effects).

  // Since removing one instruction might make another variable dead (chain reaction),
  // a robust DCE runs iteratively. For this demo, we'll do a single pass or a simple loop.
  
  let currentIr = [...instructions];
  let removedTotal = 0;
  let changed = true;

  while (changed) {
    changed = false;
    const usedVariables = new Set<string>();

    // Pass 1: Collect all used variables
    currentIr.forEach(instr => {
      if (instr.args) {
        instr.args.forEach(arg => usedVariables.add(arg));
      }
    });

    // Pass 2: Filter instructions
    const nextIr: IRInstruction[] = [];
    currentIr.forEach(instr => {
      // Side effect operations must be kept
      if (instr.op === 'print') {
        nextIr.push(instr);
        return;
      }

      // If instruction has a destination, check if it's used
      if (instr.dest) {
        if (usedVariables.has(instr.dest)) {
          nextIr.push(instr);
        } else {
          // It's dead code!
          changed = true;
          removedTotal++;
        }
      } else {
        // No dest, probably side effect (though in our subset only print fits here)
        nextIr.push(instr);
      }
    });

    currentIr = nextIr;
  }

  return { optimizedIr: currentIr, removedCount: removedTotal };
}