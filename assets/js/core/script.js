/******************************************************
 * PRONTIO – script.js (NÚCLEO + UTILITÁRIOS GLOBAIS)
 *
 * Responsabilidades:
 * - Namespace global PRONTIO
 * - Helpers de storage
 * - Toasts / loading
 * - Helpers de formulário
 * - Utils
 * - Compatibilidade com código antigo
 *
 * ⚠️ IMPORTANTE SOBRE API:
 * - O módulo OFICIAL de comunicação com o backend é:
 *     api-core.js (produção) ou api-core-dev.js (desenvolvimento)
 * - Este arquivo define uma implementação LEGADA de PRONTIO.API.call
 *   e window.callApi APENAS SE ainda não existirem.
 ******************************************************/

/* ===========================
   NAMESPACE GLOBAL PRONTIO
=========================== */

window.PRONTIO = window.PRONTIO || {};

PRONTIO.Config  = PRONTIO.Config  || {};
PRONTIO.API     = PRONTIO.API     || {};
PRONTIO.Storage = PRONTIO.Storage || {};
PRONTIO.UI      = PRONTIO.UI      || {};
PRONTIO.Forms   = PRONTIO.Forms   || {};
PRONTIO.Utils   = PRONTIO.Utils   || {};
PRONTIO.App     = PRONTIO.App     || {};

/* ===========================
   CONFIGURAÇÃO GERAL
=========================== */

/**
 * SCRIPT_URL de BACKEND LEGADO (produção).
 *
 * Hoje quem manda de verdade é:
 *   - api-core.js        → PROD
 *   - api-core-dev.js    → DEV
 *
 * Este valor fica mantido apenas para compatibilidade
 * com módulos muito antigos que usem PRONTIO.Config.SCRIPT_URL
 * diretamente ou dependam da implementação LEGADA de PRONTIO.API.call.
 */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzFinGtszWRvpaWaBL2hdEgxGinBjq65AhsKVubK-R1K8-ax1DqE1aU13TUsQyY_Rma/exec";

// Deixa disponível também em PRONTIO.Config (LEGADO)
PRONTIO.Config.SCRIPT_URL = SCRIPT_URL;

/* ===========================
   CHAMADA PADRÃO À API (LEGADO)
   ⚠️ IMPORTANTE:
   - O módulo oficial que faz chamadas é api-core.js / api-core-dev.js.
   - AQUI definimos APENAS UM FALLBACK, usado SOMENTE se
     PRONTIO.API.call ainda não existir.
=========================== */

if (typeof PRONTIO.API.call !== "function") {
  console.warn("PRONTIO :: usando implementação LEGADA de PRONTIO.API.call (script.js). Verifique se api-core.js / api-core-dev.js está carregado.");

  PRONTIO.API.call = async function (payload, options = {}) {
    const { showLoading: show = false } = options;

    if (show) PRONTIO.UI.showLoading();

    try {
      const response = await fetch(PRONTIO.Config.SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload)
        // sem headers → evita preflight CORS; Code.gs lê e.postData.contents
      });

      if (!response.ok) {
        throw new Error("Erro HTTP " + response.status);
      }

      const json = await response.json();

      if (json && json.ok === false) {
        const msg = json.erro || "Erro inesperado ao processar requisição.";
        throw new Error(msg);
      }

      return json;

    } catch (error) {
      console.error("PRONTIO – API ERROR (LEGADO):", error);
      PRONTIO.UI.showToast("Erro: " + error.message, "erro");
      throw error;
    } finally {
      if (show) PRONTIO.UI.hideLoading();
    }
  };
} else {
  // Já existe PRONTIO.API.call vindo de api-core.js / api-core-dev.js
  console.log("PRONTIO :: PRONTIO.API.call já definido por api-core. Mantendo implementação oficial.");
}

/* ===========================
   LOCALSTORAGE – CHAVES
=========================== */

PRONTIO.Storage.keys = {
  PACIENTE: "PRONTIO_PACIENTE",
  CONFIG: "PRONTIO_CONFIG"
};

/* ===========================
   LOCALSTORAGE – PACIENTE
=========================== */

PRONTIO.Storage.salvarPacienteSelecionado = function (paciente) {
  if (!paciente) return;
  localStorage.setItem(
    PRONTIO.Storage.keys.PACIENTE,
    JSON.stringify(paciente)
  );
};

PRONTIO.Storage.carregarPacienteSelecionado = function () {
  const valor = localStorage.getItem(PRONTIO.Storage.keys.PACIENTE);
  if (!valor) return null;
  try {
    return JSON.parse(valor);
  } catch (e) {
    console.warn("PRONTIO – erro ao ler paciente do localStorage:", e);
    return null;
  }
};

PRONTIO.Storage.limparPacienteSelecionado = function () {
  localStorage.removeItem(PRONTIO.Storage.keys.PACIENTE);
};

/* ===========================
   LOCALSTORAGE – CONFIG APP
=========================== */

PRONTIO.Storage.salvarConfigApp = function (config) {
  if (!config) return;
  localStorage.setItem(PRONTIO.Storage.keys.CONFIG, JSON.stringify(config));
};

PRONTIO.Storage.carregarConfigApp = function () {
  const valor = localStorage.getItem(PRONTIO.Storage.keys.CONFIG);
  if (!valor) return {};
  try {
    return JSON.parse(valor);
  } catch (e) {
    console.warn("PRONTIO – erro ao ler config do localStorage:", e);
    return {};
  }
};

/* ===========================
   TOAST / ALERTAS (UI)
=========================== */

PRONTIO.UI.showToast = function (msg, tipo = "info") {
  const div = document.createElement("div");
  div.className = `prontio-toast ${tipo}`;
  div.innerText = msg;

  document.body.appendChild(div);

  requestAnimationFrame(() => {
    div.classList.add("show");
  });

  setTimeout(() => {
    div.classList.remove("show");
    setTimeout(() => div.remove(), 300);
  }, 3000);
};

PRONTIO.UI.mostrarMensagem = function (texto, tipo = "info") {
  PRONTIO.UI.showToast(texto, tipo === "erro" ? "erro" : "info");
};

/* ===========================
   LOADING GLOBAL (UI)
=========================== */

PRONTIO.UI.showLoading = function () {
  let overlay = document.getElementById("prontio-loading");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "prontio-loading";
    overlay.innerHTML = `
      <div class="prontio-loading-backdrop">
        <div class="prontio-loading-spinner"></div>
      </div>
    `;
    document.body.appendChild(overlay);
  }
  overlay.style.display = "flex";
};

PRONTIO.UI.hideLoading = function () {
  const overlay = document.getElementById("prontio-loading");
  if (overlay) overlay.style.display = "none";
};

/* ===========================
   HELPERS DE FORMULÁRIO
=========================== */

PRONTIO.Forms.getValue = function (id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
};

PRONTIO.Forms.setValue = function (id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value ?? "";
};

/* ===========================
   UTILS
=========================== */

PRONTIO.Utils.calcularIdade = function (dataISO) {
  if (!dataISO) return "";
  const d = new Date(dataISO);
  if (isNaN(d)) return "";
  const hoje = new Date();
  let idade = hoje.getFullYear() - d.getFullYear();
  const m = hoje.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < d.getDate())) idade--;
  return idade >= 0 ? idade : "";
};

/* ===========================
   WRAPPERS DE COMPATIBILIDADE
=========================== */

/**
 * Aqui garantimos apenas que window.callApi aponte para PRONTIO.API.call,
 * seja ele o LEGADO (script.js) ou o OFICIAL (api-core.js / api-core-dev.js).
 */
window.callApi = PRONTIO.API.call;

window.salvarPacienteSelecionado = PRONTIO.Storage.salvarPacienteSelecionado;
window.carregarPacienteSelecionado = PRONTIO.Storage.carregarPacienteSelecionado;
window.limparPacienteSelecionado = PRONTIO.Storage.limparPacienteSelecionado;

window.salvarConfigApp = PRONTIO.Storage.salvarConfigApp;
window.carregarConfigApp = PRONTIO.Storage.carregarConfigApp;

window.showToast = PRONTIO.UI.showToast;
window.mostrarMensagem = PRONTIO.UI.mostrarMensagem;

window.showLoading = PRONTIO.UI.showLoading;
window.hideLoading = PRONTIO.UI.hideLoading;

window.getValue = PRONTIO.Forms.getValue;
window.setValue = PRONTIO.Forms.setValue;

window.calcularIdade = PRONTIO.Utils.calcularIdade;

/* ===========================
   INICIALIZAÇÃO BASE
=========================== */

PRONTIO.App.init = PRONTIO.App.init || function () {
  // Inicialização geral do app (opcional)
};

document.addEventListener("DOMContentLoaded", () => {
  if (typeof PRONTIO.App.init === "function") {
    PRONTIO.App.init();
  }
});
