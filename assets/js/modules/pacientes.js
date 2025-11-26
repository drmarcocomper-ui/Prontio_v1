/******************************************************
 * PRONTIO – módulos/pacientes.js
 * Lógica da tela de Pacientes (frontend)
 ******************************************************/

window.PRONTIO = window.PRONTIO || {};
PRONTIO.Modules = PRONTIO.Modules || {};

(function () {
  // AGORA usando PRONTIO.API (maiúsculo), coerente com api.js
  const PacientesApi = (PRONTIO.API && PRONTIO.API.Pacientes) || null;

  const state = {
    carregando: false,
    pacientes: [],
    filtros: {
      busca: "",
      ativo: "S"
    }
  };

  // Referências DOM
  let elLista;
  let elBusca;
  let elFiltroAtivo;
  let elBtnNovo;
  let elDrawer;
  let elBackdrop;
  let elBtnFecharDrawer;
  let elBtnCancelar;
  let elForm;
  let elTituloForm;
  let elMensagemStatus;

  function init() {
    console.log("PRONTIO.Modules.Pacientes :: init()");

    if (!PacientesApi) {
      console.error("PRONTIO.Modules.Pacientes :: PacientesApi não encontrado. Verifique /assets/js/core/api.js");
      return;
    }

    cacheElements();
    bindEvents();
    carregarLista();
  }

  function cacheElements() {
    elLista          = document.getElementById("listaPacientes");
    elBusca          = document.getElementById("buscaPaciente");
    elFiltroAtivo    = document.getElementById("filtroAtivo");
    elBtnNovo        = document.getElementById("btnNovoPaciente");
    elDrawer         = document.getElementById("painelPaciente");
    elBackdrop       = document.getElementById("backdropPaciente");
    elBtnFecharDrawer= document.getElementById("btnFecharDrawer");
    elBtnCancelar    = document.getElementById("btnCancelarPaciente");
    elForm           = document.getElementById("paciente-form");
    elTituloForm     = document.getElementById("tituloFormulario");
    elMensagemStatus = document.getElementById("mensagemStatus");
  }

  function bindEvents() {
    if (elBusca) {
      elBusca.addEventListener("input", onBuscaChange);
    }

    if (elFiltroAtivo) {
      elFiltroAtivo.addEventListener("change", onFiltroAtivoChange);
    }

    if (elBtnNovo) {
      elBtnNovo.addEventListener("click", onNovoPaciente);
    }

    if (elBtnFecharDrawer) {
      elBtnFecharDrawer.addEventListener("click", fecharDrawer);
    }

    if (elBackdrop) {
      elBackdrop.addEventListener("click", fecharDrawer);
    }

    if (elBtnCancelar) {
      elBtnCancelar.addEventListener("click", fecharDrawer);
    }

    if (elForm) {
      elForm.addEventListener("submit", onSubmitForm);
    }
  }

  /* ===================== Eventos ===================== */

  let buscaTimeout = null;
  function onBuscaChange(e) {
    const valor = e.target.value || "";
    state.filtros.busca = valor;

    if (buscaTimeout) clearTimeout(buscaTimeout);
    buscaTimeout = setTimeout(() => {
      carregarLista();
    }, 300);
  }

  function onFiltroAtivoChange(e) {
    const valor = e.target.value || "S";
    state.filtros.ativo = valor;
    carregarLista();
  }

  function onNovoPaciente() {
    abrirDrawerNovo();
  }

  async function onSubmitForm(e) {
    e.preventDefault();
    setMensagemStatus("", false);

    try {
      const dados = coletarDadosFormulario();
      console.log("PRONTIO.Pacientes :: salvando paciente", dados);

      const pacienteSalvo = await PacientesApi.salvar(dados);

      setMensagemStatus("Paciente salvo com sucesso.", true);

      const campoId = document.getElementById("idPaciente");
      if (campoId && pacienteSalvo && pacienteSalvo.ID_Paciente) {
        campoId.value = pacienteSalvo.ID_Paciente;
      }

      await carregarLista();
    } catch (err) {
      console.error("Erro ao salvar paciente:", err);
      setMensagemStatus(err.message || "Erro ao salvar paciente.", false);
    }
  }

  /* ============ Carregamento / Lista ============ */

  async function carregarLista() {
    if (!elLista) return;
    if (state.carregando) return;

    state.carregando = true;
    elLista.innerHTML = `<div class="lista-pacientes-loading">Carregando pacientes...</div>`;

    try {
      const filtros = {
        busca: state.filtros.busca || "",
        ativo: state.filtros.ativo || "S"
      };

      const pacientes = await PacientesApi.listar(filtros);
      state.pacientes = pacientes || [];

      renderLista();
    } catch (err) {
      console.error("Erro ao carregar lista de pacientes:", err);
      elLista.innerHTML = `<div class="lista-pacientes-erro">Erro ao carregar pacientes: ${err.message || err}</div>`;
    } finally {
      state.carregando = false;
    }
  }

  function renderLista() {
    if (!elLista) return;

    const pacientes = state.pacientes || [];

    if (!pacientes.length) {
      elLista.innerHTML = `
        <div class="lista-pacientes-vazia">
          Nenhum paciente encontrado.
        </div>
      `;
      return;
    }

    const html = pacientes.map(p => criarCardPacienteHtml(p)).join("");
    elLista.innerHTML = html;

    const botoesEditar = elLista.querySelectorAll("[data-action='editar-paciente']");
    botoesEditar.forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const paciente = pacientes.find(px => String(px.ID_Paciente) === String(id));
        if (paciente) {
          abrirDrawerEditar(paciente);
        }
      });
    });

    const botoesProntuario = elLista.querySelectorAll("[data-action='abrir-prontuario']");
    botoesProntuario.forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        console.log("Abrir prontuário para paciente:", id);
      });
    });
  }

  function criarCardPacienteHtml(p) {
    const id   = p.ID_Paciente || "";
    const nome = p.NomePaciente || "Paciente sem nome";
    const cpf  = p.CPF || "";
    const tel1 = p.Telefone1 || "";
    const tel2 = p.Telefone2 || "";
    const email = p.Email || "";
    const plano = p.PlanoSaude || p.Plano || p.planoSaude || "";
    const dataUltima = p.DataUltimaConsulta || "";

    const contatos = [cpf, tel1, tel2, email].filter(Boolean).join(" • ");
    const ativoFlag = (p.Ativo || "S") === "S";
    const labelStatus = ativoFlag ? "Ativo" : "Inativo";

    return `
      <article class="paciente-item" data-id="${id}">
        <div class="paciente-main">
          <h3 class="paciente-nome">${nome}</h3>
          <div class="paciente-contatos">${contatos || "Sem contatos cadastrados"}</div>
          <div class="paciente-extra">
            ${plano ? `<span class="paciente-plano">Plano: ${plano}</span>` : ""}
            ${dataUltima ? `<span class="paciente-ultima">Última consulta: ${dataUltima}</span>` : ""}
          </div>
        </div>
        <div class="paciente-meta">
          <span class="paciente-status paciente-status-${ativoFlag ? "ativo" : "inativo"}">
            ${labelStatus}
          </span>
          <div class="paciente-acoes">
            <button type="button"
                    class="btn btn-secundario btn-sm"
                    data-action="abrir-prontuario"
                    data-id="${id}">
              Prontuário
            </button>
            <button type="button"
                    class="btn btn-ghost btn-sm"
                    data-action="editar-paciente"
                    data-id="${id}">
              Editar
            </button>
          </div>
        </div>
      </article>
    `;
  }

  /* ============ Drawer / Formulário ============ */

  function abrirDrawerNovo() {
    resetFormulario();
    if (elTituloForm) elTituloForm.textContent = "Novo paciente";
    mostrarDrawer(true);
  }

  function abrirDrawerEditar(p) {
    preencherFormulario(p);
    if (elTituloForm) elTituloForm.textContent = "Editar paciente";
    mostrarDrawer(true);
  }

  function mostrarDrawer(ativo) {
    if (!elDrawer) return;
    if (ativo) {
      elDrawer.classList.add("aberto");
      if (elBackdrop) elBackdrop.classList.add("visivel");
    } else {
      elDrawer.classList.remove("aberto");
      if (elBackdrop) elBackdrop.classList.remove("visivel");
    }
  }

  function fecharDrawer() {
    mostrarDrawer(false);
  }

  function resetFormulario() {
    if (!elForm) return;
    elForm.reset();

    const campoId = document.getElementById("idPaciente");
    if (campoId) campoId.value = "";

    const campoAtivo = document.getElementById("ativo");
    if (campoAtivo) campoAtivo.value = "S";

    setMensagemStatus("", false);
  }

  function preencherFormulario(p) {
    if (!elForm || !p) return;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val != null ? String(val) : "";
    };

    setVal("idPaciente",          p.ID_Paciente || "");
    setVal("nomePaciente",        p.NomePaciente || "");
    setVal("dataNascimento",      p.DataNascimento || "");
    setVal("sexo",                p.Sexo || "");
    setVal("cpf",                 p.CPF || "");
    setVal("rg",                  p.RG || "");
    setVal("telefone1",           p.Telefone1 || "");
    setVal("telefone2",           p.Telefone2 || "");
    setVal("email",               p.Email || "");
    setVal("enderecoRua",         p.EnderecoRua || "");
    setVal("enderecoNumero",      p.EnderecoNumero || "");
    setVal("enderecoBairro",      p.EnderecoBairro || "");
    setVal("enderecoCidade",      p.EnderecoCidade || "");
    setVal("enderecoUF",          p.EnderecoUF || "");
    setVal("enderecoCEP",         p.EnderecoCEP || "");
    setVal("alergias",            p.Alergias || "");
    setVal("medicacoesEmUso",     p.MedicacoesEmUso || "");
    setVal("doencasCronicas",     p.DoencasCronicas || "");
    setVal("obsImportantes",      p.ObsImportantes || "");
    setVal("planoSaude",          p.PlanoSaude || "");
    setVal("numeroCarteirinha",   p.NumeroCarteirinha || "");
    setVal("validadeCarteirinha", p.ValidadeCarteirinha || "");
    setVal("dataUltimaConsulta",  p.DataUltimaConsulta || "");
    setVal("ativo",               p.Ativo || "S");
  }

  function coletarDadosFormulario() {
    const getVal = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : "";
    };

    return {
      ID_Paciente:        getVal("idPaciente") || undefined,
      NomePaciente:       getVal("nomePaciente"),
      DataNascimento:     getVal("dataNascimento"),
      Sexo:               getVal("sexo"),
      CPF:                getVal("cpf"),
      RG:                 getVal("rg"),
      Telefone1:          getVal("telefone1"),
      Telefone2:          getVal("telefone2"),
      Email:              getVal("email"),
      EnderecoRua:        getVal("enderecoRua"),
      EnderecoNumero:     getVal("enderecoNumero"),
      EnderecoBairro:     getVal("enderecoBairro"),
      EnderecoCidade:     getVal("enderecoCidade"),
      EnderecoUF:         getVal("enderecoUF"),
      EnderecoCEP:        getVal("enderecoCEP"),
      Alergias:           getVal("alergias"),
      MedicacoesEmUso:    getVal("medicacoesEmUso"),
      DoencasCronicas:    getVal("doencasCronicas"),
      ObsImportantes:     getVal("obsImportantes"),
      PlanoSaude:         getVal("planoSaude"),
      NumeroCarteirinha:  getVal("numeroCarteirinha"),
      ValidadeCarteirinha:getVal("validadeCarteirinha"),
      Ativo:              getVal("ativo") || "S",
      DataUltimaConsulta: getVal("dataUltimaConsulta")
    };
  }

  function setMensagemStatus(msg, sucesso) {
    if (!elMensagemStatus) return;

    if (!msg) {
      elMensagemStatus.textContent = "";
      elMensagemStatus.hidden = true;
      elMensagemStatus.classList.remove("status-sucesso", "status-erro");
      return;
    }

    elMensagemStatus.textContent = msg;
    elMensagemStatus.hidden = false;
    elMensagemStatus.classList.toggle("status-sucesso", !!sucesso);
    elMensagemStatus.classList.toggle("status-erro", !sucesso);
  }

  PRONTIO.Modules.Pacientes = {
    init
  };
})();
