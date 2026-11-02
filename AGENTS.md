# Antigravity & Cursor Shared Governance - Galaga Idle

Este arquivo espelha as regras universais definidas em `.cursor/rules/global-governance.mdc` e `.cursorrules`.
Consulte `STRUCTURE.md` para o mapa estrutural vivo.

## Regras Críticas do Agente Antigravity:
1. **Consulte `STRUCTURE.md`** antes de criar, alterar ou mover arquivos.
2. **Atualize `STRUCTURE.md`** imediatamente após qualquer adição ou alteração estrutural.
3. **Respeite a Clean Architecture + MVC:**
   - `domain/`: Regras puras sem frameworks.
   - `application/use-cases/`: Orquestração de negócio (1 use case por arquivo).
   - `infrastructure/`: Implementação concreta de DB, clients, APIs e Adapters.
   - `presentation/`: Controllers finos, views e validação de schema (Zod).
4. **File Size Cap (Max 250-300 Linhas):**
   - Sweet Spot: 100-250 linhas. Hard Cap: 300 linhas por arquivo.
   - Gatilho preventivo: ao atingir ~220 linhas, fatiar proativamente. Proibida minificação anti-cheat.
5. **Elegância Algorítmica & Anti-Redundância:**
   - Proibido >3 `if/else` ou `switch` sequenciais: usar Lookup Tables, Dicionários ou Strategy ($O(1)$).
   - Máximo 2 níveis de indentação por função. Abordagem funcional/declarativa e DRY com Generics (`<T>`).
6. **DLP & Higiene de Repositório (.gitignore & .env.example):**
   - Atualize `.gitignore` sempre que introduzir dependências, SDKs, caches ou persistência.
   - Preservar explicitamente pastas de governança: `.cursorrules`, `.cursor/`, `.agent/`, `AGENTS.md`, `STRUCTURE.md`.
   - Sincronize novas chaves no `.env.example` com valores mockados seguros.
7. **Fluxo de Trabalho por Fases:**
   - Desenvolvimento estritamente isolado em branches por fase (`feature/fase-X`).
   - Testes locais obrigatórios (`typecheck`, `test`, `security:audit`) antes do merge na `main`.
