# Galaga Idle

[![Clean Architecture](https://img.shields.io/badge/Architecture-Clean%20Arch%20%2B%20MVC-blue.svg)](STRUCTURE.md)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205.x%20Strict-blue.svg)](https://www.typescriptlang.org/)
[![Security](https://img.shields.io/badge/Security-Zero%20Trust%20%2F%20OWASP-green.svg)](docs/security/)
[![AI Governance](https://img.shields.io/badge/AI%20Sync-Antigravity%20%2B%20Cursor-orange.svg)](.cursorrules)

**Galaga Idle** é um jogo incremental e tático de defesa espacial no modelo *idle/clicker*, com mecânicas progressivas inspiradas no clássico arcade Galaga. O projeto foi projetado desde o primeiro dia com princípios estritos de **Clean Architecture**, **Padrão MVC Desacoplado** e **Engenharia de Segurança (DevSecOps)**, suportando concorrência de múltiplos agentes de IA e desenvolvedores humanos em sincronia contínua.

---

## 1. Arquitetura do Sistema

O projeto adota uma arquitetura híbrida de alto desacoplamento:

```
[ Frontend: Views + Controllers/Stores ]
                   |  (HTTP/WebSocket)
                   v
[ Backend: Presentation (Thin Controllers & Middlewares) ]
                   |
                   v
[ Backend: Application (Use Cases & DTOs) ]
        |                            |
        v                            v
[ Domain (Pure Core Entities) ] <--- [ Infrastructure (DB/Cache/HTTP) ]
```

- **Domain Layer:** Regras matemáticas puras do idle, fórmulas de combate, entidades de nave/ondas, value objects e interfaces de repositórios. **Zero dependências de frameworks ou I/O**.
- **Application Layer:** Use cases de negócio (ex: cálculo de rendimentos offline, upgrades, validação anti-cheat de ondas, autenticação).
- **Infrastructure Layer:** Adaptadores de banco de dados (PostgreSQL/ORM), cache de sessão e rate limiting (Redis), clientes HTTP e adaptadores de sistema.
- **Presentation Layer (MVC):** 
  - *Backend:* Controllers finos focados apenas em validação de schema (Zod), invocação de Use Cases e mapeamento de respostas HTTP.
  - *Frontend:* Separação estrita entre componentes visuais declarativos (`views/`), gerenciamento de estado reativo (`controllers/` com Zustand) e serviços de comunicação.

Para entender a árvore completa de diretórios e as regras de dependência, consulte o [STRUCTURE.md](STRUCTURE.md).

---

## 2. Pré-requisitos

Certifique-se de ter os seguintes componentes instalados no seu ambiente de desenvolvimento:

- **Node.js:** Versão `>= 20.x LTS`
- **Gerenciador de Pacotes:** `npm` `>= 10.x` ou `pnpm` `>= 9.x`
- **Docker & Docker Compose:** Recomendado para execução local do PostgreSQL e Redis
- **Git:** Para controle de versão e auditoria de commits

---

## 3. Guia de Instalação Passo a Passo

### Passo 1: Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/galagaidle.git
cd galagaidle
```

### Passo 2: Configurar Variáveis de Ambiente
Copie o template de ambiente e configure seus parâmetros locais:
```bash
cp .env.example .env
```

> **Aviso de Segurança:** Nunca utilize senhas ou segredos padrão de desenvolvimento em ambientes de homologação ou produção.

### Passo 3: Inicializar Serviços de Infraestrutura (Opcional via Docker)
Caso deseje subir o banco de dados e o cache localmente via Docker:
```bash
docker compose up -d
```

### Passo 4: Instalar Dependências
```bash
# Na raiz do monorepo / projeto
npm install
```

### Passo 5: Executar Migrações do Banco de Dados
```bash
npm run db:migrate
```

### Passo 6: Iniciar o Ambiente de Desenvolvimento
```bash
npm run dev
```
O servidor backend estará disponível em `http://localhost:3333` e o frontend em `http://localhost:5173`.

---

## 4. Configuração de Variáveis de Ambiente (`.env`)

A aplicação utiliza validação com **Fail-Fast** na inicialização: caso qualquer variável crítica esteja ausente ou fora do padrão esperado, o processo é encerrado imediatamente.

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `NODE_ENV` | Ambiente de execução | `development` \| `production` |
| `PORT` | Porta HTTP do backend | `3333` |
| `CORS_ORIGIN` | Origem autorizada no CORS | `http://localhost:5173` |
| `DATABASE_URL` | String de conexão PostgreSQL | `postgresql://user:pass@localhost:5432/galaga_idle_db` |
| `REDIS_URL` | URL de conexão Redis (Cache/Rate Limit) | `redis://localhost:6379` |
| `JWT_SECRET` | Chave simétrica para assinatura de tokens (mín. 32 chars) | `openssl rand -base64 64` |
| `MAX_OFFLINE_IDLE_HOURS` | Teto máximo de horas contabilizadas em cálculo offline | `24` |
| `ANTI_CHEAT_MAX_DRIFT_SECONDS` | Tolerância máxima de desvio de timestamp de cliente | `5` |

Consulte o arquivo [.env.example](.env.example) para a lista completa e comentada.

---

## 5. Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia backend e frontend em modo de desenvolvimento com hot-reload |
| `npm run build` | Compila os pacotes TypeScript executando checagem estrita de tipos |
| `npm run test` | Executa a suite de testes unitários com Jest / Vitest |
| `npm run test:coverage` | Gera relatório de cobertura de código (mínimo exigido: 80% em Domain e Application) |
| `npm run lint` | Valida formatação e conformidade de regras ESLint/Prettier |
| `npm run typecheck` | Executa o compilador TypeScript (`tsc --noEmit`) sem tolerância a erros |
| `npm run security:audit` | Executa `npm audit` e scanners de dependências em busca de vulnerabilidades conhecidas |

---

## 6. Fluxo de Trabalho Híbrido (Antigravity + Cursor Pro + Humano)

Este repositório foi projetado para operar com **Vibecoding Estruturado** e auditoria humana rigorosa. Para garantir consistência contínua entre múltiplos agentes de IA e o desenvolvedor:

```
                   +----------------------------------+
                   |   ARQUITETO / AUDITOR HUMANO     |
                   |   (Define escopo e valida PRs)   |
                   +----------------+-----------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
            v                                               v
+------------------------+                     +------------------------+
|   GOOGLE ANTIGRAVITY   |                     |       CURSOR PRO       |
|  (Gemini 3.8 Flash)    |                     |     (Claude / Grok)    |
| - Engenharia de Core   | <=== STRUCTURE.md ===> - Refatoração local   |
| - Infraestrutura & CI  | <===  .cursorrules  ==> - Pair programming   |
| - Modelagem de Domínio |                     | - Debugging de tela    |
+------------------------+                     +------------------------+
```

### Regras do Protocolo Híbrido:
1. **Fonte Única da Verdade (SSOT):** Os arquivos [.cursorrules](.cursorrules) e [.cursor/rules/core-governance.mdc](.cursor/rules/core-governance.mdc) contêm as diretrizes obrigatórias de engenharia compartilhadas por Antigravity e Cursor.
2. **Mapa Vivo da Arquitetura:** O arquivo [STRUCTURE.md](STRUCTURE.md) é consultado obrigatoriamente antes de qualquer intervenção e atualizado de forma atômica após qualquer criação ou exclusão de arquivo.
3. **Zero Placeholder Policy:** Nenhum agente tem autorização para emitir código incompleto (`// TODO`, `// resto aqui`).
4. **Zero-Any Policy:** Todo código gerado deve ser estritamente tipado em TypeScript.

---

## 7. Checklist de Segurança para Deploy (DevSecOps / OWASP)

Antes de promover qualquer versão para ambiente de produção, certifique-se de atender a todos os itens abaixo:

- [ ] **Auditoria de Dependências:** `npm run security:audit` executado sem alertas críticos ou altos.
- [ ] **Variáveis de Ambiente:** Todos os secrets em produção são gerados aleatoriamente com alta entropia e injetados via Secrets Manager seguro (não versionados).
- [ ] **Proteção de Dados & PII:** Nenhum log contém senhas, tokens de autenticação ou dados sensíveis de usuários.
- [ ] **CORS Restritivo:** `CORS_ORIGIN` configurado apenas com o domínio oficial da aplicação em produção.
- [ ] **Rate Limiting Ativo:** Endpoints públicos de login, registro e reivindicação de recompensas protegidos contra força bruta e DoS.
- [ ] **Anti-IDOR / BOLA:** Todos os endpoints que manipulam recursos do jogador validam se o `playerId` do token JWT coincide com o proprietário do recurso.
- [ ] **Headers de Segurança:** `Helmet` ativo com CSP (`Content-Security-Policy`), `HSTS`, `X-Frame-Options: DENY` e `X-Content-Type-Options: nosniff`.
- [ ] **Anti-Cheat Server-Authoritative:** Cálculos de progresso idle, dano de tiro e recompensas de ondas são calculados e validados no backend, tratando o frontend como cliente não confiável.
