// assets/js/core/api-dev.js

const API_BASE_URL = "https://script.google.com/macros/s/AKfycbyqoIJ10ufgRej2K1INGw-s7o_8xwYwj68pkwHPnkxMVNn4x0Fc7xQJK3pv-xyfUx6TBA/exec";

window.callApi = async function ({ action, payload = {} }) {
  if (!API_BASE_URL) {
    console.warn("⚠️ API_BASE_URL não configurada em api-dev.js");
  }

  const body = { action, payload };

  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Erro HTTP ${response.status}: ${text}`);
  }

  const json = await response.json();
  return json;
};
