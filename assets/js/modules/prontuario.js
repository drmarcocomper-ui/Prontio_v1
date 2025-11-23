/******************************************************
 * PRONTIO – Módulo: Prontuário
 * Timeline + Filtros + Ações Rápidas
 *
 * Arquitetura nova:
 * PRONTIO.Modules.Prontuario.init()
 *
 * Compatibilidade garantida:
 * - Nenhuma função antiga quebra
 ******************************************************/

window.PRONTIO = window.PRONTIO || {};
PRONTIO.Modules = PRONTIO.Modules || {};

PRONTIO.Modules.Prontuario = (() => {

  /* ============================================================
     ESTADO
  ============================================================ */

  let registrosTimeline = [];

  /* ============================================================
     1. CARREGAR PACIENTE DO STORAGE
  ============================================================ */

  function carregarPaciente() {
    const paciente = PRONTIO.Storage.carregarPacienteSelecionado();

    const nomeEl = document.getElementById("nomePaciente");
    const idEl = document.getElementById("idPaciente");
    const dadosEl = document.getElementById("dadosPacienteComplementares");

    if (!paciente) {
      nomeEl.textContent = "Paciente não selecionado";
      idEl.textContent = "ID: —";
      dadosEl.textContent = "Telefone: — | Idade: —";
      return null;
    }

    nomeEl.textContent = paciente.nome || "Sem nome";
    idEl.textContent = `ID: ${paciente.id || "-"}`;
    dadosEl.textContent = `Telefone: ${paciente.telefone || "-"} | Idade: ${
      paciente.idade || "-"
    }`;

    return paciente;
  }

  /* ============================================================
     2. AÇÕES RÁPIDAS
  ============================================================ */

  function configurarAcoesRapidas() {
    const map = [
      ["btnNovaEvolucao", "evolucao.html"],
      ["btnNovaReceita", "receita.html"],
      ["btnNovoExame", "exames.html"],
      ["btnNovoLaudo", "laudo.html"],
      ["btnNovoAtestado", "atestado.html"],
      ["btnNovaDeclaracao", "comparecimento.html"],
      ["btnNovoEncaminhamento", "encaminhamento.html"],
    ];

    map.forEach(([id, href]) => {
      const btn = document.getElementById(id);
      if (btn) btn.onclick = () => (window.location.href = href);
    });
  }

  /* ============================================================
     3. PARSERS DE DATA (podem migrar para PRONTIO.Utils futuramente)
  ============================================================ */

  function parseDataBRParaDate(dataStr) {
    if (!dataStr) return null;
    const partes = dataStr.split(" ");
    const [dia, mes, ano] = partes[0].split("/");
    if (!dia || !mes || !ano) return null;

    let hora = 0,
      minuto = 0;
    if (partes[1]) {
      const [h, m] = partes[1].split(":");
      hora = parseInt(h || "0");
      minuto = parseInt(m || "0");
    }

    const d = new Date(ano, mes - 1, dia, hora, minuto);
    return isNaN(d.getTime()) ? null : d;
  }

  function parseDataISOInput(str) {
    if (!str) return null;
    const [ano, mes, dia] = str.split("-");
    const d = new Date(ano, mes - 1, dia);
    return isNaN(d.getTime()) ? null : d;
  }

  /* ============================================================
     4. TIMELINE
  ============================================================ */

  function gerarItemTimeline(item) {
    return `
      <article class="timeline-item" data-tipo="${item.tipo}">
        <div class="timeline-marker"></div>
        <div class="timeline-content">
          <div class="timeline-header">
            <span class="timeline-type badge-${item.tipo}">
              ${item.tipoTexto || "Registro"}
            </span>
            <span class="timeline-date">${item.data || ""}</span>
          </div>

          <h3 class="timeline-title">${item.titulo || ""}</h3>
          <p class="timeline-text">${item.texto || ""}</p>
        </div>
      </article>
    `;
  }

  function renderizarTimeline(lista) {
    const container = document.getElementById("timelineContainer");
    const vazio = document.getElementById("timelineEmptyMessage");

    if (!lista || lista.length === 0) {
      container.innerHTML = "";
      if (vazio) {
        vazio.style.display = "block";
        vazio.textContent = "Nenhum registro encontrado para este paciente.";
      }
      return;
    }

    if (vazio) vazio.style.display = "none";
    container.innerHTML = lista.map(gerarItemTimeline).join("");
  }

  /* ============================================================
     5. CARREGAR TIMELINE DO BACKEND
  ============================================================ */

  async function carregarTimeline(idPaciente) {
    const container = document.getElementById("timelineContainer");
    const vazio = document.getElementById("timelineEmptyMessage");

    if (!idPaciente) {
      registrosTimeline = [];
      container.innerHTML = "";
      vazio.textContent = "Paciente não selecionado.";
      vazio.style.display = "block";
      return;
    }

    vazio.textContent = "Carregando histórico...";
    vazio.style.display = "block";
    container.innerHTML = "";

    try {
      const registros = await PRONTIO.API.call({
        action: "listarProntuarioPorPaciente",
        idPaciente: idPaciente,
      });

      registrosTimeline = Array.isArray(registros) ? registros : [];

      registrosTimeline.forEach((r) => {
        r._dataObj = r.data ? parseDataBRParaDate(r.data) : null;
      });

      if (registrosTimeline.length === 0) {
        vazio.textContent = "Nenhum registro encontrado para este paciente.";
        vazio.style.display = "block";
        return;
      }

      vazio.style.display = "none";
      aplicarFiltrosCombinados();
    } catch (erro) {
      console.error(erro);
      vazio.textContent = "Erro ao carregar histórico.";
      vazio.style.display = "block";
    }
  }

  /* ============================================================
     6. FILTROS COMBINADOS
  ============================================================ */

  function obterTipoFiltro() {
    const ativo = document.querySelector(".filter-btn.active");
    return ativo ? ativo.dataset.filter : "todos";
  }

  function aplicarFiltrosCombinados() {
    const texto = (document.getElementById("filtroTexto")?.value || "")
      .trim()
      .toLowerCase();

    const dataDe = parseDataISOInput(
      document.getElementById("filtroDataDe")?.value
    );
    const dataAteBase = parseDataISOInput(
      document.getElementById("filtroDataAte")?.value
    );

    let dataAte = null;
    if (dataAteBase) {
      dataAte = new Date(dataAteBase);
      dataAte.setHours(23, 59, 59, 999);
    }

    const tipo = obterTipoFiltro();

    let filtrados = registrosTimeline.slice();

    // Tipo
    if (tipo !== "todos") filtrados = filtrados.filter((i) => i.tipo === tipo);

    // Texto
    if (texto.length >= 2) {
      filtrados = filtrados.filter((i) => {
        const campo =
          (i.titulo || "").toLowerCase() + " " + (i.texto || "").toLowerCase();
        return campo.includes(texto);
      });
    }

    // Datas
    if (dataDe || dataAte) {
      filtrados = filtrados.filter((i) => {
        if (!i._dataObj) return false;
        if (dataDe && i._dataObj < dataDe) return false;
        if (dataAte && i._dataObj > dataAte) return false;
        return true;
      });
    }

    renderizarTimeline(filtrados);
  }

  function configurarFiltros() {
    const botoes = document.querySelectorAll(".filter-btn");
    botoes.forEach((btn) =>
      btn.addEventListener("click", () => {
        botoes.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        aplicarFiltrosCombinados();
      })
    );

    document.getElementById("filtroTexto")?.addEventListener(
      "input",
      aplicarFiltrosCombinados
    );

    document.getElementById("filtroDataDe")?.addEventListener(
      "change",
      aplicarFiltrosCombinados
    );

    document.getElementById("filtroDataAte")?.addEventListener(
      "change",
      aplicarFiltrosCombinados
    );

    document.getElementById("btnLimparFiltros")?.addEventListener("click", () => {
      document.getElementById("filtroTexto").value = "";
      document.getElementById("filtroDataDe").value = "";
      document.getElementById("filtroDataAte").value = "";

      const todosBtn = document.querySelector('.filter-btn[data-filter="todos"]');
      if (todosBtn) {
        botoes.forEach((b) => b.classList.remove("active"));
        todosBtn.classList.add("active");
      }

      aplicarFiltrosCombinados();
    });

    document.getElementById("btnImprimirHistorico")?.addEventListener("click", () =>
      window.print()
    );
  }

  /* ============================================================
     7. INICIALIZAÇÃO DO MÓDULO
  ============================================================ */

  function init() {
    const paciente = carregarPaciente();
    configurarAcoesRapidas();
    configurarFiltros();

    const id = paciente?.id || null;
    carregarTimeline(id);
  }

  return { init };
})();

/* ============================================================
   WRAPPER DE COMPATIBILIDADE (para HTML antigo)
============================================================ */
window.Prontuario = PRONTIO.Modules.Prontuario;
