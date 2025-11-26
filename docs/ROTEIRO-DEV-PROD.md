# PRONTIO – Ambientes DEV (teste) e PROD (real)

Objetivo:  
Ter um ambiente de **teste seguro (DEV)** e um ambiente **real (PROD)**,
cada um com:

- sua própria planilha
- seu próprio Apps Script (Web App)
- sua própria URL de API

E no frontend (VSCode) você escolhe em qual está mexendo.

---

## 1. Criar as planilhas

### 1.1. Planilha PROD (real)

Se você já tem uma planilha que é a “oficial”, considere:

- Nome: `PRONTIO_PROD`

Se ainda não tiver:

1. Vá no Google Drive
2. `Novo → Planilhas Google`
3. Nomeie de `PRONTIO_PROD`
4. Crie as abas/colunas que for usar normalmente

> Esta é a planilha **REAL**, que você NÃO quer estragar durante os testes.

---

### 1.2. Planilha DEV (teste)

Agora vamos fazer uma cópia para teste:

1. No Google Drive, clique com o botão direito na `PRONTIO_PROD`
2. `Fazer uma cópia`
3. Renomeie para: `PRONTIO_DEV`

Resultado:

- `PRONTIO_PROD` → produção
- `PRONTIO_DEV` → ambiente de teste (pode bagunçar aqui à vontade)

As duas têm a mesma estrutura de abas/colunas.

---

## 2. Criar os Apps Scripts (Web Apps)

Você terá **dois Apps Script**:

- um ligado na `PRONTIO_DEV` → gera `URL_DEV`
- outro ligado na `PRONTIO_PROD` → gera `URL_PROD`

---

### 2.1. Apps Script DEV (teste)

1. Abra a planilha `PRONTIO_DEV`
2. Menu `Extensões → Apps Script`
3. Vai abrir um projeto de Apps Script **vinculado a essa planilha**
4. Se já tem código (via clasp ou colado), beleza; senão, cole o código do backend PRONTIO
5. No Apps Script, vá em:
   - `Implantar → Nova implantação`
   - Tipo: `Aplicativo da Web`
   - Executar como: `Você (usuário que está implantando)`
   - Quem pode acessar: `Qualquer pessoa`
   - Confirmar

6. O Apps Script vai mostrar uma URL assim: