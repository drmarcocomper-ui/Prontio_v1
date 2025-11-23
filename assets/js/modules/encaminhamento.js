/******************************************************
 * PRONTIO – Módulo: Encaminhamento
 * Fluxo:
 * 1. Carrega paciente do Storage
 * 2. Carrega lista de profissionais (ProfissionaisDestino)
 * 3. Preenche formulário
 * 4. Salva no backend (encaminhamento-salvar)
 * 5. Lista histórico (encaminhamentos-por-paciente)
 ******************************************************/

window.PRONTIO = window.PRONTIO || {};
PRONTIO.Modules = PRONTIO.Modules || {};

PRONTIO.Modules.Encaminhamento = (function () {

  /* ============================================================
     Estado
  ============================================================ */
  let pacienteAtual = null;
  let profissionais = [];

  /* ============================================================
     Inicialização da página
  ============================================================ */
  function init() {
    carregarPaciente();
    carregarProfissionais();
    registrarEventos();
    carregarHistorico();
  }

  /* ============================================================
     PACIENTE SELECIONADO
  ============================================================ */
  function carregarPaciente() {
    pacienteAtual = PRONTIO.Storage.carregarPacienteSelecionado();
    const nomeEl = document.getElementById("pacienteNome");
    const idEl = document.getElementById("pacienteID");
    const telEl = document.getElementById("pacienteTelefone");

    if (!pacienteAtual) {
      nomeEl.textContent = "Paciente não selecionado";
      idEl.textContent = "ID: —";
      telEl.textContent = "—";
      return;
    }

    nomeEl.textContent = pacienteAtual.nome;
    idEl.textContent = pacienteAtual.id;
    telEl.textContent = pacienteAtual.telefone;
  }

  /* ============================================================
     CARREGAR LISTA DE PROFISSIONAIS (aba ProfissionaisDestino)
  ============================================================ */
  async function carregarProfissionais() {
    try {
      const data = await PRONTIO.API.call({
        action: "profissionaisdestino-listar"   // você cria no backend se quiser
      });

      profissionais = data.profissionais || [];

      const select = document.getElementById("profissionalSelect");
      select.innerHTML = `<option value="">Selecione...</option>`;

      profissionais.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.ID_Profissional || p.id || "";
        opt.textContent = p.Nome || p.nome || "Sem nome";
        select.appendChild(opt);
      });

    } catch (err) {
      console.error(err);
      PRONTIO.UI.showToast("Erro ao carregar profissionais.", "erro");
    }
  }

  /* Quando um profissional é selecionado, preencher os campos automaticamente */
  function preencherProfissional(idProf) {
    const prof = profissionais.find(p =>
      String(p.ID_Profissional) === String(idProf)
    );

    if (!prof) return;

    document.getElementById("especialidadeDestino").value =
      prof.Especialidade || "";

    document.getElementById("telefoneDestino").value =
      prof.Telefone || "";

    document.getElementById("localDestino").value =
      prof.Local || "";
  }

  /* ============================================================
     REGISTRAR EVENTOS
  ============================================================ */
  function registrarEventos() {
    document.getElementById("profissionalSelect")
      .addEventListener("change", e => preencherProfissional(e.target.value));

    document.getElementById("btnSalvarEnc")
      .addEventListener("click", salvarEncaminhamento);

    document.getElementById("btnImprimirEnc")
      .addEventListener("click", () =>
        PRONTIO.Print.imprimir(".page-section--card")
      );
  }

  /* ============================================================
     SALVAR ENCAMINHAMENTO
  ============================================================ */
  async function salvarEncaminhamento() {
    if (!pacienteAtual) {
      PRONTIO.UI.showToast("Selecione um paciente.", "erro");
      return;
    }

    const payload = {
      ID_Paciente: pacienteAtual.id,
      Nome_Paciente: pacienteAtual.nome,
      Data: document.getElementById("encData").value,
      Hora: document.getElementById("encHora").value,
      Nome_Profissional_Destino: document.getElementById("profissionalSelect").selectedOptions[0]?.text || "",
      Especialidade_Destino: document.getElementById("especialidadeDestino").value,
      Telefone_Destino: document.getElementById("telefoneDestino").value,
      Local_Destino: document.getElementById("localDestino").value,
      Observacoes: document.getElementById("encObservacoes").value
    };

    try {
      await PRONTIO.API.call({
        action: "encaminhamento-salvar",
        dados: payload
      });

      PRONTIO.UI.showToast("Encaminhamento salvo!", "sucesso");
      carregarHistorico();

    } catch (err) {
      console.error(err);
      PRONTIO.UI.showToast("Erro ao salvar encaminhamento.", "erro");
    }
  }

  /* ============================================================
     HISTÓRICO DO PACIENTE
  ============================================================ */
  async function carregarHistorico() {
    const cont = document.getElementById("historicoEncaminhamento");

    if (!pacienteAtual) {
      cont.innerHTML = "<p>Paciente não selecionado.</p>";
      return;
    }

    cont.innerHTML = "Carregando...";

    try {
      const data = await PRONTIO.API.call({
        action: "encaminhamentos-por-paciente",
        idPaciente: pacienteAtual.id
      });

      const lista = data.encaminhamentos || [];

      if (!lista.length) {
        cont.innerHTML = "<p>Nenhum encaminhamento registrado.</p>";
        return;
      }

      cont.innerHTML = lista.map(item => `
        <div class="historico-item">
          <div><strong>${item.Data}</strong> — ${item.Hora}</div>
          <div><strong>Profissional:</strong> ${item.Nome_Profissional_Destino}</div>
          <div><strong>Especialidade:</strong> ${item.Especialidade_Destino}</div>
          <div><strong>Local:</strong> ${item.Local_Destino}</div>
          <div class="hist-observ">Obs: ${item.Observacoes || "—"}</div>
          <hr>
        </div>
      `).join("");

    } catch (err) {
      console.error(err);
      cont.innerHTML = "<p>Erro ao carregar histórico.</p>";
    }
  }

  /* ============================================================
     API pública do módulo
  ============================================================ */
  return { init };

})();
