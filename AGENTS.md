# Antigravity & Cursor Shared Governance - Galaga Idle

Este arquivo espelha as regras universais definidas em `.cursorrules` e `.cursor/rules/core-governance.mdc`.
Consulte `.cursorrules` para o texto integral e `STRUCTURE.md` para o mapa estrutural vivo.

## Regras Críticas do Agente Antigravity:
1. **Consulte `STRUCTURE.md`** antes de criar, alterar ou mover arquivos.
2. **Atualize `STRUCTURE.md`** imediatamente após qualquer adição ou alteração estrutural.
3. **Respeite a Clean Architecture + MVC:**
   - `domain/`: Regras puras sem frameworks.
   - `application/use-cases/`: Orquestração de negócio.
   - `infrastructure/`: Implementação concreta de DB, clients, APIs.
   - `presentation/`: Controllers finos, views e validação de schema (Zod).
4. **Tipagem Estrita (Zero-Any):** Proibido `any`, tipagem explícita em tudo.
5. **Zero Lazy Coding:** Proibido `// TODO: implementar depois` ou códigos pela metade.
6. **Security-First:** Validação de input na borda, queries parametrizadas, proteção anti-IDOR e segredos em `.env`.
7. **DLP & Higiene de Repositório (.gitignore & .env.example):**
   - Atualize `.gitignore` sempre que introduzir dependências, SDKs, caches ou arquivos de ambiente.
   - Proibição absoluta de rastrear arquivos `.env*` (exceto `.env.example`), chaves privadas, dumps de banco, logs ou artefatos de build.
   - Sempre sincronize novas chaves no `.env.example` com valores mockados seguros.
   - Inclua aviso de auditoria pré-resposta de conformidade DLP.
8. **File Size Cap & Modularização (Max 250-300 Linhas):**
   - Sweet Spot: 100-250 linhas. Hard Cap: 300 linhas por arquivo.
   - Gatilho preventivo: se atingir ~220 linhas, fatiar e extrair responsabilidades proativamente.
   - Rotas fatiadas por domínio, 1 Use Case por arquivo, thin controllers com schemas externos, VOs desacoplados e views atômicas.
9. **Manutenibilidade Humana & Anti-Fragile Code:**
   - Proibição absoluta de dependências circulares (extrair para camada inferior).
   - Inversão de Dependência via Interfaces/Ports (proibido new de libs/DB dentro de use cases).
   - Zero Magic Numbers/Strings (sempre `as const`, Enums ou constantes nomeadas).
   - Documentação de intenção (JSDoc em Use Cases/fórmulas, `// NOTE:` / `// SECURITY:` em workarounds; zero comentários óbvios).
   - Imutabilidade e funções puras (sem mutação de argumentos).
   - Erros contextuais rastreáveis (`[NomeDoUseCase] Motivo do erro`).
10. **Elegância Algorítmica & Anti-Redundância:**
   - Proibido >3 `if/else` ou `switch` sequenciais: usar Lookup Tables, Dicionários ou Strategy ($O(1)$).
   - Máximo 2 níveis de indentação por função; booleanos complexos extraídos para variáveis.
   - Funcional/declarativo sobre imperativo (sem loops com acumuladores mutáveis).
   - DRY com Generics (`<T>`) e Higher-Order Functions para fluxos duplicados.
   - Estruturas eficientes: `Set` e `Map` para buscas $O(1)$ em vez de `.find()` aninhados $O(n^2)$.
