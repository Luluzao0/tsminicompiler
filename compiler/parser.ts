import { Token, TokenType, Program, ASTNode, BinaryExpr, CallExpr, Literal, Identifier, VarDecl } from '../types';

export class Parser {
  private tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.tokens[this.current - 1];
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private match(type: TokenType, value?: string): boolean {
    if (this.isAtEnd()) return false;
    const token = this.peek();
    if (token.type !== type) return false;
    if (value && token.value !== value) return false;
    this.advance();
    return true;
  }

  private expect(type: TokenType, errorMessage: string): Token {
    if (this.peek().type === type) return this.advance();
    throw new Error(`${errorMessage} Encontrado '${this.peek().value}' na linha ${this.peek().line}`);
  }

  // --- Métodos de Análise (Parsing) ---

  public parse(): Program {
    const body: ASTNode[] = [];
    while (!this.isAtEnd()) {
      body.push(this.parseStatement());
    }
    return { type: 'Program', body };
  }

  private parseStatement(): ASTNode {
    const token = this.peek();
    if (token.type === TokenType.Keyword && (token.value === 'let' || token.value === 'const')) {
      return this.parseVarDecl();
    }
    
    // Fallback para declaração de expressão (ex: chamadas de função)
    const expr = this.parseExpression();
    this.match(TokenType.Punctuation, ';'); // Consome ponto e vírgula opcional
    return expr;
  }

  private parseVarDecl(): VarDecl {
    this.advance(); // consome let/const
    const nameToken = this.expect(TokenType.Identifier, "Esperava um nome de variável.");
    this.expect(TokenType.Operator, "Esperava '=' após o nome da variável."); // simplificado
    const value = this.parseExpression();
    this.match(TokenType.Punctuation, ';'); // consome ponto e vírgula opcional
    return { type: 'VarDecl', name: nameToken.value, value };
  }

  private parseExpression(): ASTNode {
    return this.parseAdditive();
  }

  private parseAdditive(): ASTNode {
    let left = this.parseMultiplicative();

    while (this.peek().value === '+' || this.peek().value === '-') {
      const operator = this.advance().value;
      const right = this.parseMultiplicative();
      left = { type: 'BinaryExpr', left, right, operator } as BinaryExpr;
    }

    return left;
  }

  private parseMultiplicative(): ASTNode {
    let left = this.parsePrimary();

    while (this.peek().value === '*' || this.peek().value === '/') {
      const operator = this.advance().value;
      const right = this.parsePrimary();
      left = { type: 'BinaryExpr', left, right, operator } as BinaryExpr;
    }

    return left;
  }

  private parsePrimary(): ASTNode {
    const token = this.peek();

    if (token.type === TokenType.Number) {
      this.advance();
      return { type: 'Literal', value: parseInt(token.value) } as Literal;
    }

    if (token.type === TokenType.Identifier) {
      this.advance();
      // Verifica chamada de função
      if (this.match(TokenType.Punctuation, '(')) {
        const args: ASTNode[] = [];
        if (!this.match(TokenType.Punctuation, ')')) {
          do {
            args.push(this.parseExpression());
          } while (this.match(TokenType.Punctuation, ','));
          this.expect(TokenType.Punctuation, "Esperava ')' após os argumentos.");
        }
        return { type: 'CallExpr', callee: token.value, args } as CallExpr;
      }
      return { type: 'Identifier', name: token.value } as Identifier;
    }

    if (this.match(TokenType.Punctuation, '(')) {
      const expr = this.parseExpression();
      this.expect(TokenType.Punctuation, "Esperava ')' após a expressão.");
      return expr;
    }

    throw new Error(`Token inesperado '${token.value}' na linha ${token.line}`);
  }
}