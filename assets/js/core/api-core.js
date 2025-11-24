/******************************************************
 * PRONTIO – api-core.js
 * Camada base de comunicação com o backend (Code.gs)
 *
 * - Define:
 *   - window.callApi
 *   - PRONTIO.API.call
 *
 * - NÃO altera o formato do body:
 *   O body vai exatamente como o seu api.js monta:
 *   { action: "pacientes-listar", filtros: { ... } }
 *
 * - Compatível com o Code.gs atual:
 *   doPost(e) espera body.action + demais campos no root.
 ******************************************************/

// Garante namespace global
window.PRONTIO = window.PRONTIO || {};
PRONTIO.API = PRONTIO.API || {};

// ⚠️ COLE AQUI a URL da sua Web App do Apps Script
// (Apps Script → Implantar → Nova implantação → Web app → copiar URL)
const PRONTIO_API_URL = "https://script.google.com/macros/s/SEU_ANTIGO_ID/exec";

/**
 * Função base para chamar o backend (Code.gs)
 * body: objeto contendo pelo menos { action: "..." }
 *       + demais campos (filtros, dados, idPaciente, etc.)
 *
 * Exemplo:
 * callApi({ action: "pacientes-listar", filtros: { nome: "João" } })
 */
async function callApi(body = {}) {
  if (!PRONTIO_API_URL || PRONTIO_API_URL === "COLE_AQUI_A_URL_DA_SUA_WEB_APP") {
    throw new Error("PRONTIO_API_URL não foi configurada em assets/js/core/api-core.js");
  }

  if (!body.action) {
    throw new Error("Parâmetro 'action' é obrigatório em callApi(body).");
  }

  const response = await fetch(PRONTIO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Erro HTTP ao chamar backend PRONTIO (status ${response.status}). Resposta: ${text}`
    );
  }

  const json = await response.json();

  // Code.gs retorna algo como:
  // { ok: true/false, action, data, ... }
  if (json && json.ok === false) {
    console.warn("Backend PRONTIO retornou ok=false:", json.erro || json);
  }

  return json;
}

// Expõe para o restante do sistema
PRONTIO.API.call = callApi;
window.callApi = callApi;
