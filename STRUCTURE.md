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
                      |   (Mobile App: Expo / React Native)   |
                      +-------------------+-------------------+
                                          |
                                          | HTTP / WebSocket
                                          v
+-----------------------------------------------------------------------------------+
| PRESENTATION LAYER (Delivery)                                                     |
|                                                                                   |
|  [Mobile Views (Skia 2D Canvas)]     [Controllers / ViewModels]                  |
|  - HUD Galaga, Upgrades, Stars       - Thin Controllers & Stores (Zustand)       |
|  - Game Loop UI Hooks                - Validação de Input (Zod Schemas)          |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | Invoca DTOs de Entrada
                                          v
+-----------------------------------------------------------------------------------+
| APPLICATION LAYER (Orquestração de Casos de Uso & Loops de Jogo)                 |
|                                                                                   |
|  [Tick Engine & Game Loop]           [Use Cases / Interactors]                    |
|  - Fast Loop (60 FPS combate)        - CalculateOfflineGains, UpgradeShip         |
|  - Slow Loop (1 Hz idle/timers)      - ProcessPrestigeReset, AutoPlayOrchestrator |
|  * Depende exclusivamente de abstrações do Domain (Interfaces/Ports)             |
+-------------------+-------------------------------------+-------------------------+
                    |                                     |
                    | Executa operações                   | Acessa via Port
                    v                                     v
+---------------------------------------+   +---------------------------------------+
| DOMAIN LAYER (Core Puro do Jogo)      |   | INFRASTRUCTURE LAYER (Adapters)       |
|                                       |   |                                       |
| - Math (BigNum Value Object, Formats) |   | - Repositórios Concretos (DB/ORM)     |
| - Economy (Wallet, Multi-Currencies)  |   | - Drivers de Cache (Redis)            |
| - Combat (Ship, Weapons, Bosses, Wave)|   | - Storage Local (MMKV / AsyncStorage) |
| - Prestige (Layers 1, 2 e 3 CIFI)     |   | - Provedores HTTP / External APIs     |
| - Interfaces de Repositório (Ports)   |   | - Sound Adapters & Haptic Engine      |
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
| **Domain** | *(Nenhuma camada interna)*, tipos primitivos | `Application`, `Infrastructure`, `Presentation`, frameworks, ORMs, bibliotecas de UI |
| **Application** | `Domain` | `Infrastructure` (implementações concretas), `Presentation`, frameworks web/UI |
| **Infrastructure** | `Domain` (interfaces/ports), `Application` (interfaces/DTOs) | `Presentation`, chamadas diretas de Controllers |
| **Presentation** | `Application` (Use Cases, Tick Engine, DTOs), `Domain` (Value Objects para exibição) | `Infrastructure` (direto sem passar por Use Case/Port) |

---

## 3. MAPA DAS 10 FASES DO PROJETO GALAGA IDLE + CIFI

Abaixo está o roteiro arquitetural mapeando as camadas em todas as 10 fases:

| Fase | Título da Fase | Domain | Application | Infrastructure | Presentation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Fase 1** *(Atual)* | **Core Engine, BigNum & Motor de Tempo** | `domain/math/` (BigNum, Formatter), `domain/economy/` (Wallet, Currencies) | `application/loop/` (Tick duplo 60Hz/1Hz, Offline Calculator) | Repositório de tempo e storage port | Hooks de loop e formatadores de HUD |
| **Fase 2** | **Entidades de Combate & Naves** | `domain/combat/` (PlayerShip, Lasers, Dano, HP, Escudo, Stats) | `application/use-cases/combat/` (FireLaser, TakeDamage, UpgradeShipStats) | Engine de colisão matemática 2D | Visualizador da nave e barras de vida |
| **Fase 3** | **Ondas Inimigas & Formações Galaga** | `domain/enemies/` (Enemy, Bosses, Trajetórias, Wave Scaling) | `application/use-cases/wave/` (SpawnWave, AdvanceWave, WaveDefeatCheck) | Generative Wave Spawner Adapter | Renderização de formações em enxame |
| **Fase 4** | **Árvore de Upgrades & Progressão** | `domain/upgrades/` (UpgradeNode, TechTree, Multipliers, Custos) | `application/use-cases/upgrades/` (PurchaseUpgrade, RecalculateDPS) | Tabela de balanceamento JSON/DB | Menus tabulados de upgrades e árvore |
| **Fase 5** | **Prestígio Multi-Camadas (Layers 1, 2 e 3)** | `domain/prestige/` (Antimatter, Quantum Cores, Cosmic Shards) | `application/use-cases/prestige/` (ExecutePrestigeReset, CalculatePrestigeReward) | Persistência de marcos de prestígio | Telas de colapso quântico e reset |
| **Fase 6** | **Módulos Táticos & Piloto Automático** | `domain/ai/` (AutoPlayTactics, TargetingStrategy, FuelBank) | `application/use-cases/autoplay/` (ConsumeAutoPlayTick, SwitchTactic) | Storage de sessão do piloto automático | Toggle de piloto automático e telemetria |
| **Fase 7** | **Persistência, Anti-Tamper & Sync** | `domain/save/` (SaveState, Checksum, SaveMetadata) | `application/use-cases/save/` (SerializeGame, LoadGame, ValidateAntiCheat) | MMKV / PostgreSQL / Criptografia AES | Indicador de save e cloud backup |
| **Fase 8** | **Conquistas, Missões & Recompensas** | `domain/missions/` (Achievement, DailyMission, Milestones) | `application/use-cases/missions/` (ClaimReward, TrackProgress) | Cache de progresso diário | Modal de conquistas e claims |
| **Fase 9** | **Interface Mobile Retro (Expo + Skia)** | `domain/render/` (Camera, Viewport, ParticleRules) | `application/use-cases/ui/` (UpdateCameraShake, EmitParticles) | Skia 2D Canvas, Expo Audio, Haptics | Telas do app, controles de toque |
| **Fase 10** | **DevSecOps, Anti-Cheat & Deploy** | `domain/security/` (IntegrityChecks, AntiDriftRules) | `application/use-cases/security/` (AuditGameState, VerifyReceipt) | Cloud Build EAS, Rate Limits, CI/CD | Painel de telemetria e build final |

---

## 4. REGISTRO DE MÓDULOS E ARQUIVOS ATIVOS

> **NOTA AOS AGENTES:** Mantenha esta tabela 100% atualizada a cada criação de arquivo.

| Caminho do Arquivo | Camada / Módulo | Responsabilidade Exata | Status |
| :--- | :--- | :--- | :--- |
| `.cursorrules` | Governança | Regras universais de engenharia, arquitetura e segurança | Ativo |
| `.cursor/rules/global-governance.mdc` | Governança | Espelho estruturado das regras globais de governança para o Cursor | Ativo |
| `.cursor/rules/dep-guard.mdc` | Governança / Cursor | Espelho da skill dep-guard para o ecossistema Cursor Pro | Ativo |
| `.agent/skills/dep-guard/SKILL.md` | Skill / Antigravity | Protocolo interativo de 3 etapas para upgrade seguro de dependências | Ativo |
| `.gitignore` | Segurança / DLP | Política de higiene de repositório e prevenção de vazamento de segredos | Ativo |
| `AGENTS.md` | Governança | Diretrizes de contexto nativas para o Antigravity | Ativo |
| `STRUCTURE.md` | Governança | Mapa arquitetural vivo, regras de fronteira e registro de arquivos | Ativo |
| `README.md` | Documentação | Documentação executiva, manual de instalação e guia de desenvolvimento | Ativo |
| `.env.example` | Infraestrutura / Config | Template de variáveis de ambiente com documentação de segurança | Ativo |
| `domain/math/math-types.ts` | Domain / Math | Tipos, contratos e opções de formatação para matemática incremental | Ativo (Fase 1) |
| `domain/math/bignum.ts` | Domain / Math | Value Object `BigNumber` exponencial puro com operações aritméticas | Ativo (Fase 1) |
| `domain/math/bignum-formatter.ts` | Domain / Math | Formatador $O(1)$ de notação legível (K, M, B, aa, ab, científica) | Ativo (Fase 1) |
| `domain/math/index.ts` | Domain / Math | Ponto de exportação barrel do módulo de matemática | Ativo (Fase 1) |
| `domain/economy/currency.ts` | Domain / Economy | Enumeração `CurrencyType`, metadados e Lookup Table de moedas | Ativo (Fase 1) |
| `domain/economy/wallet-errors.ts` | Domain / Economy | Erros de domínio tipados para operações financeiras inválidas | Ativo (Fase 1) |
| `domain/economy/wallet.ts` | Domain / Economy | Entidade imutável `Wallet` multi-moedas com validações de saldo | Ativo (Fase 1) |
| `domain/economy/index.ts` | Domain / Economy | Ponto de exportação barrel do módulo de economia | Ativo (Fase 1) |
| `application/loop/loop-types.ts` | Application / Loop | DTOs e tipos do motor de tick duplo e cálculo de tempo offline | Ativo (Fase 1) |
| `application/loop/tick-engine.ts` | Application / Loop | Motor de loop duplo desacoplado (60 FPS combate + 1 Hz idle) | Ativo (Fase 1) |
| `application/loop/offline-calculator.ts` | Application / Loop | Calculadora de ganhos acumulados offline e banco de Auto-Play | Ativo (Fase 1) |
| `application/loop/index.ts` | Application / Loop | Ponto de exportação barrel do módulo de loop e tempo | Ativo (Fase 1) |
| `tests/domain/math.test.ts` | Testes / Domain | Testes unitários do motor BigNumber e formatador de notações | Ativo (Fase 1) |
| `tests/domain/wallet.test.ts` | Testes / Domain | Testes unitários da Carteira, saldos, saques e prestígios | Ativo (Fase 1) |
| `tests/application/loop.test.ts` | Testes / Application | Testes unitários do TickEngine duplo e calculadora offline | Ativo (Fase 1) |

---

## 5. CHECKLIST DE CONFORMIDADE PARA O PRÓXIMO ARQUIVO

Antes de salvar qualquer novo arquivo, execute este checklist mental:
- [ ] O arquivo está na pasta correta de sua camada (`domain`, `application`, `infrastructure`, `presentation`)?
- [ ] As importações respeitam a Matriz de Permissão da Dependency Rule?
- [ ] Todas as tipagens estão explícitas (Zero `any`)?
- [ ] O código possui tratamento de erro adequado e guard clauses?
- [ ] Este arquivo foi registrado na Seção 4 deste documento?
- [ ] O arquivo respeita o **File Size Cap** (máx. 250–300 linhas, sweet spot 100–250 linhas)?
- [ ] Zero Magic Numbers/Strings (valores literais extraídos para constantes/enums)?
- [ ] O código evita cadeias de `if/else`/`switch` longos (adota Lookup Tables, Strategy $O(1)$, Generics)?
- [ ] A complexidade ciclomática é baixa (máx. 2 níveis de indentação)?
- [ ] O código respeita a **Regra 6 (Data-Driven & Open/Closed)**: zero hardcoding de listas de conteúdo (tudo em catálogos dinâmicos `*.config.ts` por ID)?
