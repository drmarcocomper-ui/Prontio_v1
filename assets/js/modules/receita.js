"use strict";

/******************************************************
 * PRONTIO – Módulo: Receita
 * - Lê paciente selecionado do storage
 * - Monta receita com medicamentos
 * - Salva no backend
 * - Lista histórico de receitas
 * - (impressão básica, por enquanto)
 ******************************************************/

window.PRONTIO = window.PRONTIO || {};
PRONTIO.Modules = PRONTIO.Modules || {};

PRONTIO.Modules.Receita = (() => {
  let pacienteAtual = null;

  /* ============================================================
     Helpers internos
  ============================================================ */

  function toast(mensagem, tipo = "info") {
    // mapeia "error"/"success" antigos para "erro"/"sucesso"
    let t = tipo;
    if (tipo === "error") t = "erro";
    if (tipo === "success") t = "sucesso";
    PRONTIO.UI.showToast(mensagem, t);
  }

  function formatarDataHora(date) {
    try {
      const dia = String(date.getDate()).padStart(2, "0");
      const mes = String(date.getMonth() + 1).padStart(2, "0");
      const ano = date.getFullYear();
      const hora = String(date.getHours()).padStart(2, "0");
      const min = String(date.getMinutes()).padStart(2, "0");
      return `${dia}/${mes}/${ano} ${hora}:${min}`;
    } catch (e) {
      return "";
    }
  }

  /* ============================================================
     Paciente via PRONTIO.Storage
     Espera objeto salvo em PRONTIO.Storage.salvarPacienteSelecionado:
     { id, nome, telefone, idade, ... }
  ============================================================ */

  function carregarPacienteDoStorage() {
    const dados = PRONTIO.Storage.carregarPacienteSelecionado();

    const spanNome = document.getElementById("pacienteNome");
    const spanID = document.getElementById("pacienteID");
    const spanTel = document.getElementById("pacienteTelefone");

    if (!dados) {
      pacienteAtual = null;
      if (spanNome) spanNome.textContent = "Nenhum paciente selecionado";
      if (spanID) spanID.textContent = "–";
      if (spanTel) spanTel.textContent = "–";
      return;
    }

    pacienteAtual = dados;

    const id = dados.ID_Paciente || dados.id || "";
    const nome =
      dados.NomePaciente || dados.nome || "Paciente sem nome";
    const tel = dados.Telefone || dados.telefone || "–";

    if (spanNome) spanNome.textContent = nome;
    if (spanID) spanID.textContent = id || "–";
    if (spanTel) spanTel.textContent = tel;
  }

  /* ============================================================
     Botões
  ============================================================ */

  function configurarBotoesReceita() {
    const btnAddMedicamento = document.getElementById("btnAddMedicamento");
    const btnSalvarReceita = document.getElementById("btnSalvarReceita");
    const btnImprimirReceita = document.getElementById("btnImprimirReceita");

    if (btnAddMedicamento) {
      btnAddMedicamento.addEventListener("click", adicionarLinhaMedicamento);
    }

    if (btnSalvarReceita) {
      btnSalvarReceita.addEventListener("click", salvarReceita);
    }

    if (btnImprimirReceita) {
      btnImprimirReceita.addEventListener("click", imprimirReceitaBasica);
    }
  }

  /* ============================================================
     Adicionar linha de medicamento
  ============================================================ */

  function adicionarLinhaMedicamento() {
    const container = document.getElementById("listaMedicamentos");
    if (!container) return;

    const linha = document.createElement("div");
    linha.className = "medicamento-linha";

    linha.innerHTML = `
      <div>
        <label>Nome</label>
        <input type="text" class="med-nome" list="medicamentosDatalist" placeholder="Ex: Tadalafila 5 mg">
      </div>
      <div>
        <label>Posologia</label>
        <input type="text" class="med-posologia" placeholder="Ex: 1 cp ao dia">
      </div>
      <div>
        <label>Qtd.</label>
        <input type="text" class="med-quantidade" placeholder="Ex: 30 cp">
      </div>
      <div>
        <label>Via</label>
        <input type="text" class="med-via" placeholder="VO, IM, tópica...">
      </div>
      <button type="button" class="btn-remover">&times;</button>
    `;

    const btnRemover = linha.querySelector(".btn-remover");
    btnRemover.addEventListener("click", () => {
      container.removeChild(linha);
    });

    container.appendChild(linha);
  }

  /* ============================================================
     Montar texto da receita
  ============================================================ */

  function montarTextoReceita() {
    const tipoSelect = document.getElementById("tipoReceita");
    const obsTextarea = document.getElementById("receitaObs");
    const inputData = document.getElementById("receitaData");

    const tipoReceita = tipoSelect ? tipoSelect.value : "simples";
    const obs = obsTextarea ? obsTextarea.value.trim() : "";
    const dataEscolhida =
      inputData && inputData.value ? new Date(inputData.value) : new Date();

    const partes = [];

    const dataFormatada = formatarDataHora(dataEscolhida);
    partes.push(`Data: ${dataFormatada}`);
    partes.push(
      `Tipo: ${
        tipoReceita === "simples"
          ? "Simples"
          : tipoReceita === "antibiotico"
          ? "Antibiótico"
          : "Controle especial"
      }`
    );
    partes.push("");
    partes.push("Prescrição:");

    const linhas = document.querySelectorAll(".medicamento-linha");
    let count = 0;

    linhas.forEach((linha) => {
      const nome = linha.querySelector(".med-nome")?.value.trim() || "";
      const posologia =
        linha.querySelector(".med-posologia")?.value.trim() || "";
      const quantidade =
        linha.querySelector(".med-quantidade")?.value.trim() || "";
      const via = linha.querySelector(".med-via")?.value.trim() || "";

      if (!nome && !posologia && !quantidade && !via) return;

      count++;
      let item = `${count}) ${nome}`;
      if (posologia) item += ` – ${posologia}`;
      if (quantidade) item += ` – Qtde: ${quantidade}`;
      if (via) item += ` – Via: ${via}`;
      partes.push(item);
    });

    if (count === 0) {
      partes.push("(Nenhum medicamento informado)");
    }

    if (obs) {
      partes.push("");
      partes.push("Observações:");
      partes.push(obs);
    }

    return partes.join("\n");
  }

  /* ============================================================
     Salvar receita
     → usa PRONTIO.API.call com action 'receita-salvar'
  ============================================================ */

  async function salvarReceita() {
    if (!pacienteAtual) {
      toast("Selecione um paciente antes de salvar a receita.", "error");
      return;
    }

    const idPaciente =
      pacienteAtual.ID_Paciente || pacienteAtual.id || "";
    const nomePaciente =
      pacienteAtual.NomePaciente || pacienteAtual.nome || "";

    if (!idPaciente) {
      toast("Paciente sem ID. Verifique os dados do paciente.", "error");
      return;
    }

    const textoReceita = montarTextoReceita();
    if (
      !textoReceita ||
      textoReceita.includes("(Nenhum medicamento informado)")
    ) {
      toast(
        "Informe pelo menos um medicamento para salvar a receita.",
        "error"
      );
      return;
    }

    const dados = {
      ID_Paciente: idPaciente,
      NomePaciente: nomePaciente,
      Texto_Receita: textoReceita,
    };

    try {
      // backend deve responder no padrão { ok, data }
      await PRONTIO.API.call({
        action: "receita-salvar",
        dados,
      });

      toast("Receita salva com sucesso.", "success");
      limparFormularioReceita();
      carregarHistoricoReceitas();
    } catch (erro) {
      // PRONTIO.API.call já mostra toast de erro,
      // aqui apenas logamos:
      console.error("Erro ao salvar receita:", erro);
    }
  }

  /* ============================================================
     Limpar formulário
  ============================================================ */

  function limparFormularioReceita() {
    const lista = document.getElementById("listaMedicamentos");
    const obsTextarea = document.getElementById("receitaObs");
    const dataInput = document.getElementById("receitaData");
    const tipoSelect = document.getElementById("tipoReceita");

    if (lista) {
      lista.innerHTML = "";
      adicionarLinhaMedicamento();
    }

    if (obsTextarea) obsTextarea.value = "";
    if (dataInput) dataInput.value = "";
    if (tipoSelect) tipoSelect.value = "simples";
  }

  /* ============================================================
     Histórico de receitas
  ============================================================ */

  async function carregarHistoricoReceitas() {
    const container = document.getElementById("historicoReceitas");
    if (!container) return;

    if (!pacienteAtual) {
      container.innerHTML =
        `<div class="lista-historico-vazia">Nenhum paciente selecionado.</div>`;
      return;
    }

    const idPaciente =
      pacienteAtual.ID_Paciente || pacienteAtual.id || "";
    if (!idPaciente) {
      container.innerHTML =
        `<div class="lista-historico-vazia">Paciente sem ID. Não foi possível carregar o histórico.</div>`;
      return;
    }

    container.textContent = "Carregando…";

    try {
      const data = await PRONTIO.API.call({
        action: "receitas-por-paciente",
        idPaciente,
      });

      const receitas = data?.receitas || [];

      if (!receitas.length) {
        container.innerHTML =
          `<div class="lista-historico-vazia">Nenhuma receita registrada para este paciente.</div>`;
        return;
      }

      container.innerHTML = "";
      receitas.forEach((rec) => {
        const item = montarItemHistorico(rec);
        container.appendChild(item);
      });
    } catch (erro) {
      console.error("Erro ao listar receitas:", erro);
      container.innerHTML =
        `<div class="lista-historico-vazia">Falha ao carregar histórico de receitas.</div>`;
    }
  }

  function montarItemHistorico(rec) {
    const div = document.createElement("div");
    div.className = "receita-hist-item";

    const header = document.createElement("div");
    header.className = "receita-hist-header";

    const spanData = document.createElement("span");
    spanData.className = "receita-hist-data";
    spanData.textContent = rec.DataHora_Emissao
      ? formatarDataHora(new Date(rec.DataHora_Emissao))
      : "Data não informada";

    const spanStatus = document.createElement("span");
    spanStatus.className = "receita-hist-status";
    spanStatus.textContent = rec.Status || "Ativa";

    header.appendChild(spanData);
    header.appendChild(spanStatus);

    const textoDiv = document.createElement("div");
    textoDiv.className = "receita-hist-texto";
    textoDiv.textContent = rec.Texto_Receita || "";

    div.appendChild(header);
    div.appendChild(textoDiv);

    div.addEventListener("click", () => {
      textoDiv.classList.toggle("expanded");
    });

    return div;
  }

  /* ============================================================
     Impressão básica (por enquanto)
  ============================================================ */

  function imprimirReceitaBasica() {
    // No futuro: usar PRONTIO.Print.receita("#previewReceita") etc.
    toast("Impressão será configurada na fase avançada.", "success");
  }

  /* ============================================================
     Inicialização do módulo
  ============================================================ */

  function init() {
    carregarPacienteDoStorage();
    configurarBotoesReceita();
    adicionarLinhaMedicamento(); // pelo menos 1 linha
    carregarHistoricoReceitas();
  }

  // Auto-init (até termos PRONTIO.App.init orquestrando tudo)
  document.addEventListener("DOMContentLoaded", init);

  // API pública do módulo
  return {
    init,
  };
})();

/* Wrapper opcional de compatibilidade */
window.Receita = PRONTIO.Modules.Receita;
