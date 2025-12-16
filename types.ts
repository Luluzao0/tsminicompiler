// --- Lexer Types ---
export enum TokenType {
  Keyword = 'KEYWORD',
  Identifier = 'IDENTIFIER',
  Number = 'NUMBER',
  Operator = 'OPERATOR',
  Punctuation = 'PUNCTUATION',
  EOF = 'EOF'
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
}

// --- AST Types ---
export type NodeType = 'Program' | 'VarDecl' | 'BinaryExpr' | 'CallExpr' | 'Literal' | 'Identifier';

export interface ASTNode {
  type: NodeType;
}

export interface Program extends ASTNode {
  type: 'Program';
  body: ASTNode[];
}

export interface VarDecl extends ASTNode {
  type: 'VarDecl';
  name: string;
  value: ASTNode; // Initializer
}

export interface BinaryExpr extends ASTNode {
  type: 'BinaryExpr';
  left: ASTNode;
  right: ASTNode;
  operator: string;
}

export interface CallExpr extends ASTNode {
  type: 'CallExpr';
  callee: string;
  args: ASTNode[];
}

export interface Literal extends ASTNode {
  type: 'Literal';
  value: number;
}

export interface Identifier extends ASTNode {
  type: 'Identifier';
  name: string;
}

// --- IR Types (Bril-inspired) ---
export interface IRInstruction {
  op: string;           // 'const', 'add', 'sub', 'mul', 'div', 'print', 'id'
  dest?: string;        // Destination variable (e.g., 'x', 'temp1')
  args?: string[];      // Arguments (variables)
  value?: number;       // For 'const' operations
  type?: string;        // 'int', 'void'
}

export interface SymbolInfo {
  name: string;
  type: string;
  kind: 'var' | 'const' | 'temp';
  used: boolean;
}