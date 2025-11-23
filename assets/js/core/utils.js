/******************************************************
 * PRONTIO – utils.js
 * Funções auxiliares gerais (datas, máscaras, tabelas)
 *
 * Organização:
 * - PRONTIO.Utils.Datas
 * - PRONTIO.Utils.Mascaras
 * - PRONTIO.Utils.Tabelas
 * - PRONTIO.Utils.Numero
 *
 * Compatibilidade:
 * Mantém as funções globais antigas:
 *   hojeISO(), agoraHora(), formatarDataISOParaBR(),
 *   formatarHora(), aplicarMascaraCpf(), aplicarMascaraTelefone(),
 *   limparTabela(), criarCelula(), criarLinha(), parseNumeroSeguro()
 ******************************************************/

window.PRONTIO = window.PRONTIO || {};
PRONTIO.Utils = PRONTIO.Utils || {};

/* ============================================================
   DATAS / HORAS
============================================================ */

PRONTIO.Utils.Datas = {
  hojeISO() {
    const d = new Date();
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  },

  agoraHora() {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  },

  formatarDataISOParaBR(iso) {
    if (!iso) return "";
    const [ano, mes, dia] = iso.split("-");
    if (!ano || !mes || !dia) return iso;
    return `${dia}/${mes}/${ano}`;
  },

  formatarHora(hora) {
    if (!hora) return "";
    return hora.slice(0, 5);
  },
};

/* ============================================================
   MÁSCARAS
============================================================ */

PRONTIO.Utils.Mascaras = {
  cpf(cpf) {
    if (!cpf) return "";
    return cpf
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  },

  telefone(tel) {
    if (!tel) return "";
    return tel
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{4})$/, "$1-$2");
  },
};

/* ============================================================
   TABELAS (DOM helpers)
============================================================ */

PRONTIO.Utils.Tabelas = {
  limpar(tbodyElement) {
    if (!tbodyElement) return;
    while (tbodyElement.firstChild) {
      tbodyElement.removeChild(tbodyElement.firstChild);
    }
  },

  criarCelula(texto) {
    const td = document.createElement("td");
    td.innerText = texto ?? "";
    return td;
  },

  criarLinha(cellsArray) {
    const tr = document.createElement("tr");
    cellsArray.forEach((texto) =>
      tr.appendChild(PRONTIO.Utils.Tabelas.criarCelula(texto)),
    );
    return tr;
  },
};

/* ============================================================
   NÚMEROS
============================================================ */

PRONTIO.Utils.Numero = {
  parseSeguro(valor, fallback = 0) {
    const n = Number(
      String(valor).replace(",", ".").replace(/[^\d.-]/g, "")
    );
    return Number.isFinite(n) ? n : fallback;
  },
};

/* ============================================================
   WRAPPERS DE COMPATIBILIDADE (NÃO QUEBRA CÓDIGO ANTIGO)
============================================================ */

// Datas
window.hojeISO = PRONTIO.Utils.Datas.hojeISO;
window.agoraHora = PRONTIO.Utils.Datas.agoraHora;
window.formatarDataISOParaBR = PRONTIO.Utils.Datas.formatarDataISOParaBR;
window.formatarHora = PRONTIO.Utils.Datas.formatarHora;

// Máscaras
window.aplicarMascaraCpf = PRONTIO.Utils.Mascaras.cpf;
window.aplicarMascaraTelefone = PRONTIO.Utils.Mascaras.telefone;

// Tabelas
window.limparTabela = PRONTIO.Utils.Tabelas.limpar;
window.criarCelula = PRONTIO.Utils.Tabelas.criarCelula;
window.criarLinha = PRONTIO.Utils.Tabelas.criarLinha;

// Números
window.parseNumeroSeguro = PRONTIO.Utils.Numero.parseSeguro;
