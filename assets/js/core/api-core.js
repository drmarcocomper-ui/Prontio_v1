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
 *
 * Observação:
 * - Tenta usar PRONTIO.Config.SCRIPT_URL (definido em script.js).
 *   Se não existir, usa o fallback com a URL fixa do Web App.
 ******************************************************/

// Garante namespace global
window.PRONTIO = window.PRONTIO || {};
PRONTIO.API = PRONTIO.API || {};

// URL base da Web App do Apps Script
// Implantação atual:
// AKfycbzmzr17gHbUz1V9Ekl8HSMPMV75q3bgKwafu6kosHsKSFP_MkglB6ewywT-FnpTRu4Qbw
const PRONTIO_API_URL =
  (window.PRONTIO &&
    PRONTIO.Config &&
    PRONTIO.Config.SCRIPT_URL) ||
  "https://script.google.com/macros/s/AKfycbzmzr17gHbUz1V9Ekl8HSMPMV75q3bgKwafu6kosHsKSFP_MkglB6ewywT-FnpTRu4Qbw/exec";

/**
 * Função base para chamar o backend (Code.gs)
 * body: objeto contendo pelo menos { action: "..." }
 *       + demais campos (filtros, dados, idPaciente, etc.)
 *
 * Exemplo:
 * callApi({ action: "pacientes-listar", filtros: { nome: "João" } })
 */
async function callApi(body = {}) {
  if (!PRONTIO_API_URL) {
    throw new Error(
      "PRONTIO_API_URL não foi configurada corretamente em assets/js/core/api-core.js"
    );
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
