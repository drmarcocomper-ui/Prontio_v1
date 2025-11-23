/******************************************************
 * PRONTIO – evolucao.js
 * Módulo de Evolução Clínica
 *
 * Depende de:
 *  - script.js   (localStorage, toast, loading)
 *  - api.js      (EvolucaoApi)
 *  - utils.js    (hojeISO, agoraHora, formatarHora, etc.)
 *  - print.js    (imprimeArea, se disponível)
 ******************************************************/

const LS_RASCUNHO_KEY = "PRONTIO_RASCUNHO_EVOLUCAO";

document.addEventListener("DOMContentLoaded", () => {
  inicializarEvolucao();
});

/* ====================================================
   INICIALIZAÇÃO
==================================================== */

async function inicializarEvolucao() {
  configurarEventosEvolucao();
  preencherPacienteDaSessao();
  prepararCamposIniciaisEvolucao();
  carregarRascunhoSeExistir();
  await carregarHistoricoEvolucao();
}

/* ====================================================
   EVENTOS
==================================================== */

function configurarEventosEvolucao() {
  const btnSalvar = document.getElementById("btnSalvar");
  const btnLimpar = document.getElementById("btnLimpar");
  const btnImprimir = document.getElementById("btnImprimir");
  const textarea = document.getElementById("textoEvolucao");
  const modeloSelect = document.getElementById("modeloEvolucaoSelect");
  const chips = document.querySelectorAll(".chip-button");

  if (btnSalvar) {
    btnSalvar.addEventListener("click", async (e) => {
      e.preventDefault();
      await salvarEvolucao();
    });
  }

  if (btnLimpar) {
    btnLimpar.addEventListener("click", (e) => {
      e.preventDefault();
      limparTextoEvolucao();
    });
  }

  if (btnImprimir) {
    btnImprimir.addEventListener("click", (e) => {
      e.preventDefault();
      imprimirEvolucaoAtual();
    });
  }

  // Salvar rascunho ao digitar
  if (textarea) {
    let timeout = null;
    textarea.addEventListener("input", () => {
      atualizarChipRascunho("Rascunho não salvo");
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        salvarRascunhoEvolucao();
      }, 400);
    });
  }

  // Chips de trechos rápidos
  if (chips && chips.length) {
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const snippet = chip.getAttribute("data-snippet") || "";
        inserirSnippetNoTexto(snippet);
      });
    });
  }

  // Select de "Anamnese favorita"
  if (modeloSelect) {
    preencherModelosEvolucaoSelect(modeloSelect);
    modeloSelect.addEventListener("change", () => {
      aplicarModeloEvolucao(modeloSelect.value);
    });
  }
}

/* ====================================================
   PACIENTE SELECIONADO (localStorage)
==================================================== */

function preencherPacienteDaSessao() {
  const paciente = carregarPacienteSelecionado();
  const campoId = document.getElementById("idPaciente");
  const campoNome = document.getElementById("nomePaciente");

  if (!campoId || !campoNome) return;

  if (!paciente) {
    // Permite preencher manualmente, mas avisa
    showToast(
      "Nenhum paciente selecionado. Você pode informar o nome manualmente, mas o ideal é vir da lista.",
      "aviso",
    );
    return;
  }

  const idPaciente =
    paciente.idPaciente || paciente.ID_Paciente || paciente.IdPaciente || "";
  const nomePaciente =
    paciente.NomePaciente ||
    paciente.nomePaciente ||
    paciente.NomeCompleto ||
    paciente.nomeCompleto ||
    paciente.nome ||
    "";

  campoId.value = idPaciente;
  campoNome.value = nomePaciente;
}

/* ====================================================
   CAMPOS INICIAIS (data/hora)
==================================================== */

function prepararCamposIniciaisEvolucao() {
  const campoData = document.getElementById("dataEvolucao");
  const campoHora = document.getElementById("horaEvolucao");

  if (campoData && !campoData.value) {
    campoData.value = hojeISO();
  }
  if (campoHora && !campoHora.value) {
    campoHora.value = agoraHora();
  }
}

/* ====================================================
   RASCUNHO (localStorage)
==================================================== */

function salvarRascunhoEvolucao() {
  const idPacienteEl = document.getElementById("idPaciente");
  const textoEl = document.getElementById("textoEvolucao");
  const dataEl = document.getElementById("dataEvolucao");
  const horaEl = document.getElementById("horaEvolucao");

  if (!textoEl) return;

  const rascunho = {
    idPaciente: idPacienteEl ? idPacienteEl.value.trim() : "",
    texto: textoEl.value,
    data: dataEl ? dataEl.value : "",
    hora: horaEl ? horaEl.value : "",
    atualizadoEm: new Date().toISOString(),
  };

  localStorage.setItem(LS_RASCUNHO_KEY, JSON.stringify(rascunho));
  atualizarChipRascunho("Rascunho salvo");
}

function carregarRascunhoSeExistir() {
  const textoEl = document.getElementById("textoEvolucao");
  const dataEl = document.getElementById("dataEvolucao");
  const horaEl = document.getElementById("horaEvolucao");
  const idPacienteEl = document.getElementById("idPaciente");

  if (!textoEl) return;

  const raw = localStorage.getItem(LS_RASCUNHO_KEY);
  if (!raw) {
    atualizarChipRascunho("Nenhum rascunho");
    return;
  }

  try {
    const r = JSON.parse(raw);
    const idAtual = idPacienteEl ? idPacienteEl.value.trim() : "";

    // Se tiver rascunho e for do mesmo paciente, carrega
    if (!idAtual || !r.idPaciente || r.idPaciente === idAtual) {
      if (!textoEl.value) {
        textoEl.value = r.texto || "";
      }
      if (dataEl && !dataEl.value && r.data) dataEl.value = r.data;
      if (horaEl && !horaEl.value && r.hora) horaEl.value = r.hora;

      atualizarChipRascunho("Rascunho carregado");
    } else {
      atualizarChipRascunho("Nenhum rascunho");
    }
  } catch (e) {
    console.warn("Erro ao ler rascunho de evolução:", e);
    atualizarChipRascunho("Nenhum rascunho");
  }
}

function limparRascunhoEvolucao() {
  localStorage.removeItem(LS_RASCUNHO_KEY);
  atualizarChipRascunho("Nenhum rascunho");
}

function atualizarChipRascunho(texto) {
  const chip = document.getElementById("chipRascunho");
  if (!chip) return;
  chip.textContent = texto;
}

/* ====================================================
   HISTÓRICO (listaEvolucoes)
==================================================== */

async function carregarHistoricoEvolucao() {
  const idPacienteEl = document.getElementById("idPaciente");
  if (!idPacienteEl || !idPacienteEl.value.trim()) {
    // Não força erro se vier sem ID (pode ser uso mais livre)
    return;
  }

  const idPaciente = idPacienteEl.value.trim();

  try {
    const resposta = await EvolucaoApi.listarPorPaciente(idPaciente);
    if (!resposta || !resposta.ok) return;

    const lista = resposta.lista || resposta.evolucoes || [];
    preencherHistoricoEvolucoes(lista);
    preencherUltimaEvolucaoNoCampo(lista);
  } catch (e) {
    console.error("Erro ao carregar histórico de evoluções:", e);
  }
}

function preencherHistoricoEvolucoes(lista) {
  const container = document.getElementById("listaEvolucoes");
  if (!container) return;

  if (!lista || !lista.length) {
    container.classList.add("history-list-empty");
    container.innerHTML = "Nenhuma evolução encontrada.";
    return;
  }

  container.classList.remove("history-list-empty");
  container.innerHTML = "";

  lista.forEach((item) => {
    const data = item.Data || item.data || "";
    const hora = item.Hora || item.hora || "";
    const tipo = item.Tipo || item.tipo || "";
    const texto = item.Evolucao || item.evolucao || "";

    const div = document.createElement("div");
    div.className = "history-item";

    const header = document.createElement("div");
    header.className = "history-item-header";
    header.textContent = `${data} ${hora ? "às " + formatarHora(hora) : ""}${
      tipo ? " – " + tipo : ""
    }`;

    const body = document.createElement("div");
    body.className = "history-item-body";
    body.textContent = texto;

    div.appendChild(header);
    div.appendChild(body);

    container.appendChild(div);
  });
}

/**
 * Preenche o campo de texto com a última evolução
 * se ele estiver vazio.
 */
function preencherUltimaEvolucaoNoCampo(lista) {
  if (!lista || !lista.length) return;

  const textarea = document.getElementById("textoEvolucao");
  if (!textarea || textarea.value.trim()) return;

  // Assume que lista[0] é o mais recente; se vier invertido, trocar por lista[lista.length-1]
  const ultima = lista[0];
  const texto = ultima.Evolucao || ultima.evolucao || "";
  if (texto) {
    textarea.value = texto;
  }
}

/* ====================================================
   SALVAR EVOLUÇÃO
==================================================== */

async function salvarEvolucao() {
  const idPacienteEl = document.getElementById("idPaciente");
  const nomePacienteEl = document.getElementById("nomePaciente");
  const dataEl = document.getElementById("dataEvolucao");
  const horaEl = document.getElementById("horaEvolucao");
  const textoEl = document.getElementById("textoEvolucao");

  const idPaciente = idPacienteEl ? idPacienteEl.value.trim() : "";
  const nomePaciente = nomePacienteEl ? nomePacienteEl.value.trim() : "";
  const data = dataEl ? dataEl.value : "";
  const hora = horaEl ? horaEl.value : "";
  const texto = textoEl ? textoEl.value.trim() : "";

  if (!nomePaciente) {
    showToast("Informe o nome do paciente.", "aviso");
    nomePacienteEl?.focus();
    return;
  }

  if (!texto) {
    showToast("Digite a evolução clínica antes de salvar.", "aviso");
    textoEl?.focus();
    return;
  }

  const dados = {
    idPaciente,
    NomePaciente: nomePaciente,
    Data: data,
    Hora: hora,
    Tipo: "", // Você pode usar "Consulta", "Retorno", etc. futuramente
    Evolucao: texto,
  };

  const resposta = await EvolucaoApi.salvar(dados);
  if (!resposta || !resposta.ok) return;

  showToast("Evolução salva com sucesso!", "sucesso");

  limparRascunhoEvolucao();
  await carregarHistoricoEvolucao();
}

/* ====================================================
   TEXTO – chips, modelos, limpar, imprimir
==================================================== */

function inserirSnippetNoTexto(snippet) {
  if (!snippet) return;
  const textarea = document.getElementById("textoEvolucao");
  if (!textarea) return;

  const atual = textarea.value || "";
  const separador = atual && !atual.endsWith("\n") ? "\n" : "";
  textarea.value = `${atual}${separador}${snippet}`;
  textarea.dispatchEvent(new Event("input"));
}

function limparTextoEvolucao() {
  const textarea = document.getElementById("textoEvolucao");
  if (!textarea) return;
  textarea.value = "";
  limparRascunhoEvolucao();
}

/**
 * Modelos de anamnese favoritos (pode ser estático por enquanto).
 * Se você já estiver carregando via backend, pode substituir esta parte.
 */
function preencherModelosEvolucaoSelect(select) {
  if (!select) return;

  // Exemplo simples; ajuste depois se quiser integrar com a planilha
  const modelos = [
    { id: "", label: "Selecione um modelo..." },
    {
      id: "rotina",
      label: "Consulta de rotina",
      texto:
        "Paciente em seguimento ambulatorial, em bom estado geral, sem queixas relevantes no momento.",
    },
    {
      id: "posop",
      label: "Pós-operatório",
      texto:
        "Paciente em pós-operatório, evoluindo satisfatoriamente, sem sinais de complicação aguda.",
    },
  ];

  select.innerHTML = "";
  modelos.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = m.label;
    select.appendChild(opt);
  });

  // Guarda os textos no elemento para uso posterior
  select._modelosEvolucao = modelos;
}

function aplicarModeloEvolucao(modeloId) {
  const select = document.getElementById("modeloEvolucaoSelect");
  const textarea = document.getElementById("textoEvolucao");
  if (!select || !textarea || !modeloId) return;

  const modelos = select._modelosEvolucao || [];
  const modelo = modelos.find((m) => m.id === modeloId);
  if (!modelo || !modelo.texto) return;

  textarea.value = modelo.texto;
  textarea.dispatchEvent(new Event("input"));
}

/**
 * Imprimir a evolução atual. Aqui montamos uma área de impressão simples
 * e usamos imprimeArea() se existir (print.js). Se não existir, chamamos
 * window.print() como fallback.
 */
function imprimirEvolucaoAtual() {
  const nomePacienteEl = document.getElementById("nomePaciente");
  const dataEl = document.getElementById("dataEvolucao");
  const horaEl = document.getElementById("horaEvolucao");
  const textoEl = document.getElementById("textoEvolucao");

  const nome = nomePacienteEl ? nomePacienteEl.value.trim() : "";
  const data = dataEl ? dataEl.value : "";
  const hora = horaEl ? horaEl.value : "";
  const texto = textoEl ? textoEl.value.trim() : "";

  if (!texto) {
    showToast("Nada para imprimir. Digite a evolução primeiro.", "aviso");
    return;
  }

  let area = document.getElementById("area-evolucao-print");
  if (!area) {
    area = document.createElement("div");
    area.id = "area-evolucao-print";
    area.style.display = "none";
    document.body.appendChild(area);
  }

  area.innerHTML = `
    <div>
      <p><strong>Paciente:</strong> ${nome || "N/D"}</p>
      <p><strong>Data/Hora:</strong> ${data || ""} ${hora || ""}</p>
      <hr />
      <p>${texto.replace(/\n/g, "<br>")}</p>
    </div>
  `;

  if (typeof imprimeArea === "function") {
    imprimeArea("#area-evolucao-print", {
      titulo: "Evolução Clínica",
      tipo: "evolucao",
    });
  } else {
    window.print();
  }
}
