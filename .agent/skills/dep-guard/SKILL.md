---
name: dep-guard
description: Gerenciamento de dependências e APIs modernas/instáveis com fluxo obrigatório em 3 etapas (Alerta, Impacto e Decisão) e trava anti-quebra (Zero-Breakage).
globs: ["package.json", "pubspec.yaml", "requirements.txt", "pyproject.toml", "Cargo.toml", "go.mod"]
alwaysApply: false
---

# SKILL: DEPENDENCY GUARD & ZERO-BREAKAGE UPGRADE (DEP-GUARD)

## OBJETIVO & DIRETRIZES TÉCNICAS
Garantir que a aplicação utilize APIs, bibliotecas e sintaxes modernas (evitando métodos obsoletos ou legados), isolando dependências externas críticas em Adapters/Wrappers na camada de `infrastructure/`. 

## ⚠️ PROTOCOLO DE EXECUÇÃO: TRAVA ANTI-TURBO OBRIGATÓRIA
- Esta Skill PROÍBE a execução em Modo Turbo (Auto-Run / Yolo Mode).
- O agente NUNCA deve executar comandos de terminal de atualização de pacotes (ex: `npm update`, `npm i`, `flutter pub upgrade`, `pip install -U`) ou alterar contratos de dependências de forma autônoma sem aguardar autorização humana explícita no chat em cada etapa.

---

## 🛠️ CATÁLOGO DE COMANDOS DA SKILL

| Comando | Descrição | Comportamento / Escopo |
| :--- | :--- | :--- |
| `/check-deps [pacote]` | Varredura pontual de dependência | Executa a máquina de estados em 3 etapas para uma lib específica |
| `/dep-plan` (ou `/audit-deps`) | **Varredura global e plano de ação** | Analisa todos os manifestos, detecta dependências defasadas e gera um Plano de Atualização Estruturado por pacote |

---

## MÁQUINA DE ESTADOS DO FLUXO INTERATIVO (3 ETAPAS OBRIGATÓRIAS)

### 🛑 ETAPA 1: DETECÇÃO E ALERTA (PAUSA 1)
Ao detectar que uma biblioteca possui versão mais recente, que uma API externa mudou, ou ao receber o gatilho `/check-deps`, o agente NÃO altera nenhum arquivo e emite exatamente este alerta:
> **[Update Detectado]:** A biblioteca/API `[Nome da Lib]` possui uma versão/sintaxe mais recente (`[Versão Atual]` ➔ `[Nova Versão]`). Deseja que eu faça uma varredura no código para verificar se essa atualização causará quebras (*Breaking Changes*)?

👉 **AÇÃO DO AGENTE:** Parar imediatamente a resposta e aguardar o usuário responder.

---

### 🔍 ETAPA 2: VARREDURA DE IMPACTO E RELATÓRIO (PAUSA 2)
Se o usuário responder autorizando a verificação ("Sim", "Ok", "Verifique", etc.), o agente lê a árvore de arquivos e emite um relatório técnico conciso sem modificar o código ainda:
1. **Módulos & Arquivos Afetados:** Lista dos arquivos e linhas exatas que consomem a dependência.
2. **Mudanças Críticas (Breaking Changes):** Alterações de assinatura de métodos, tipos, retornos, comportamentos obsoletos ou configurações exigidas pela nova versão.
3. **Estratégia de Adaptação / Isolamento:** Indicação de qual Adapter ou Wrapper na camada de `infrastructure/` absorverá a mudança para proteger `Domain` e `Application`.
4. **Classificação de Risco:** Risco Baixo, Médio ou Alto de quebra ou regressão.

Ao final do relatório, o agente emite a seguinte pergunta:
> **[Decisão de Atualização]:** Deseja prosseguir com a atualização do pacote e a refatoração do Adapter com garantia de Zero-Breakage?

👉 **AÇÃO DO AGENTE:** Parar imediatamente a resposta e aguardar a decisão explícita do usuário.

---

### 🚀 ETAPA 3: EXECUÇÃO CONTROLADA OU ABORTO (ZERO-BREAKAGE)
- Se o usuário rejeitar ("Não", "Abortar"): O agente cancela a operação imediatamente sem tocar em nenhum arquivo.
- Somente se autorizado ("Sim", "Aplicar", "Pode atualizar"):
  1. **Atualização Segura de Manifesto:** Atualizar a versão no manifesto (`package.json`, etc.).
  2. **Implementação de Adapter/Wrapper:** Confinar as mudanças na camada de `infrastructure/`, preservando integralmente os contratos e interfaces de `domain/` e `application/` e respeitando estritamente o limite de 250–300 linhas por arquivo.
  3. **Verificação de Compilação & Testes:** Rodar validação estrita de tipos (`tsc --noEmit`) e testes unitários para garantir zero regressão.
  4. **Sincronia de Governança (DLP & STRUCTURE.md):**
     - Verificar se novos caches ou artefatos gerados foram incluídos no `.gitignore`.
     - Se novos adapters/arquivos foram criados, registrá-los imediatamente no `STRUCTURE.md`.

---

## 📋 PROTOCOLO DO COMANDO `/dep-plan` (PLANO DE ATUALIZAÇÃO GLOBAL)

Ao receber o comando `/dep-plan` ou `/audit-deps`, o agente executa este fluxo:
1. **Inspeção de Manifestos:** Lê os arquivos de dependências (`package.json`, etc.) e consulta o estado das versões atuais versus versões mais recentes (ex: via leitura ou `npm outdated --json` em modo somente-leitura).
2. **Emissão do Plano Estruturado por Dependência:**
   - **Tabela de Visão Geral:** Pacote, Versão Instalada, Versão Alvo, Tipo (`Patch`, `Minor`, `Major`) e Nível de Risco.
   - **Ficha Técnica por Pacote Defasado:**
     - *Identificação:* Nome e versão recomendada
     - *Localização do Consumo:* Camada arquitetural afetada
     - *Mudanças Críticas:* Breaking changes ou migrações necessárias
     - *Adapter Protetor:* Arquivo em `infrastructure/` que isolará a dependência
     - *Passos de Execução:* Sequência granular para migração segura
   - **Roteiro em Fases:** Divisão em fases priorizadas (Fase 1: Patches sem risco ➔ Fase 2: Minors com retrocompatibilidade ➔ Fase 3: Majors de alto impacto isolados).
3. **Pausa Obrigatória:** O agente encerra o plano **sem alterar nenhum arquivo** e pergunta ao usuário por qual pacote ou fase ele deseja iniciar.
