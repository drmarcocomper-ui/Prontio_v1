/******************************************************
 * PRONTIO – api-core.js
 * Camada base de comunicação com o backend (Apps Script)
 *
 * Responsável por:
 *  - Definir a URL da WebApp do Apps Script (API_URL)
 *  - Implementar window.callApi(body)
 *  - Expor PRONTIO.API.call(body)
 ******************************************************/

window.PRONTIO = window.PRONTIO || {};
PRONTIO.API = PRONTIO.API || {};

/**
 * ⚠️ URL DA WEBAPP (Apps Script)
 *
 * Você me informou esta URL:
 * https://script.google.com/macros/s/AKfycbzmzr17gHbUz1V9Ekl8HSMPMV75q3bgKwafu6kosHsKSFP_MkglB6ewywT-FnpTRu4Qbw/exec
 *
 * Se algum dia publicar outra versão, é só trocar aqui.
 */
const API_URL = "https://script.google.com/macros/s/AKfycbzmzr17gHbUz1V9Ekl8HSMPMV75q3bgKwafu6kosHsKSFP_MkglB6ewywT-FnpTRu4Qbw/exec";

/**
 * Função genérica para chamar o backend PRONTIO.
 *
 * Espera receber um objeto do tipo:
 *  { action: "pacientes-salvar", ...outrosCampos }
 *
 * e retorna o JSON completo que o Apps Script mandar:
 *  { ok: true, action: "pacientes-salvar", data: {...}, ... }
 */
async function callApi(body) {
  if (!API_URL) {
    throw new Error("API_URL não configurada em api-core.js");
  }

  const payload = body || {};

  // Opcional: log leve de debug (pode comentar depois se quiser)
  if (payload.action) {
    console.log("PRONTIO :: calling API action =", payload.action);
  }

  const resp = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    throw new Error("Falha HTTP ao chamar API: " + resp.status + " " + resp.statusText);
  }

  const json = await resp.json();

  if (!json.ok) {
    // backend sempre responde { ok:false, erro:"mensagem" } em caso de erro
    throw new Error(json.erro || "Erro desconhecido na API do PRONTIO.");
  }

  return json;
}

// Exporta para o mundo todo
window.callApi = callApi;
PRONTIO.API.call = callApi;
