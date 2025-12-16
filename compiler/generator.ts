import { ASTNode, IRInstruction, SymbolInfo, Program, VarDecl, BinaryExpr, CallExpr, Literal, Identifier } from '../types';

export class IRGenerator {
  private instructions: IRInstruction[] = [];
  private symbolTable: SymbolInfo[] = [];
  private tempCounter = 0;

  public generate(ast: Program): { ir: IRInstruction[], symbolTable: SymbolInfo[] } {
    this.instructions = [];
    this.symbolTable = [];
    this.tempCounter = 0;

    ast.body.forEach(node => this.visit(node));

    return { ir: this.instructions, symbolTable: this.symbolTable };
  }

  private newTemp(): string {
    const tempName = `temp${this.tempCounter++}`;
    // Adiciona temporários à tabela de símbolos também, para visualização completa
    this.symbolTable.push({ name: tempName, type: 'int', kind: 'temp', used: false });
    return tempName;
  }

  private visit(node: ASTNode): string | null {
    switch (node.type) {
      case 'VarDecl':
        return this.visitVarDecl(node as VarDecl);
      case 'BinaryExpr':
        return this.visitBinaryExpr(node as BinaryExpr);
      case 'Literal':
        return this.visitLiteral(node as Literal);
      case 'Identifier':
        return this.visitIdentifier(node as Identifier);
      case 'CallExpr':
        return this.visitCallExpr(node as CallExpr);
      default:
        return null;
    }
  }

  private visitVarDecl(node: VarDecl): string | null {
    const resultVar = this.visit(node.value);

    if (resultVar) {
      const lastInstr = this.instructions[this.instructions.length - 1];
      
      // Otimização simples: se a última instrução escreveu em um temp, renomeia o temp para a variável
      if (lastInstr && lastInstr.dest === resultVar && resultVar.startsWith('temp')) {
        // Atualiza a entrada na tabela de símbolos se existir
        const tempIndex = this.symbolTable.findIndex(s => s.name === resultVar);
        if (tempIndex !== -1) {
             this.symbolTable.splice(tempIndex, 1); // Remove o temp pois ele virou a variável
        }
        
        lastInstr.dest = node.name;
      } else {
        this.instructions.push({
          op: 'id',
          dest: node.name,
          args: [resultVar],
          type: 'int'
        });
      }

      this.symbolTable.push({ name: node.name, type: 'int', kind: 'var', used: false });
    }
    return node.name;
  }

  private visitBinaryExpr(node: BinaryExpr): string {
    const left = this.visit(node.left)!;
    const right = this.visit(node.right)!;
    const dest = this.newTemp();

    let opMap: Record<string, string> = {
      '+': 'add',
      '-': 'sub',
      '*': 'mul',
      '/': 'div'
    };

    this.instructions.push({
      op: opMap[node.operator],
      dest,
      args: [left, right],
      type: 'int'
    });

    return dest;
  }

  private visitLiteral(node: Literal): string {
    const dest = this.newTemp();
    this.instructions.push({
      op: 'const',
      dest,
      value: node.value,
      type: 'int'
    });
    return dest;
  }

  private visitIdentifier(node: Identifier): string {
    return node.name;
  }

  private visitCallExpr(node: CallExpr): string | null {
    if (node.callee === 'print') {
        const args = node.args.map(arg => this.visit(arg)!);
        this.instructions.push({
            op: 'print',
            args: args
        });
        return null; // print returns void
    }
    return null;
  }
}