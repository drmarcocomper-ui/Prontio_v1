// ======================================================
// PRONTIO – Pacientes (frontend)
// Layout em cards + drawer – usando helpers globais (script.js)
// ======================================================

let pacientesCache = [];

/**
 * Salva no localStorage o paciente selecionado
 * para o módulo Prontuário.
 */
function salvarPacienteSelecionado(p) {
  if (!p) return;

  const idade = calcularIdade(p.DataNascimento); // helper global

  const obj = {
    id: p.ID_Paciente,
    nome: p.NomePaciente,
    telefone: p.Telefone1 || p.Telefone2 || "",
    idade: idade || "",
    plano: p.PlanoSaude || "",
    alergias: p.Alergias || "",
    medicacoes: p.MedicacoesEmUso || "",
    doencas: p.DoencasCronicas || "",
    dataNascimento: p.DataNascimento || "",
  };

  localStorage.setItem("pacienteSelecionado", JSON.stringify(obj));
}

/* ================== BACKEND – PACIENTES ================== */

async function carregarPacientes() {
  try {
    const data = await callApi({ action: "pacientes-listar" }); // helper global
    pacientesCache = data.pacientes || [];
    renderizarLista();
  } catch (e) {
    console.error(e);
    mostrarMensagem("Erro ao carregar pacientes: " + e.message, "erro");
  }
}

function montarPacienteDoForm() {
  return {
    ID_Paciente: getValue("idPaciente") || null,
    NomePaciente: getValue("nomePaciente"),
    DataNascimento: getValue("dataNascimento"),
    Sexo: getValue("sexo"),
    CPF: getValue("cpf"),
    RG: getValue("rg"),
    Telefone1: getValue("telefone1"),
    Telefone2: getValue("telefone2"),
    Email: getValue("email"),
    EnderecoRua: getValue("enderecoRua"),
    EnderecoNumero: getValue("enderecoNumero"),
    EnderecoBairro: getValue("enderecoBairro"),
    EnderecoCidade: getValue("enderecoCidade"),
    EnderecoUF: getValue("enderecoUF"),
    EnderecoCEP: getValue("enderecoCEP"),
    Alergias: getValue("alergias"),
    MedicacoesEmUso: getValue("medicacoesEmUso"),
    DoencasCronicas: getValue("doencasCronicas"),
    ObsImportantes: getValue("obsImportantes"),
    PlanoSaude: getValue("planoSaude"),
    NumeroCarteirinha: getValue("numeroCarteirinha"),
    ValidadeCarteirinha: getValue("validadeCarteirinha"),
    Ativo: getValue("ativo") || "S",
  };
}

async function salvarPaciente(irParaProntuario = false) {
  const paciente = montarPacienteDoForm();

  if (!paciente.NomePaciente) {
    mostrarMensagem("Informe o nome do paciente.", "erro");
    return;
  }

  try {
    const data = await callApi({
      action: "pacientes-salvar",
      paciente,
    });

    const salvo = data.paciente;

    mostrarMensagem("Paciente salvo com sucesso.");

    const idx = pacientesCache.findIndex(
      (p) => p.ID_Paciente === salvo.ID_Paciente
    );

    if (idx >= 0) pacientesCache[idx] = salvo;
    else pacientesCache.push(salvo);

    preencherFormulario(salvo);
    renderizarLista();

    if (irParaProntuario) {
      salvarPacienteSelecionado(salvo);
      window.location.href = "prontuario.html";
    }
  } catch (err) {
    console.error(err);
    mostrarMensagem("Erro ao salvar paciente: " + err.message, "erro");
  }
}

function irParaProntuarioPorId(idPaciente) {
  const p = pacientesCache.find((x) => x.ID_Paciente === idPaciente);
  if (!p) {
    mostrarMensagem("Paciente não encontrado.", "erro");
    return;
  }

  salvarPacienteSelecionado(p);
  window.location.href = "prontuario.html";
}

/* ================== UI – FORM / DRAWER / LISTA ================== */

function preencherFormulario(p) {
  setValue("idPaciente", p.ID_Paciente || "");
  setValue("nomePaciente", p.NomePaciente);
  setValue("dataNascimento", p.DataNascimento);
  setValue("sexo", p.Sexo);
  setValue("cpf", p.CPF);
  setValue("rg", p.RG);
  setValue("telefone1", p.Telefone1);
  setValue("telefone2", p.Telefone2);
  setValue("email", p.Email);
  setValue("enderecoRua", p.EnderecoRua);
  setValue("enderecoNumero", p.EnderecoNumero);
  setValue("enderecoBairro", p.EnderecoBairro);
  setValue("enderecoCidade", p.EnderecoCidade);
  setValue("enderecoUF", p.EnderecoUF);
  setValue("enderecoCEP", p.EnderecoCEP);
  setValue("alergias", p.Alergias);
  setValue("medicacoesEmUso", p.MedicacoesEmUso);
  setValue("doencasCronicas", p.DoencasCronicas);
  setValue("obsImportantes", p.ObsImportantes);
  setValue("planoSaude", p.PlanoSaude);
  setValue("numeroCarteirinha", p.NumeroCarteirinha);
  setValue("validadeCarteirinha", p.ValidadeCarteirinha);
  setValue("ativo", p.Ativo || "S");

  const titulo = document.getElementById("tituloFormulario");
  if (titulo) titulo.textContent = "Editar paciente";
}

function limparFormulario() {
  const form = document.getElementById("paciente-form");
  if (form) form.reset();

  setValue("idPaciente", "");
  setValue("ativo", "S");

  const titulo = document.getElementById("tituloFormulario");
  if (titulo) titulo.textContent = "Novo paciente";
}

/* LISTA EM CARDS */

function renderizarLista() {
  const div = document.getElementById("listaPacientes");
  if (!div) return;

  const busca = getValue("buscaPaciente").toLowerCase();
  const filtro = getValue("filtroAtivo") || "S";

  const filtrados = pacientesCache.filter((p) => {
    if (filtro !== "TODOS" && (p.Ativo || "S") !== filtro) return false;

    if (busca) {
      const alvo =
        `${p.NomePaciente} ${p.CPF} ${p.Telefone1} ${p.Telefone2}`.toLowerCase();
      if (!alvo.includes(busca)) return false;
    }

    return true;
  });

  filtrados.sort((a, b) =>
    (a.NomePaciente || "").localeCompare(b.NomePaciente || "", "pt-BR")
  );

  div.innerHTML = "";

  filtrados.forEach((p) => {
    const idade = calcularIdade(p.DataNascimento);
    const iniciais = (p.NomePaciente || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((t) => t[0].toUpperCase())
      .join("");

    const telefone = p.Telefone1 || p.Telefone2 || "";
    const plano = p.PlanoSaude || "Sem plano";
    const cidade = p.EnderecoCidade || "";
    const uf = p.EnderecoUF || "";

    const infoLinha =
      telefone && (cidade || uf)
        ? `${telefone} <span class="dot">•</span> ${cidade}${
            uf ? " - " + uf : ""
          }`
        : telefone || cidade || "";

    const statusTag =
      p.Ativo === "N"
        ? `<span class="tag-pill tag-inativo">Inativo</span>`
        : `<span class="tag-pill tag-ativo">Ativo</span>`;

    const card = document.createElement("div");
    card.className = "paciente-item";

    card.innerHTML = `
      <div class="paciente-main">
        <div class="paciente-avatar">${iniciais || "P"}</div>
        <div>
          <div class="paciente-nome">
            ${p.NomePaciente || ""}
            ${
              idade
                ? `<span class="paciente-idade">• ${idade} anos</span>`
                : ""
            }
          </div>
          ${
            infoLinha
              ? `<div class="paciente-sec">${infoLinha}</div>`
              : ""
          }
        </div>
      </div>

      <div class="paciente-tags">
        <span class="tag-pill tag-plano">${plano}</span>
        ${statusTag}
      </div>

      <div class="paciente-actions">
        <button class="btn-primario" data-acao="prontuario" data-id="${
          p.ID_Paciente
        }">
          Prontuário
        </button>
        <button class="btn-tabela" data-acao="editar" data-id="${
          p.ID_Paciente
        }">
          Editar
        </button>
      </div>
    `;

    div.appendChild(card);
  });
}

/* DRAWER / EVENTOS */

let abrirDrawer;
let fecharDrawer;

document.addEventListener("DOMContentLoaded", () => {
  const painel = document.getElementById("painelPaciente");
  const backdrop = document.getElementById("backdropPaciente");
  const tituloForm = document.getElementById("tituloFormulario");
  const btnFecharDrawer = document.getElementById("btnFecharDrawer");

  abrirDrawer = function (modo) {
    if (tituloForm) {
      tituloForm.textContent =
        modo === "editar" ? "Editar paciente" : "Novo paciente";
    }
    painel.classList.add("aberto");
    backdrop.classList.add("visivel");
  };

  fecharDrawer = function () {
    painel.classList.remove("aberto");
    backdrop.classList.remove("visivel");
  };

  carregarPacientes();

  const buscaEl = document.getElementById("buscaPaciente");
  if (buscaEl) {
    buscaEl.addEventListener("input", renderizarLista);
    buscaEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        renderizarLista();
      }
    });
  }

  const filtroEl = document.getElementById("filtroAtivo");
  if (filtroEl) filtroEl.addEventListener("change", renderizarLista);

  const btnNovo = document.getElementById("btnNovoPaciente");
  if (btnNovo) {
    btnNovo.addEventListener("click", () => {
      limparFormulario();
      abrirDrawer("novo");
    });
  }

  if (btnFecharDrawer) btnFecharDrawer.addEventListener("click", fecharDrawer);
  if (backdrop) backdrop.addEventListener("click", fecharDrawer);

  const btnCancelar = document.getElementById("btnCancelarEdicao");
  if (btnCancelar) btnCancelar.addEventListener("click", limparFormulario);

  const form = document.getElementById("paciente-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      salvarPaciente(false);
    });
  }

  const btnSalvarProntuario = document.getElementById("btnSalvarIrProntuario");
  if (btnSalvarProntuario) {
    btnSalvarProntuario.addEventListener("click", () =>
      salvarPaciente(true)
    );
  }

  const lista = document.getElementById("listaPacientes");
  if (lista) {
    lista.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-acao]");
      if (!btn) return;

      const acao = btn.dataset.acao;
      const id = btn.dataset.id;

      if (acao === "editar") {
        const p = pacientesCache.find((x) => x.ID_Paciente === id);
        if (p) {
          preencherFormulario(p);
          abrirDrawer("editar");
        }
      } else if (acao === "prontuario") {
        irParaProntuarioPorId(id);
      }
    });
  }
});
