/******************************************************
 * PRONTIO – pacientes-dev.js
 *
 * Módulo de Pacientes para AMBIENTE DE DESENVOLVIMENTO.
 *
 * ✅ Usa a API DEV (api-core-dev.js + api-dev.js)
 * ✅ Mantém a mesma assinatura do módulo de produção:
 *      PRONTIO.Modules.Pacientes.init()
 *
 * Objetivo:
 *  - Listar pacientes da planilha DEV;
 *  - Permitir busca e filtro por status;
 *  - Permitir salvar um paciente simples (nome, CPF, telefone)
 *    para testar o backend DEV sem encostar na planilha oficial.
 ******************************************************/

window.PRONTIO = window.PRONTIO || {};
PRONTIO.Modules = PRONTIO.Modules || {};

PRONTIO.Modules.Pacientes = (function () {

  // -----------------------------
  // Seletores de elementos
  // -----------------------------
  let inputBusca;
  let selectFiltroAtivo;
  let btnNovoPaciente;
  let listaPacientesEl;
  let painelPacienteEl;
  let backdropPacienteEl;
  let tituloFormularioEl;
  let formPacienteEl;
  let mensagemStatusEl;

  // Campos do formulário a serem criados (se não existirem)
  let campoIdPaciente;
  let campoNomeCompleto;
  let campoCpf;
  let campoTelefone;

  // Estado simples em memória
  let pacientesCache = [];

  // -----------------------------
  // Inicialização pública
  // -----------------------------
  function init() {
    console.log("🟢 PRONTIO DEV :: Pacientes.init()");

    // Pega elementos do DOM
    inputBusca         = document.getElementById("buscaPaciente");
    selectFiltroAtivo  = document.getElementById("filtroAtivo");
    btnNovoPaciente    = document.getElementById("btnNovoPaciente");
    listaPacientesEl   = document.getElementById("listaPacientes");
    painelPacienteEl   = document.getElementById("painelPaciente");
    backdropPacienteEl = document.getElementById("backdropPaciente");
    tituloFormularioEl = document.getElementById("tituloFormulario");
    formPacienteEl     = document.getElementById("paciente-form");
    mensagemStatusEl   = document.getElementById("mensagemStatus");

    if (!listaPacientesEl) {
      console.error("❌ PRONTIO DEV :: Elemento #listaPacientes não encontrado.");
      return;
    }

    // Monta campos básicos do formulário DEV se estiver vazio
    montarFormularioDev_();

    // Liga eventos
    registrarEventos_();

    // Carrega lista inicial
    carregarPacientes_()
      .catch(err => {
        console.error("❌ PRONTIO DEV :: Erro ao carregar pacientes DEV:", err);
        mostrarMensagemStatus_("Erro ao carregar pacientes DEV: " + err.message, true);
      });
  }

  // -----------------------------
  // Montagem do formulário (DEV)
  // -----------------------------
  function montarFormularioDev_() {
    if (!formPacienteEl) return;

    // Se o formulário já tem conteúdo (produção), não mexe
    if (formPacienteEl.innerHTML.trim() !== "") {
      console.log("PRONTIO DEV :: Formulário já possui campos, não vou sobrescrever.");
      // Mesmo assim, tenta mapear campos esperados
      campoIdPaciente   = document.getElementById("idPaciente");
      campoNomeCompleto = document.getElementById("nomeCompleto");
      campoCpf          = document.getElementById("cpf");
      campoTelefone     = document.getElementById("telefone");
      return;
    }

    console.log("PRONTIO DEV :: Montando formulário mínimo DEV para testes.");

    formPacienteEl.innerHTML = `
      <input type="hidden" id="idPaciente">

      <div class="form-group">
        <label for="nomeCompleto">Nome completo</label>
        <input type="text" id="nomeCompleto" required placeholder="Nome do paciente (DEV)">
      </div>

      <div class="form-group">
        <label for="cpf">CPF</label>
        <input type="text" id="cpf" placeholder="000.000.000-00">
      </div>

      <div class="form-group">
        <label for="telefone">Telefone</label>
        <input type="text" id="telefone" placeholder="(00) 00000-0000">
      </div>

      <div class="form-actions">
        <button type="button" id="btnSalvarPaciente" class="btn btn-primary">
          Salvar paciente (DEV)
        </button>
        <button type="button" id="btnCancelarPaciente" class="btn btn-secondary">
          Cancelar
        </button>
      </div>
    `;

    // Re-referenciar campos
    campoIdPaciente   = document.getElementById("idPaciente");
    campoNomeCompleto = document.getElementById("nomeCompleto");
    campoCpf          = document.getElementById("cpf");
    campoTelefone     = document.getElementById("telefone");

    const btnSalvarPaciente   = document.getElementById("btnSalvarPaciente");
    const btnCancelarPaciente = document.getElementById("btnCancelarPaciente");

    if (btnSalvarPaciente) {
      btnSalvarPaciente.addEventListener("click", function () {
        salvarPaciente_();
      });
    }

    if (btnCancelarPaciente) {
      btnCancelarPaciente.addEventListener("click", function () {
        fecharDrawer_();
      });
    }
  }

  // -----------------------------
  // Eventos
  // -----------------------------
  function registrarEventos_() {
    if (inputBusca) {
      inputBusca.addEventListener("input", debounce_(function () {
        carregarPacientes_();
      }, 300));
    }

    if (selectFiltroAtivo) {
      selectFiltroAtivo.addEventListener("change", function () {
        carregarPacientes_();
      });
    }

    if (btnNovoPaciente) {
      btnNovoPaciente.addEventListener("click", function () {
        novoPaciente_();
      });
    }

    if (backdropPacienteEl) {
      backdropPacienteEl.addEventListener("click", function () {
        fecharDrawer_();
      });
    }

    const btnFecharDrawer = document.getElementById("btnFecharDrawer");
    if (btnFecharDrawer) {
      btnFecharDrawer.addEventListener("click", function () {
        fecharDrawer_();
      });
    }
  }

  // -----------------------------
  // Carregamento de pacientes
  // -----------------------------
  async function carregarPacientes_() {
    mostrarMensagemStatus_("Carregando pacientes DEV...", false);

    const termo  = inputBusca ? inputBusca.value.trim() : "";
    const status = selectFiltroAtivo ? selectFiltroAtivo.value : "S";

    let filtros = {
      termo,
      status
    };

    console.log("PRONTIO DEV :: Chamando PRONTIO.Pacientes.listar com filtros =", filtros);

    const resp = await PRONTIO.Pacientes.listar(filtros);

    console.log("PRONTIO DEV :: Resposta pacientes-listar =", resp);

    // Backend devolve { ok, action, data }
    let lista = [];

    if (Array.isArray(resp.data)) {
      lista = resp.data;
    } else if (resp.data && Array.isArray(resp.data.pacientes)) {
      lista = resp.data.pacientes;
    } else if (Array.isArray(resp.lista)) {
      lista = resp.lista;
    } else {
      console.warn("PRONTIO DEV :: Formato de resposta inesperado, tentando tratar", resp);
    }

    pacientesCache = lista || [];
    renderizarListaPacientes_();

    mostrarMensagemStatus_("Pacientes DEV carregados (" + pacientesCache.length + ")", false);
  }

  // -----------------------------
  // Renderização da lista
  // -----------------------------
  function renderizarListaPacientes_() {
    if (!listaPacientesEl) return;

    if (!pacientesCache || pacientesCache.length === 0) {
      listaPacientesEl.innerHTML = `
        <div class="lista-vazia">
          Nenhum paciente encontrado no ambiente DEV.
        </div>
      `;
      return;
    }

    const html = pacientesCache.map(function (pac) {
      const nome  = pac.nomeCompleto || pac.NomeCompleto || pac.nome || "(sem nome)";
      const tel   = pac.telefone || pac.Telefone || "";
      const id    = pac.idPaciente || pac.ID_Paciente || pac.id || "";
      const ativo = pac.ativo || pac.Ativo || "S";

      return `
        <div class="paciente-item" data-id="${id}">
          <div class="paciente-main">
            <div class="paciente-nome">${escapeHtml_(nome)}</div>
            <div class="paciente-info">
              <span>${escapeHtml_(tel)}</span>
              <span class="badge-status badge-status-${ativo === "S" ? "ativo" : "inativo"}">
                ${ativo === "S" ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>
          <div class="paciente-acoes">
            <button type="button" class="btn-link btn-prontuario" data-id="${id}">
              Prontuário (DEV)
            </button>
            <button type="button" class="btn-link btn-editar" data-id="${id}">
              Editar (DEV)
            </button>
          </div>
        </div>
      `;
    }).join("");

    listaPacientesEl.innerHTML = html;

    // Eventos dos botões de ação
    listaPacientesEl.querySelectorAll(".btn-editar").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        editarPacientePorId_(id);
      });
    });

    listaPacientesEl.querySelectorAll(".btn-prontuario").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        abrirProntuarioDev_(id);
      });
    });
  }

  // -----------------------------
  // Novo / Editar Paciente
  // -----------------------------
  function novoPaciente_() {
    if (tituloFormularioEl) {
      tituloFormularioEl.textContent = "Novo paciente (DEV)";
    }
    if (campoIdPaciente) campoIdPaciente.value = "";
    if (campoNomeCompleto) campoNomeCompleto.value = "";
    if (campoCpf) campoCpf.value = "";
    if (campoTelefone) campoTelefone.value = "";

    abrirDrawer_();
  }

  function editarPacientePorId_(id) {
    const pac = pacientesCache.find(function (p) {
      return (p.idPaciente || p.ID_Paciente || p.id || "").toString() === id.toString();
    });

    if (!pac) {
      alert("Paciente não encontrado no cache DEV.");
      return;
    }

    if (tituloFormularioEl) {
      tituloFormularioEl.textContent = "Editar paciente (DEV)";
    }

    if (campoIdPaciente) {
      campoIdPaciente.value = pac.idPaciente || pac.ID_Paciente || pac.id || "";
    }
    if (campoNomeCompleto) {
      campoNomeCompleto.value = pac.nomeCompleto || pac.NomeCompleto || pac.nome || "";
    }
    if (campoCpf) {
      campoCpf.value = pac.cpf || pac.CPF || "";
    }
    if (campoTelefone) {
      campoTelefone.value = pac.telefone || pac.Telefone || "";
    }

    abrirDrawer_();
  }

  // -----------------------------
  // Salvar Paciente (DEV)
  // -----------------------------
  async function salvarPaciente_() {
    if (!campoNomeCompleto) {
      alert("Campo 'Nome completo' não encontrado no formulário DEV.");
      return;
    }

    const nomeCompleto = campoNomeCompleto.value.trim();
    const cpf          = campoCpf ? campoCpf.value.trim() : "";
    const telefone     = campoTelefone ? campoTelefone.value.trim() : "";
    const idPaciente   = campoIdPaciente ? campoIdPaciente.value.trim() : "";

    if (!nomeCompleto) {
      alert("Preencha o nome do paciente.");
      campoNomeCompleto.focus();
      return;
    }

    const pacientePayload = {
      idPaciente,
      nomeCompleto,
      cpf,
      telefone
    };

    console.log("PRONTIO DEV :: Salvando paciente DEV:", pacientePayload);
    mostrarMensagemStatus_("Salvando paciente (DEV)...", false);

    try {
      const resp = await PRONTIO.Pacientes.salvar(pacientePayload);
      console.log("PRONTIO DEV :: Resposta pacientes-salvar =", resp);

      if (!resp.ok) {
        throw new Error(resp.erro || "Erro ao salvar paciente DEV.");
      }

      mostrarMensagemStatus_("Paciente DEV salvo com sucesso!", false);

      // Recarrega lista
      await carregarPacientes_();
      fecharDrawer_();

    } catch (err) {
      console.error("❌ PRONTIO DEV :: Erro ao salvar paciente DEV:", err);
      mostrarMensagemStatus_("Erro ao salvar paciente DEV: " + err.message, true);
      alert("Erro ao salvar paciente DEV:\n" + err.message);
    }
  }

  // -----------------------------
  // Prontuário DEV (apenas log)
  // -----------------------------
  async function abrirProntuarioDev_(idPaciente) {
    console.log("PRONTIO DEV :: Abrindo prontuário DEV para idPaciente =", idPaciente);

    try {
      const resp = await PRONTIO.Prontuario.listarPorPaciente(idPaciente);
      console.log("PRONTIO DEV :: Prontuário do paciente", idPaciente, "=>", resp);

      alert("Veja o prontuário DEV no console do navegador (F12).");
    } catch (err) {
      console.error("❌ PRONTIO DEV :: Erro ao listar prontuário DEV:", err);
      alert("Erro ao listar prontuário DEV:\n" + err.message);
    }
  }

  // -----------------------------
  // Drawer (abrir/fechar)
  // -----------------------------
  function abrirDrawer_() {
    if (painelPacienteEl) {
      painelPacienteEl.classList.add("is-open");
    }
    if (backdropPacienteEl) {
      backdropPacienteEl.classList.add("is-visible");
    }
  }

  function fecharDrawer_() {
    if (painelPacienteEl) {
      painelPacienteEl.classList.remove("is-open");
    }
    if (backdropPacienteEl) {
      backdropPacienteEl.classList.remove("is-visible");
    }
  }

  // -----------------------------
  // UI: mensagem de status
  // -----------------------------
  function mostrarMensagemStatus_(texto, isErro) {
    if (!mensagemStatusEl) return;

    mensagemStatusEl.textContent = texto || "";
    mensagemStatusEl.hidden = !texto;

    mensagemStatusEl.classList.remove("status-erro", "status-ok");

    if (texto) {
      mensagemStatusEl.classList.add(isErro ? "status-erro" : "status-ok");
    }
  }

  // -----------------------------
  // Utils
  // -----------------------------
  function debounce_(fn, delay) {
    let timer;
    return function () {
      const args = arguments;
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(null, args), delay);
    };
  }

  function escapeHtml_(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // -----------------------------
  // Exposição pública
  // -----------------------------
  return {
    init
  };

})();

// Pequeno helper de debug global
window.PRONTIO_DEV_DEBUG = window.PRONTIO_DEV_DEBUG || {};
window.PRONTIO_DEV_DEBUG.pacientes = {
  recarregar: function () {
    if (PRONTIO?.Modules?.Pacientes && typeof PRONTIO.Modules.Pacientes.init === "function") {
      PRONTIO.Modules.Pacientes.init();
    }
  }
};

console.log("🟢 PRONTIO DEV :: pacientes-dev.js carregado.");
