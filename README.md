# 🚀 TSMiniCompiler - Mini Compilador com Pipeline Bril

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

**Um mini compilador educacional com interface visual interativa para explorar o pipeline de compilação**

</div>

---

## 📖 Sobre o Projeto

O **TSMiniCompiler** é uma ferramenta educacional que demonstra como funciona um compilador moderno. Através de uma interface visual inspirada no terminal Ubuntu, você pode escrever código, visualizar cada etapa da compilação e entender como seu código é transformado até ser executado.

### O que você vai aprender?

- 📝 **Análise Léxica**: Como o código fonte é quebrado em tokens
- 🌳 **Análise Sintática**: Como os tokens formam uma árvore sintática abstrata (AST)
- ⚙️ **Geração de Código**: Como a AST vira instruções de máquina intermediárias
- 🔧 **Otimização**: Como código morto é identificado e removido
- ▶️ **Execução**: Como as instruções são interpretadas e executadas

---

## 🎯 Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| **Analisador Léxico** | Converte código fonte em tokens (palavras-chave, identificadores, números, operadores) |
| **Analisador Sintático** | Transforma tokens em uma árvore AST seguindo a gramática da linguagem |
| **Gerador de IR** | Produz representação intermediária no formato Bril |
| **Otimizador DCE** | Remove código morto (variáveis declaradas mas não utilizadas) |
| **Interpretador** | Executa as instruções IR e mostra o resultado |
| **Tabela de Símbolos** | Exibe todas as variáveis e se estão sendo usadas |
| **Métricas de Tempo** | Mostra quanto tempo cada fase leva para executar |

---

## 🛠️ Tecnologias Utilizadas

- **React 19** - Biblioteca para construção da interface
- **TypeScript** - Linguagem tipada para maior segurança
- **Vite** - Bundler rápido para desenvolvimento
- **Tailwind CSS** - Framework CSS para estilização
- **Lucide React** - Ícones modernos
- **JetBrains Mono** - Fonte monospace elegante

---

## 📦 Instalação

### Pré-requisitos

- Node.js versão 18 ou superior
- npm ou yarn

### Passos

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/minicompilador---pipeline-bril.git

# Entre na pasta do projeto
cd minicompilador---pipeline-bril

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev
```

O servidor de desenvolvimento será iniciado em `http://localhost:5173`

---

## 🎮 Como Usar

### 1. Escreva seu código

No painel **source.ts**, digite seu código. A linguagem aceita é um subconjunto de TypeScript/JavaScript:

```typescript
let x = 10;
let y = 20;
let z = 30; // essa variável não será usada
let resultado = x + y;
print(resultado);
```

### 2. Compile

Clique no botão **compile** para processar o código. Você verá:

- **lexer.out**: Lista de todos os tokens identificados
- **ast.json**: Árvore sintática abstrata em formato JSON
- **ir.json**: Instruções intermediárias geradas
- **symbols.table**: Tabela com todas as variáveis

### 3. Otimize (opcional)

Clique em **optimize** para executar a eliminação de código morto. Compare o `ir.json` original com o `ir.optimized.json` para ver quais instruções foram removidas.

### 4. Execute

Clique em **execute** para rodar o programa. O resultado aparece no painel **stdout**.

---

## 📚 A Linguagem

O TSMiniCompiler suporta um subconjunto simplificado de TypeScript:

### Sintaxe Aceita

| Construção | Exemplo | Descrição |
|------------|---------|-----------|
| **Declaração de variável** | `let x = 10;` | Cria uma variável com valor inicial |
| **Constantes** | `const PI = 314;` | Cria uma constante (tratada igual a let) |
| **Operações aritméticas** | `x + y * 2` | Soma (+), subtração (-), multiplicação (*), divisão (/) |
| **Parênteses** | `(x + y) * 2` | Agrupa expressões para controlar precedência |
| **Chamada de função** | `print(valor);` | Apenas `print` está disponível |
| **Comentários** | `// isso é um comentário` | Ignora todo texto até o fim da linha |

### Exemplo Completo

```typescript
// Calcula a soma de dois números
let primeiro = 15;
let segundo = 25;

// Esta variável é código morto (nunca usada)
let naoUsada = 100;

// Resultado da soma
let soma = primeiro + segundo;

// Mostra o resultado
print(soma);
```

---

## 🔍 Entendendo o Pipeline

### Passo 1: Análise Léxica (Lexer)

O lexer lê o código caractere por caractere e agrupa em **tokens**. Cada token tem:
- **Tipo**: KEYWORD, IDENTIFIER, NUMBER, OPERATOR, PUNCTUATION
- **Valor**: O texto do token
- **Linha**: Onde aparece no código

**Entrada:**
```typescript
let x = 10;
```

**Saída (tokens):**
```
KEYWORD 'let'
IDENTIFIER 'x'
OPERATOR '='
NUMBER '10'
PUNCTUATION ';'
```

### Passo 2: Análise Sintática (Parser)

O parser organiza os tokens em uma **árvore sintática abstrata (AST)**. Esta árvore representa a estrutura lógica do programa.

**Saída (AST):**
```json
{
  "type": "Program",
  "body": [
    {
      "type": "VarDecl",
      "name": "x",
      "value": {
        "type": "Literal",
        "value": 10
      }
    }
  ]
}
```

### Passo 3: Geração de Código (IR Generator)

O gerador percorre a AST e cria instruções **Bril** (Big Red Intermediate Language). Cada operação vira uma instrução simples.

**Saída (IR):**
```json
[
  { "op": "const", "dest": "x", "value": 10, "type": "int" }
]
```

### Passo 4: Otimização (DCE - Dead Code Elimination)

O otimizador identifica variáveis que são definidas mas nunca lidas. Essas definições são removidas.

**Exemplo:**
```typescript
let a = 1;  // REMOVIDA - 'a' nunca é usada
let b = 2;
print(b);   // 'b' é usada aqui, então é mantida
```

### Passo 5: Execução (Interpreter)

O interpretador simula uma máquina virtual que:
1. Mantém um **ambiente** (mapa de variáveis para valores)
2. Executa cada instrução em ordem
3. Imprime valores quando encontra `print`

---

## 📁 Estrutura do Projeto

```
minicompilador---pipeline-bril/
├── compiler/               # Lógica do compilador
│   ├── lexer.ts           # Análise léxica
│   ├── parser.ts          # Análise sintática
│   ├── generator.ts       # Geração de código IR
│   ├── optimizer.ts       # Otimização DCE
│   └── interpreter.ts     # Execução do IR
├── components/
│   └── Panel.tsx          # Componente de painel visual
├── App.tsx                # Componente principal
├── types.ts               # Definições de tipos TypeScript
├── index.html             # Página HTML principal
├── index.tsx              # Ponto de entrada React
├── vite.config.ts         # Configuração do Vite
├── tsconfig.json          # Configuração do TypeScript
└── package.json           # Dependências do projeto
```

---

## 🔨 Scripts Disponíveis

```bash
# Inicia o servidor de desenvolvimento
npm run dev

# Compila para produção
npm run build

# Visualiza a build de produção localmente
npm run preview
```

---

## 🎨 Interface

A interface foi inspirada no terminal do Ubuntu, com tema escuro e cores vibrantes para cada tipo de informação:

- 🟣 **Roxo** - Palavras-chave e tipos
- 🟡 **Amarelo** - Valores e strings
- 🔵 **Ciano** - Nomes de variáveis
- 🟢 **Verde** - Resultados e status positivos
- 🔴 **Vermelho** - Erros e código morto

---

## 📄 Licença

Este projeto é de código aberto e pode ser usado livremente para fins educacionais.

---

## 🙏 Créditos

- **Bril IR** - Formato de representação intermediária desenvolvido pela Universidade de Cornell
- **JetBrains Mono** - Fonte monospace gratuita da JetBrains

---

<div align="center">

**Feito com 💜 para fins educacionais**

</div>
