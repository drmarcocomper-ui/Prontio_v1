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
 * URL da implantação atual:
 * https://script.google.com/macros/s/AKfycbyFYoD5GBRF0yiVSTuez93YniNXG-ONOWQQuAxjjbOoPbzDugDPjHAGfmL8x7zuUSLirA/exec
 *
 * Se publicar outra versão, é só trocar aqui.
 */
const API_URL = "https://script.google.com/macros/s/AKfycbzFinGtszWRvpaWaBL2hdEgxGinBjq65AhsKVubK-R1K8-ax1DqE1aU13TUsQyY_Rma/exec";

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

  // Log leve de debug
  if (payload.action) {
    console.log("PRONTIO :: calling API action =", payload.action);
  }

  let resp;
  try {
    resp = await fetch(API_URL, {
      method: "POST",
      // Usamos text/plain para evitar preflight CORS no Apps Script
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("PRONTIO :: erro de rede ao chamar API", err);
    throw new Error("Não foi possível conectar à API do PRONTIO. Verifique sua conexão ou a URL da WebApp.");
  }

  if (!resp.ok) {
    console.error("PRONTIO :: HTTP error", resp.status, resp.statusText);
    throw new Error("Falha HTTP ao chamar API: " + resp.status + " " + resp.statusText);
  }

  let json;
  try {
    json = await resp.json();
  } catch (err) {
    console.error("PRONTIO :: erro ao interpretar JSON da API", err);
    throw new Error("Resposta inválida da API do PRONTIO (não é JSON).");
  }

  if (!json.ok) {
    // backend responde { ok:false, erro:"mensagem" } em caso de erro
    const msg = json.erro || "Erro desconhecido na API do PRONTIO.";
    console.error("PRONTIO :: erro de aplicação na API", msg, json);
    throw new Error(msg);
  }

  return json;
}

// Exporta para o mundo todo
window.callApi = callApi;
PRONTIO.API.call = callApi;
