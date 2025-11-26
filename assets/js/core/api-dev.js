// assets/js/core/api-dev.js
// Versão mínima, garantida, da função callApi para o ambiente DEV.

// 🔧 TROQUE ESTA CONSTANTE PELA URL DO WEB APP DEV (Apps Script)
const API_BASE_URL = "https://SUA_URL_WEB_APP_DEV_AQUI/exec";

/**
 * Função global para chamar a API do backend DEV.
 *
 * Uso: window.callApi({ action: "Pacientes.Criar", payload: { ... } })
 *
 * Sempre retorna uma Promise com o JSON:
 *   { success: boolean, data: any, errors: string[] }
 */
window.callApi = async function ({ action, payload = {} }) {
  if (!API_BASE_URL || API_BASE_URL.includes("SUA_URL_WEB_APP_DEV_AQUI")) {
    console.warn("⚠️ API_BASE_URL não configurada em api-dev.js");
  }

  const body = { action, payload };

  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Erro HTTP ${response.status}: ${text}`);
  }

  const json = await response.json();
  return json;
};
