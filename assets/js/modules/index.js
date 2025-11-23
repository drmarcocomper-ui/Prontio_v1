/******************************************************
 * INDEX.JS — PRONTIO (Fila de Atendimento)
 * Versão básica: Compromissos / Histórico + Atender
 * OBS: usa SCRIPT_URL definido em script.js
 ******************************************************/

let compromissos = [];
let historico = [];
let viewAtual = "compromissos";

/* ===================================================
   INICIALIZAÇÃO
=================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtns = document.querySelectorAll(".toggle-btn");
  const buscaInput = document.getElementById("buscaPaciente");
  const ordenacaoSelect = document.getElementById("ordenacao");

  // Alternar entre Compromissos / Histórico
  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      viewAtual = btn.dataset.view;
      renderLista();
    });
  });

  // Busca por nome
  if (buscaInput) {
    buscaInput.addEventListener("input", () => renderLista());
  }

  // Ordenação (hora / nome)
  if (ordenacaoSelect) {
    ordenacaoSelect.addEventListener("change", () => renderLista());
  }

  carregarFila();
});

/* ===================================================
   CARREGAR AGENDA DO BACKEND
=================================================== */
async function carregarFila() {
  try {
    const resp = await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "listarAgenda" }),
    });

    const data = await resp.json();

    if (data.ok && Array.isArray(data.registros)) {
      const hojeISO = hojeISO_();

      compromissos = data.registros.filter((r) => {
        return (
          r.Data &&
          r.Data >= hojeISO &&
          (r.Status || "").toLowerCase() !== "finalizado"
        );
      });

      historico = data.registros.filter((r) => {
        return (
          !r.Data ||
          r.Data < hojeISO ||
          (r.Status || "").toLowerCase() === "finalizado"
        );
      });
    } else {
      usarMocks_();
    }
  } catch (e) {
    console.log("Erro ao carregar fila:", e);
    usarMocks_();
  }

  renderLista();
}

/* ===================================================
   MOCKS (CASO BACKEND FALHE)
=================================================== */
function usarMocks_() {
  const hoje = hojeISO_();
  compromissos = [
    {
      ID_Agenda: 1,
      Data: hoje,
      Hora: "07:55",
      NomePaciente: "João da Silva",
      Idade: "45",
      TipoConsulta: "Convênio",
      Status: "Pendente",
      Descricao: "Consulta urológica",
    },
    {
      ID_Agenda: 2,
      Data: hoje,
      Hora: "08:10",
      NomePaciente: "Carlos Pereira",
      Idade: "56",
      TipoConsulta: "Particular",
      Status: "Confirmado",
      Descricao: "Retorno",
    },
  ];

  historico = [
    {
      ID_Agenda: 99,
      Data: "2025-11-10",
      Hora: "15:30",
      NomePaciente: "José Santos",
      Idade: "62",
      TipoConsulta: "Convênio",
      Status: "Finalizado",
      Descricao: "Consulta finalizada",
    },
  ];
}

/* ===================================================
   HELPERS DE DATA
=================================================== */
function hojeISO_() {
  const d = new Date();
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function formatarDataLabel_(dataISO) {
  if (!dataISO || dataISO === "Sem data") return "Outros";
  const hoje = hojeISO_();
  if (dataISO === hoje) return "Hoje";

  const d = new Date(dataISO + "T00:00:00");
  if (Number.isNaN(d.getTime())) return dataISO;

  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

/* ===================================================
   LISTA / RENDERIZAÇÃO
=================================================== */
function obterListaAtual_() {
  return viewAtual === "historico" ? historico : compromissos;
}

function renderLista() {
  const container = document.getElementById("listaAtendimentos");
  if (!container) return;

  const busca = (document.getElementById("buscaPaciente")?.value || "")
    .trim()
    .toLowerCase();
  const ordenacao = document.getElementById("ordenacao")?.value || "hora";

  let lista = [...obterListaAtual_()];

  // Filtro por nome
  if (busca) {
    lista = lista.filter((item) =>
      (item.NomePaciente || "").toLowerCase().includes(busca)
    );
  }

  // Ordenação
  if (ordenacao === "nome") {
    lista.sort((a, b) =>
      (a.NomePaciente || "").localeCompare(b.NomePaciente || "")
    );
  } else {
    lista.sort((a, b) => {
      const chaveA = `${a.Data || ""} ${a.Hora || ""}`;
      const chaveB = `${b.Data || ""} ${b.Hora || ""}`;
      return chaveA.localeCompare(chaveB);
    });
  }

  if (!lista.length) {
    container.innerHTML =
      '<p class="day-label">Nenhum atendimento encontrado.</p>';
    return;
  }

  const gruposPorData = agruparPorData_(lista);
  let html = "";

  Object.keys(gruposPorData).forEach((dataISO) => {
    const label = formatarDataLabel_(dataISO);
    html += `<div class="day-label">${label}</div>`;

    gruposPorData[dataISO].forEach((item) => {
      html += criarHtmlItem_(item);
    });
  });

  container.innerHTML = html;
}

function agruparPorData_(lista) {
  const grupos = {};
  lista.forEach((item) => {
    const chave = item.Data || "Sem data";
    if (!grupos[chave]) grupos[chave] = [];
    grupos[chave].push(item);
  });
  return grupos;
}

function criarHtmlItem_(item) {
  const status = (item.Status || "").toLowerCase();
  let statusClasse = "badge";
  if (status.startsWith("pend")) statusClasse += " badge-status-pend";
  if (status.startsWith("conf")) statusClasse += " badge-status-conf";

  const idade = item.Idade ? ` - ${item.Idade} anos` : "";
  const tipo = item.TipoConsulta || "";
  const desc = item.Descricao || "";

  return `
    <div class="appointment">
      <div class="appt-time">${item.Hora || ""}</div>

      <div class="appt-main">
        <div class="appt-name">${item.NomePaciente || ""}${idade}</div>
        <div class="appt-extra">
          ${tipo ? tipo + " | " : ""}${desc}
        </div>
        <div class="appt-badges">
          <span class="${statusClasse}">${item.Status || "—"}</span>
        </div>
      </div>

      <div class="appt-action">
        <button class="btn-atender" onclick="iniciarAtendimento_('${
          item.ID_Agenda || ""
        }')">
          Atender
        </button>
      </div>
    </div>
  `;
}

/* ===================================================
   ATENDER → LOCALSTORAGE + PRONTUÁRIO
=================================================== */
function iniciarAtendimento_(idAgenda) {
  const lista = [...compromissos, ...historico];
  const item = lista.find((x) => String(x.ID_Agenda) === String(idAgenda));

  if (!item) {
    console.error("Atendimento não encontrado:", idAgenda);
    return;
  }

  localStorage.setItem(
    "pacienteSelecionado",
    JSON.stringify({
      ID_Agenda: item.ID_Agenda,
      ID_Paciente: item.ID_Paciente,
      NomePaciente: item.NomePaciente,
      Idade: item.Idade,
      Data: item.Data,
      Hora: item.Hora,
      Status: item.Status,
      TipoConsulta: item.TipoConsulta,
      Descricao: item.Descricao,
    })
  );

  window.location.href = "prontuario.html";
}
