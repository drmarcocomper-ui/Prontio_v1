// assets/js/core/api-dev.js
// Chamada à API DEV (Apps Script), evitando problema de CORS/preflight.

// URL do seu Web App DEV (Apps Script)
const API_BASE_URL =
  "https://script.google.com/macros/s/AKfycbyqoIJ10ufgRej2K1INGw-s7o_8xwYwj68pkwHPnkxMVNn4x0Fc7xQJK3pv-xyfUx6TBA/exec";

/**
 * Função global para chamar a API do backend DEV.
 *
 * Uso:
 *   window.callApi({ action: "Pacientes.Criar", payload: { ... } })
 *
 * Observação importante (CORS):
 *  - NÃO usamos "application/json" para evitar preflight bloqueado pelo CORS.
 *  - Usamos "text/plain;charset=utf-8" e mandamos JSON como string.
 *  - No Apps Script, continuamos lendo com JSON.parse(e.postData.contents).
 */
window.callApi = async function ({ action, payload = {} }) {
  if (!API_BASE_URL) {
    console.warn("⚠️ API_BASE_URL não configurada em api-dev.js");
  }

  // Monta o corpo como JSON em string
  const bodyJson = JSON.stringify({ action, payload });

  const response = await fetch(API_BASE_URL, {
    method: "POST",
    // IMPORTANTE: usar text/plain para evitar preflight CORS
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: bodyJson,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Erro HTTP ${response.status}: ${text}`);
  }

  const json = await response.json();
  return json;
};
