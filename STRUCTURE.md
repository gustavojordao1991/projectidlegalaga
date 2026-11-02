# ==============================================================================
# MAPA ESTRUTURAL VIVO (STRUCTURE.MD) - GALAGA IDLE
# Single Source of Truth para Antigravity (Gemini) e Cursor Pro (Claude/Grok)
# ==============================================================================

> **ATENÇÃO AGENTES DE IA (Antigravity & Cursor):**
> 1. LEIA este arquivo antes de criar, mover ou remover qualquer arquivo no projeto.
> 2. ATUALIZE este arquivo imediatamente após qualquer alteração estrutural no código.
> 3. Mantenha a estrita separação de responsabilidades (Clean Architecture + MVC).

---

## 1. VISÃO GERAL DO SISTEMA E FLUXO DE DADOS

O projeto **Galaga Idle** é estruturado sobre o padrão **Clean Architecture + MVC Desacoplado**, garantindo isolamento total entre lógica de jogo/negócio, orquestração e mecanismos de entrega (I/O, renderização e banco de dados).

```
                      +---------------------------------------+
                      |               CLIENT                  |
                      |   (Browser / Frontend Engine UI)      |
                      +-------------------+-------------------+
                                          |
                                          | HTTP / WebSocket
                                          v
+-----------------------------------------------------------------------------------+
| PRESENTATION LAYER (Delivery)                                                     |
|                                                                                   |
|  [Middlewares]                [Controllers]                                      |
|  - Rate Limit & CORS          - Validação de Input (Zod Schemas)                 |
|  - Auth JWT & Security        - Mapeamento Request -> DTO                        |
|                               - Despacho -> Use Case                             |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | Invoca DTO de Entrada
                                          v
+-----------------------------------------------------------------------------------+
| APPLICATION LAYER (Orquestração de Casos de Uso)                                  |
|                                                                                   |
|  [Use Cases / Interactors]                                                        |
|  - Orquestra regras de fluxo (ex: CalculateIdleGains, UpgradeShip, BattleWave)     |
|  - Depende exclusivamente de abstrações (Interfaces/Ports)                       |
+-------------------+-------------------------------------+-------------------------+
                    |                                     |
                    | Executa operações                   | Acessa via Port
                    v                                     v
+---------------------------------------+   +---------------------------------------+
| DOMAIN LAYER (Core Puro do Jogo)      |   | INFRASTRUCTURE LAYER (Adapters)       |
|                                       |   |                                       |
| - Entidades puras (Player, Ship, Wave)|   | - Repositórios Concretos (DB/ORM)     |
| - Value Objects (Currency, Stats)     |   | - Drivers de Cache (Redis)            |
| - Domain Services & Formulas de Idle  |   | - Provedores HTTP / External APIs     |
| - Interfaces de Repositório (Ports)   |   | - Migrations & Configurações de DB    |
| - Erros de Domínio Especializados     |   |                                       |
| * ZERO DEPENDÊNCIAS EXTERNAS          |   | * Implementa Interfaces do Domain     |
+---------------------------------------+   +---------------------------------------+
```

---

## 2. REGRAS DE FRONTEIRA E DEPENDÊNCIA (DEPENDENCY RULE)

```
[ Presentation ] ---> [ Application ] ---> [ Domain ]
        |                      |                 ^
        |                      |                 |
        +----------------------+                 |
                   |                             |
                   +------ [ Infrastructure ]----+
```

### Matriz de Permissão de Importações:

| Camada Origem | Pode Importar De | É Terminantemente Proibido Importar De |
| :--- | :--- | :--- |
| **Domain** | *(Nenhuma camada interna)*, `shared/types` puros | `Application`, `Infrastructure`, `Presentation`, frameworks, ORMs, bibliotecas de UI |
| **Application** | `Domain`, `shared/` | `Infrastructure` (implementações concretas), `Presentation`, frameworks web/UI |
| **Infrastructure** | `Domain` (interfaces), `Application` (interfaces/DTOs), `shared/` | `Presentation`, chamadas diretas de Controllers |
| **Presentation** | `Application` (Use Cases e DTOs), `shared/` | `Infrastructure` (direto sem passar por Use Case), entidades internas de DB |
| **Shared** | *(Apenas libs de validação utilitárias puras)* | Qualquer camada de aplicação, infraestrutura ou apresentação |

---

## 3. DIVISÃO MACRO DE DIRETÓRIOS

```
galagaidle/
├── .agent/
│   └── skills/
│       └── dep-guard/
│           └── SKILL.md               # Skill nativa do Antigravity para upgrade seguro de dependências
├── .cursor/
│   └── rules/
│       ├── core-governance.mdc        # Regras de governança no formato Cursor MDC
│       └── dep-guard.mdc              # Regra espelho do Cursor para upgrade seguro de dependências
├── .cursorrules                       # Regras universais compartilhadas (Cursor + Antigravity)
├── .gitignore                         # Higiene de repositório e prevenção de vazamentos (DLP)
├── AGENTS.md                          # Regras nativas de workspace para Antigravity
├── STRUCTURE.md                       # Este arquivo (Mapa Vivo da Arquitetura)
├── README.md                          # Documentação técnica e executiva do projeto
├── .env.example                       # Modelo de variáveis de ambiente com validação
│
├── frontend/                          # Aplicação Client (Interface do Usuário / Game Loop)
│   ├── src/
│   │   ├── core/                      # Regras de domínio do cliente (cálculos locais, entidades puras)
│   │   ├── presentation/
│   │   │   ├── views/                 # Componentes visuais declarativos puros (React/Canvas/UI)
│   │   │   └── controllers/           # Hooks, Stores de estado (Zustand) e ViewModels
│   │   ├── shared/                    # Formatadores de números idle, constantes de UI, helpers
│   │   └── assets/                    # Sprites, texturas, efeitos sonoros e fontes
│   └── tests/                         # Testes unitários e visuais do frontend
│
├── backend/                           # Aplicação Server (Autoritativo, Persistência, APIs)
│   ├── src/
│   │   ├── domain/                    # Entidades puras, Value Objects, interfaces de repositório
│   │   ├── application/
│   │   │   └── use-cases/             # Casos de uso e DTOs de entrada e saída
│   │   ├── infrastructure/
│   │   │   ├── database/              # Conexões, migrations, modelos e repositórios concretos
│   │   │   └── http/                  # Servidor HTTP, clientes externos, adaptadores
│   │   └── presentation/
│   │       ├── controllers/           # Controllers enxutos de API/WebSocket
│   │       └── middlewares/           # Autenticação, schemas Zod, CORS e rate limiting
│   └── tests/                         # Testes unitários, de integração e segurança
│
├── shared/                            # Contratos e tipos universais compartilhados
│   ├── contracts/                     # Schemas de validação de API compartilhados (Zod)
│   ├── types/                         # Interfaces TypeScript e DTOs compartilhados
│   └── constants/                     # Constantes de balanceamento e enumerações
│
├── docs/                              # Documentações de arquitetura, Game Design e DevSecOps
│   ├── architecture/                  # RFCs e decisões de arquitetura (ADRs)
│   └── security/                      # Relatórios de auditoria e threat modeling
│
└── scripts/                           # Automações de build, migrações, lint e auditoria DevSecOps
```

---

## 4. REGISTRO DE MÓDULOS E ARQUIVOS ATIVOS

> **NOTA AOS AGENTES:** Mantenha esta tabela 100% atualizada a cada criação de arquivo.

| Caminho do Arquivo | Camada / Módulo | Responsabilidade Exata | Status |
| :--- | :--- | :--- | :--- |
| `.cursorrules` | Governança | Regras universais de engenharia, arquitetura e segurança | Ativo |
| `.cursor/rules/core-governance.mdc` | Governança | Espelho estruturado das regras de governança para o Cursor | Ativo |
| `.cursor/rules/dep-guard.mdc` | Governança / Cursor | Espelho da skill dep-guard para o ecossistema Cursor Pro | Ativo |
| `.agent/skills/dep-guard/SKILL.md` | Skill / Antigravity | Protocolo interativo de 3 etapas para upgrade seguro de dependências | Ativo |
| `.gitignore` | Segurança / DLP | Política de higiene de repositório e prevenção de vazamento de segredos | Ativo |
| `AGENTS.md` | Governança | Diretrizes de contexto nativas para o Antigravity | Ativo |
| `STRUCTURE.md` | Governança | Mapa arquitetural vivo, regras de fronteira e registro de arquivos | Ativo |
| `README.md` | Documentação | Documentação executiva, manual de instalação e guia de desenvolvimento | Ativo |
| `.env.example` | Infraestrutura / Config | Template de variáveis de ambiente com documentação de segurança | Ativo |

---

## 5. CHECKLIST DE CONFORMIDADE PARA O PRÓXIMO ARQUIVO

Antes de salvar qualquer novo arquivo, execute este checklist mental:
- [ ] O arquivo está na pasta correta de sua camada?
- [ ] As importações respeitam a Matriz de Permissão da Dependency Rule?
- [ ] Todas as tipagens estão explícitas (Zero `any`)?
- [ ] O código possui tratamento de erro adequado e guard clauses?
- [ ] Entradas externas são validadas por schema (Zod)?
- [ ] Este arquivo foi registrado na Seção 4 deste documento?
- [ ] Novas variáveis de ambiente estão documentadas em `.env.example` (com valores seguros)?
- [ ] Novos artefatos, SDKs, caches, bancos locais ou arquivos sensíveis estão cobertos no `.gitignore`?
- [ ] O arquivo respeita o **File Size Cap** (máx. 250–300 linhas, sweet spot 100–250 linhas, responsabilidade única sem monolitos)?
- [ ] O código evita dependências circulares e desacopla via Inversão de Dependência (Interfaces/Ports)?
- [ ] Zero Magic Numbers/Strings (valores literais extraídos para constantes/enums)?
- [ ] O código prioriza imutabilidade e erros contextualmente rastreáveis (`[Contexto] Mensagem`)?
- [ ] O código evita cadeias de `if/else`/`switch` longos (adota Lookup Tables, Strategy $O(1)$, Generics)?
- [ ] A complexidade ciclomática é baixa (máx. 2 níveis de indentação, pipelines declarativos/funcionais, `Set`/`Map`)?
