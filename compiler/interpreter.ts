import { IRInstruction } from '../types';

export function executeIR(instructions: IRInstruction[]): string[] {
  const env = new Map<string, number>();
  const logs: string[] = [];

  for (const instr of instructions) {
    switch (instr.op) {
      case 'const':
        if (instr.dest && instr.value !== undefined) {
          env.set(instr.dest, instr.value);
        }
        break;

      case 'id':
        if (instr.dest && instr.args && instr.args.length > 0) {
          const val = env.get(instr.args[0]);
          if (val !== undefined) env.set(instr.dest, val);
        }
        break;

      case 'add':
      case 'sub':
      case 'mul':
      case 'div':
        if (instr.dest && instr.args && instr.args.length === 2) {
          const v1 = env.get(instr.args[0]) ?? 0;
          const v2 = env.get(instr.args[1]) ?? 0;
          let res = 0;
          if (instr.op === 'add') res = v1 + v2;
          if (instr.op === 'sub') res = v1 - v2;
          if (instr.op === 'mul') res = v1 * v2;
          if (instr.op === 'div') res = Math.floor(v1 / v2); // Divisão inteira
          env.set(instr.dest, res);
        }
        break;

      case 'print':
        if (instr.args) {
          const values = instr.args.map(arg => env.get(arg));
          logs.push(values.join(' '));
        }
        break;
    }
  }

  if (logs.length === 0) {
    logs.push("Programa executado com sucesso (Sem saída).");
  }

  return logs;
}