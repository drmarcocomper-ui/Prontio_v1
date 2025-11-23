# Guia de Deploy – PRONTIO

Guia oficial de como publicar o PRONTIO em produção, conectando:

- Frontend (HTML/CSS/JS)  
- Backend (Google Apps Script + Google Sheets)  
- Domínio/Servidor (HostGator, Cloudflare, etc.)

---

## 🧩 Visão geral do fluxo

1. **Planilha Google Sheets** configurada com todas as abas.  
2. **Projeto Google Apps Script** ligado a essa planilha.  
3. Apps Script publicado como **Web App** → gera uma URL (`SCRIPT_URL`).  
4. `SCRIPT_URL` configurada no frontend (arquivo `script.js`).  
5. Arquivos HTML/CSS/JS publicados em um servidor (HostGator, etc.).  

Quando o usuário usa o PRONTIO:

- O navegador carrega os arquivos de `/views` + `/assets`.  
- O frontend chama `PRONTIO.API.call()` → que envia JSON ao Apps Script.  
- O Apps Script lê `action` e manipula a planilha.  

---

# 1. 📊 Configurando a Planilha no Google Sheets

### 1.1 Criar planilha PRONTIO

- Crie uma planilha no Google Sheets com nome, por exemplo: **PRONTIO - Produção**.

### 1.2 Abas recomendadas

As abas devem seguir exatamente os nomes esperados em `CONFIG` (no Code.gs):

```js
const CONFIG = {
  ABA_PACIENTES:       "Pacientes",
  ABA_PRONTUARIO:      "Prontuario",
  ABA_AGENDA:          "Agenda",
  ABA_RECEITAS:        "Receitas",
  ABA_EVOLUCAO:        "Consultas",
  ABA_EXAMES:          "Exames",
  ABA_LAUDOS:          "Laudos",
  ABA_ATESTADOS:       "Atestados",
  ABA_COMPARECIMENTO:  "Comparecimento",
  ABA_MEDICAMENTOS:    "Medicamentos",
  ABA_SADT:            "SADT",
  ABA_CONSENTIMENTO:   "Consentimento"
};
