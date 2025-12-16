import React, { useState, useEffect, useCallback } from 'react';
import { Panel } from './components/Panel';

// Imports da Lógica do Compilador
import { tokenize } from './compiler/lexer';
import { Parser } from './compiler/parser';
import { IRGenerator } from './compiler/generator';
import { optimizeIR } from './compiler/optimizer';
import { executeIR } from './compiler/interpreter';
import { Token, ASTNode, IRInstruction, SymbolInfo } from './types';

const INITIAL_CODE = `let x = 10;
let y = 20;
let z = 30; // dead code
let res = x + y;
print(res);`;

// Helper para calcular uso de variáveis na IR atual
function calculateSymbolUsage(ir: IRInstruction[], baseSymbols: SymbolInfo[]): SymbolInfo[] {
  const usedSet = new Set<string>();
  
  ir.forEach(instr => {
    if (instr.args) {
      instr.args.forEach(arg => usedSet.add(arg));
    }
  });

  return baseSymbols.map(sym => ({
    ...sym,
    used: usedSet.has(sym.name)
  }));
}

export default function App() {
  // --- Estados do Código ---
  const [sourceCode, setSourceCode] = useState(INITIAL_CODE);
  
  // --- Estados do Pipeline ---
  const [tokens, setTokens] = useState<Token[]>([]);
  const [ast, setAst] = useState<ASTNode | null>(null);
  const [ir, setIr] = useState<IRInstruction[]>([]);
  const [symbolTable, setSymbolTable] = useState<SymbolInfo[]>([]);
  
  const [optimizedIr, setOptimizedIr] = useState<IRInstruction[]>([]);
  const [removedCount, setRemovedCount] = useState(0);
  const [hasOptimized, setHasOptimized] = useState(false);
  
  const [stdOut, setStdOut] = useState<string[]>([]);
  const [hasExecuted, setHasExecuted] = useState(false);

  // --- Métricas de Performance ---
  const [compileTime, setCompileTime] = useState(0);
  const [optTime, setOptTime] = useState(0);
  const [execTime, setExecTime] = useState(0);

  // --- Status do Pipeline (Para o Footer) ---
  const pipelineStatus = {
    lexer: tokens.length > 0,
    parser: !!ast,
    codegen: ir.length > 0,
    optimizer: hasOptimized,
    runtime: hasExecuted
  };

  // --- 1. Compilação (Lexer -> Parser -> IR) ---
  const handleCompile = useCallback(() => {
    const start = performance.now();
    try {
      // Reset downstream
      setHasOptimized(false);
      setOptimizedIr([]);
      setHasExecuted(false);
      setStdOut([]);
      setOptTime(0);
      setExecTime(0);

      // Lexer
      const tokenList = tokenize(sourceCode);
      setTokens(tokenList);

      // Parser
      const parser = new Parser(tokenList);
      const astRoot = parser.parse();
      setAst(astRoot);

      // IR Gen
      const generator = new IRGenerator();
      const { ir: generatedIr, symbolTable: symbols } = generator.generate(astRoot);
      setIr(generatedIr);
      
      // Calculate initial usage based on raw IR
      setSymbolTable(calculateSymbolUsage(generatedIr, symbols));

    } catch (err) {
      console.error(err);
      setStdOut(["Error during compilation: " + (err as Error).message]);
    }
    const end = performance.now();
    setCompileTime(end - start);
  }, [sourceCode]);

  // Roda a compilação inicial
  useEffect(() => {
    handleCompile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 2. Otimização ---
  const handleOptimize = () => {
    if (ir.length === 0) return;
    const start = performance.now();
    
    const { optimizedIr: opt, removedCount: count } = optimizeIR(ir);
    setOptimizedIr(opt);
    setRemovedCount(count);
    setHasOptimized(true);
    
    // Atualiza tabela de símbolos para refletir o uso APÓS otimização
    // Nota: Usamos a tabela base (symbolTable) mas recalculamos o 'used' baseado na IR otimizada
    const updatedSymbols = calculateSymbolUsage(opt, symbolTable);
    setSymbolTable(updatedSymbols);

    const end = performance.now();
    setOptTime(end - start);
  };

  // --- 3. Execução ---
  const handleExecute = () => {
    const codeToRun = hasOptimized ? optimizedIr : ir;
    if (codeToRun.length === 0) return;
    
    const start = performance.now();
    const output = executeIR(codeToRun);
    setStdOut(output);
    setHasExecuted(true);
    const end = performance.now();
    setExecTime(end - start);
  };

  const handleClear = () => {
    setSourceCode('');
    setTokens([]);
    setAst(null);
    setIr([]);
    setSymbolTable([]);
    setOptimizedIr([]);
    setStdOut([]);
    setHasOptimized(false);
    setHasExecuted(false);
    setCompileTime(0);
    setOptTime(0);
    setExecTime(0);
  };

  // Contadores para o Header
  const instrCount = hasOptimized ? optimizedIr.length : ir.length;
  const varCount = symbolTable.filter(s => s.kind === 'var' || s.kind === 'const').length;
  const tempCount = symbolTable.filter(s => s.kind === 'temp').length;

  return (
    <div className="flex flex-col h-full font-mono text-xs select-none">
      
      {/* Header (Top Bar) */}
      <header className="bg-gray-900 border-b border-gray-700 px-4 py-2 flex justify-between items-center text-gray-300">
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-bold">user@compiler:~/bril-compiler$</span>
          <span>./compiler --version</span>
          <span className="text-gray-500 ml-2">Compiler v1.0.0 [Bril IR] | Frontend: TS subset | Optimizer: DCE</span>
        </div>
        <div className="flex gap-4 text-[10px] uppercase tracking-wider">
          <span>instructions: <span className="text-cyan-400">{instrCount}</span></span>
          <span>variables: <span className="text-yellow-400">{varCount}</span></span>
          <span>temp_regs: <span className="text-purple-400">{tempCount}</span></span>
        </div>
      </header>

      {/* Control Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex justify-between items-center">
        <div className="flex gap-2">
          <button onClick={handleCompile} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600 transition-colors">
            compile
          </button>
          <button onClick={handleOptimize} disabled={ir.length === 0} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600 disabled:opacity-30 transition-colors">
            optimize
          </button>
          <button onClick={handleExecute} disabled={ir.length === 0} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600 disabled:opacity-30 transition-colors">
            execute
          </button>
          <button onClick={handleClear} className="px-3 py-1 rounded bg-red-900/30 hover:bg-red-900 text-red-200 border border-red-900/50 transition-colors ml-4">
            clear
          </button>
        </div>
        <div className="text-[10px] text-gray-400 flex gap-4">
          <span>compile: {compileTime.toFixed(2)}ms</span>
          <span>optimize: {optTime.toFixed(2)}ms</span>
          <span>execute: {execTime.toFixed(2)}ms</span>
        </div>
      </div>

      {/* Main Grid */}
      <main className="flex-1 p-3 overflow-hidden">
        <div className="grid grid-cols-2 grid-rows-[1fr_1fr_1fr_auto] gap-3 h-full">
          
          {/* Row 1, Col 1: Source */}
          <Panel title="source.ts" info={`${sourceCode.split('\n').length} lines`} className="bg-opacity-50">
            <textarea
              className="w-full h-full bg-transparent text-gray-100 resize-none focus:outline-none"
              value={sourceCode}
              spellCheck={false}
              onChange={(e) => setSourceCode(e.target.value)}
            />
          </Panel>

          {/* Row 1, Col 2: Lexer Out */}
          <Panel title="lexer.out" info={`${tokens.length} tokens`}>
            {tokens.map((t, i) => (
              <div key={i} className="whitespace-pre">
                <span className="text-gray-500 mr-2">{i}</span>
                <span className="text-purple-400">{t.type.toLowerCase()}</span>
                <span className="text-yellow-300 mx-2">'{t.value}'</span>
                <span className="text-gray-600">:{t.line}</span>
              </div>
            ))}
          </Panel>

          {/* Row 2, Col 1: AST */}
          <Panel title="ast.json">
            <pre className="text-purple-400">
              {ast ? JSON.stringify(ast, null, 2) : '// no ast'}
            </pre>
          </Panel>

          {/* Row 2, Col 2: Symbols */}
          <Panel title="symbols.table" info={`${symbolTable.length} entries`}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-yellow-400 border-b border-gray-700">
                  <th className="py-1">symbol</th>
                  <th className="py-1">type</th>
                  <th className="py-1">kind</th>
                  <th className="py-1 text-right">used</th>
                </tr>
              </thead>
              <tbody>
                {symbolTable.map((s, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-white/5">
                    <td className="py-0.5 text-cyan-400">{s.name}</td>
                    <td className="py-0.5 text-gray-400">{s.type}</td>
                    <td className="py-0.5 text-orange-400">{s.kind}</td>
                    <td className={`py-0.5 text-right ${s.used ? 'text-green-400' : 'text-red-400'}`}>
                      {s.used.toString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          {/* Row 3, Col 1: IR */}
          <Panel title="ir.json" info={`${ir.length} instructions`}>
            <pre className="text-yellow-400">
              {ir.length > 0 ? JSON.stringify(ir, null, 2) : '// no ir'}
            </pre>
          </Panel>

          {/* Row 3, Col 2: Optimized IR */}
          <Panel title="ir.optimized.json" info={hasOptimized ? `${optimizedIr.length} instructions (-${removedCount})` : 'pending'}>
            <pre className="text-cyan-400">
              {hasOptimized ? JSON.stringify(optimizedIr, null, 2) : '// run optimizer first'}
            </pre>
          </Panel>

          {/* Row 4: Stdout (Full Width) */}
          <Panel title="stdout" className="col-span-2 h-32 shrink-0">
             {stdOut.length > 0 ? (
               stdOut.map((line, i) => <div key={i} className="text-green-400">{line}</div>)
             ) : (
               <span className="text-gray-600 italic">// no output</span>
             )}
          </Panel>

        </div>
      </main>

      {/* Footer Pipeline Status */}
      <footer className="bg-gray-900 border-t border-gray-700 px-4 py-1 text-[10px] flex items-center justify-between text-gray-500">
         <div className="flex items-center gap-2">
           <span className="font-bold">pipeline:</span>
           <span className={pipelineStatus.lexer ? 'text-green-400' : ''}>lexer{pipelineStatus.lexer ? '✓' : '○'}</span>
           <span>→</span>
           <span className={pipelineStatus.parser ? 'text-green-400' : ''}>parser{pipelineStatus.parser ? '✓' : '○'}</span>
           <span>→</span>
           <span className={pipelineStatus.codegen ? 'text-green-400' : ''}>codegen{pipelineStatus.codegen ? '✓' : '○'}</span>
           <span>→</span>
           <span className={pipelineStatus.optimizer ? 'text-green-400' : ''}>optimizer{pipelineStatus.optimizer ? '✓' : '○'}</span>
           <span>→</span>
           <span className={pipelineStatus.runtime ? 'text-green-400' : ''}>runtime{pipelineStatus.runtime ? '✓' : '○'}</span>
         </div>
         <div>Ubuntu Terminal Theme</div>
      </footer>
    </div>
  );
}