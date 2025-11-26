// assets/js/core/api-dev.js – VERSÃO SEM CORS (GET)

const API_BASE_URL =
  "https://script.google.com/macros/s/AKfycbwXtxGlNmQpPxpzefPLSHQ0v6dSS5XjXzeVRap1-oBXr0uUO-KWpCJcZoSAKtICko_uYA/exec";
  
window.callApi = async function ({ action, payload = {} }) {
  const url =
    API_BASE_URL +
    "?action=" +
    encodeURIComponent(action) +
    "&payload=" +
    encodeURIComponent(JSON.stringify(payload));

  const response = await fetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Erro HTTP " + response.status);
  }

  const json = await response.json();
  return json;
};
