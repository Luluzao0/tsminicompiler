import { Token, TokenType } from '../types';

const KEYWORDS = new Set(['let', 'const']); // 'print' removido para ser tratado como identificador

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let current = 0;
  let line = 1;

  while (current < source.length) {
    let char = source[current];

    // Espaços em branco (Whitespace)
    if (/\s/.test(char)) {
      if (char === '\n') line++;
      current++;
      continue;
    }

    // Comentários (ignora até o fim da linha)
    if (char === '/' && source[current + 1] === '/') {
      while (current < source.length && source[current] !== '\n') {
        current++;
      }
      continue;
    }

    // Números
    if (/[0-9]/.test(char)) {
      let value = '';
      while (current < source.length && /[0-9]/.test(source[current])) {
        value += source[current];
        current++;
      }
      tokens.push({ type: TokenType.Number, value, line });
      continue;
    }

    // Identificadores & Palavras-chave (Keywords)
    if (/[a-zA-Z_]/.test(char)) {
      let value = '';
      while (current < source.length && /[a-zA-Z0-9_]/.test(source[current])) {
        value += source[current];
        current++;
      }
      const type = KEYWORDS.has(value) ? TokenType.Keyword : TokenType.Identifier;
      tokens.push({ type, value, line });
      continue;
    }

    // Operadores e Pontuação
    // A barra '/' precisa ser escapada dentro da regex literal para não causar erro de sintaxe
    if (/[+\-*\/=]/.test(char)) {
      tokens.push({ type: TokenType.Operator, value: char, line });
      current++;
      continue;
    }

    if (/[();]/.test(char)) {
      tokens.push({ type: TokenType.Punctuation, value: char, line });
      current++;
      continue;
    }

    throw new Error(`Caractere inesperado: '${char}' na linha ${line}`);
  }

  tokens.push({ type: TokenType.EOF, value: 'EOF', line });
  return tokens;
}