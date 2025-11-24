/******************************************************
 * PRONTIO – script.js (NÚCLEO + UTILITÁRIOS GLOBAIS)
 *
 * Responsabilidades:
 * - Definir o namespace global PRONTIO
 * - Configuração da SCRIPT_URL (Google Apps Script)
 * - Função padrão de chamada à API (PRONTIO.API.call)
 * - Helpers de localStorage (paciente selecionado, config)
 * - Toasts e loading globais (PRONTIO.UI)
 * - Helpers simples de formulário (PRONTIO.Forms)
 *
 * Compatibilidade:
 * - Mantém as funções globais antigas:
 *   callApi, salvarPacienteSelecionado, carregarPacienteSelecionado,
 *   limparPacienteSelecionado, salvarConfigApp, carregarConfigApp,
 *   showToast, mostrarMensagem, showLoading, hideLoading,
 *   getValue, setValue, calcularIdade.
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

// URL do Web App do Google Apps Script (NOVA URL)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzmzr17gHbUz1V9Ekl8HSMPMV75q3bgKwafu6kosHsKSFP_MkglB6ewywT-FnpTRu4Qbw/exec";

// Deixa disponível também em PRONTIO.Config
PRONTIO.Config.SCRIPT_URL = SCRIPT_URL;

/* ===========================
   CHAMADA PADRÃO À API
=========================== */
/**
 * PRONTIO.API.call(payload, options)
 * options:
 *   - showLoading: boolean (default true)
 *
 * IMPORTANTE:
 * - Envia o objeto payload direto como JSON para o backend:
 *   { action: "pacientes-listar", filtros: {...} }
 * - Retorna o JSON COMPLETO vindo do backend:
 *   { ok: true, action: "pacientes-listar", data: {...} }
 */
PRONTIO.API.call = async function (payload, options = {}) {
  const { showLoading: show = true } = options;

  if (show) PRONTIO.UI.showLoading();

  try {
    const response = await fetch(PRONTIO.Config.SCRIPT_URL, {
      method: "POST",
      // sem headers → evita preflight CORS; o backend lê e.postData.contents
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Erro HTTP " + response.status);
    }

    const json = await response.json();

    // Backend padrão PRONTIO (Code.gs) sempre retorna:
    // { ok: boolean, action: string, data: {...}, ... }
    if (json && json.ok === false) {
      const msg = json.erro || "Erro inesperado ao processar a requisição.";
      throw new Error(msg);
    }

    // Retornamos o JSON completo para os módulos (agenda.js, pacientes.js, etc.)
    return json;

  } catch (error) {
    console.error("PRONTIO – API ERROR:", error);
    PRONTIO.UI.showToast("Erro: " + error.message, "erro");
    throw error;
  } finally {
    if (show) PRONTIO.UI.hideLoading();
  }
};

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

/**
 * PRONTIO.UI.showToast(msg, tipo)
 * tipo: "info", "sucesso", "erro", "aviso"
 */
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

/**
 * Wrapper de compatibilidade para módulos antigos
 * que usam mostrarMensagem(...)
 */
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
   HELPERS GERAIS DE FORM
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
   UTILITÁRIOS GERAIS
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
   (mantêm o código antigo funcionando)
=========================== */

// API
window.callApi = PRONTIO.API.call;

// Storage – paciente
window.salvarPacienteSelecionado = PRONTIO.Storage.salvarPacienteSelecionado;
window.carregarPacienteSelecionado = PRONTIO.Storage.carregarPacienteSelecionado;
window.limparPacienteSelecionado = PRONTIO.Storage.limparPacienteSelecionado;

// Storage – config
window.salvarConfigApp = PRONTIO.Storage.salvarConfigApp;
window.carregarConfigApp = PRONTIO.Storage.carregarConfigApp;

// UI – toast
window.showToast = PRONTIO.UI.showToast;
window.mostrarMensagem = PRONTIO.UI.mostrarMensagem;

// UI – loading
window.showLoading = PRONTIO.UI.showLoading;
window.hideLoading = PRONTIO.UI.hideLoading;

// Forms helpers
window.getValue = PRONTIO.Forms.getValue;
window.setValue = PRONTIO.Forms.setValue;

// Utils
window.calcularIdade = PRONTIO.Utils.calcularIdade;

/* ===========================
   INICIALIZAÇÃO BÁSICA (GANCHO)
=========================== */

PRONTIO.App.init = PRONTIO.App.init || function () {
  // Ponto de entrada global, se você quiser algo ao carregar qualquer página.
};

document.addEventListener("DOMContentLoaded", () => {
  if (typeof PRONTIO.App.init === "function") {
    PRONTIO.App.init();
  }
});
