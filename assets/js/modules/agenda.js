/******************************************************
 * PRONTIO – agenda.js (com drawer de agendamento)
 *
 * Backend:
 *  - agenda-listar (filtros: data, status, busca)
 *  - agenda-salvar
 *  - agenda-atualizar-status
 *
 * Planilha Agenda:
 *  ID_Agenda | ID_Paciente | NomePaciente | Data |
 *  HoraInicio | HoraFim | Tipo | Status | Observacoes
 ******************************************************/

document.addEventListener("DOMContentLoaded", () => {
  inicializarAgenda();
});

/* ===========================
   INICIALIZAÇÃO
=========================== */

function inicializarAgenda() {
  configurarEventosAgenda();
  prepararCamposIniciaisAgenda();
  carregarAgenda();
}

/* ===========================
   ELEMENTOS / HELPERS
=========================== */

function $(id) {
  return document.getElementById(id);
}

/* ===========================
   EVENTOS
=========================== */

function configurarEventosAgenda() {
  const inputData = $("dataAgenda");
  const selectStatus = $("filtroStatusAgenda");
  const inputBusca = $("buscaAgenda");
  const btnNovo = $("btnAgendaNovo");
  const btnFecharDrawer = $("btnFecharAgendaDrawer");
  const backdrop = $("backdropAgenda");
  const form = $("agendaForm");
  const btnLimpar = $("btnAgendaLimpar");
  const inputNome = $("agendaNomePaciente");

  if (inputData) {
    inputData.addEventListener("change", () => {
      atualizarSubtituloAgenda();
      carregarAgenda();
    });
  }

  if (selectStatus) {
    selectStatus.addEventListener("change", carregarAgenda);
  }

  if (inputBusca) {
    let timeoutBusca = null;
    inputBusca.addEventListener("input", () => {
      clearTimeout(timeoutBusca);
      timeoutBusca = setTimeout(carregarAgenda, 250);
    });
  }

  if (btnNovo) {
    btnNovo.addEventListener("click", () => {
      abrirDrawerAgenda();
      limparFormularioAgenda();
      preencherPacienteAgendaDoLocalStorage();
    });
  }

  if (btnFecharDrawer) {
    btnFecharDrawer.addEventListener("click", fecharDrawerAgenda);
  }

  if (backdrop) {
    backdrop.addEventListener("click", fecharDrawerAgenda);
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await salvarAgendamento();
    });
  }

  if (btnLimpar) {
    btnLimpar.addEventListener("click", () => {
      limparFormularioAgenda();
    });
  }

  if (inputNome) {
    let timeoutNome = null;

    inputNome.addEventListener("input", () => {
      $("agendaIdPaciente").value = "";
      const termo = inputNome.value.trim();
      if (termo.length < 3) {
        esconderSugestoesAgenda();
        return;
      }
      clearTimeout(timeoutNome);
      timeoutNome = setTimeout(() => {
        carregarSugestoesPacientesAgenda(termo);
      }, 250);
    });

    inputNome.addEventListener("blur", () => {
      setTimeout(esconderSugestoesAgenda, 200);
    });
  }
}

/* ===========================
   CAMPOS INICIAIS
=========================== */

function prepararCamposIniciaisAgenda() {
  const inputData = $("dataAgenda");
  if (inputData && !inputData.value) {
    inputData.value = hojeISO();
  }
  atualizarSubtituloAgenda();
}

function atualizarSubtituloAgenda() {
  const inputData = $("dataAgenda");
  const subtitulo = $("agendaSubtitulo");

  if (!subtitulo || !inputData) return;

  const hoje = hojeISO();
  const valor = inputData.value;

  if (!valor || valor === hoje) {
    subtitulo.textContent = "Hoje";
    return;
  }

  subtitulo.textContent = formatarDataISOParaBR(valor);
}

/* ===========================
   DRAWER
=========================== */

function abrirDrawerAgenda() {
  $("drawerAgenda")?.classList.add("aberto");
  $("backdropAgenda")?.classList.add("visivel");
  $("tituloDrawerAgenda").textContent = $("agendaIdAgenda").value
    ? "Editar agendamento"
    : "Novo agendamento";
}

function fecharDrawerAgenda() {
  $("drawerAgenda")?.classList.remove("aberto");
  $("backdropAgenda")?.classList.remove("visivel");
}

/* ===========================
   CARREGAR AGENDA
=========================== */

async function carregarAgenda() {
  try {
    const data = $("dataAgenda")?.value || "";
    const status = $("filtroStatusAgenda")?.value || "";
    const busca = $("buscaAgenda")?.value?.trim() || "";

    const filtros = { data, status, busca };

    const resposta = await AgendaApi.listar(filtros);
    if (!resposta || !resposta.ok) return;

    const lista = resposta.lista || [];

    renderizarAgendaDia(lista, data);
    renderizarAgendaSemana(lista, data);
  } catch (erro) {
    console.error("PRONTIO – erro ao carregar agenda:", erro);
  }
}

/* ===========================
   RENDERIZAÇÃO (DIA)
=========================== */

function renderizarAgendaDia(lista, dataISO) {
  const container = $("listaAgenda");
  if (!container) return;

  container.innerHTML = "";

  if (!lista || !lista.length) {
    const vazio = document.createElement("div");
    vazio.className = "agenda-empty";
    vazio.textContent = "Nenhuma consulta encontrada para esta data.";
    container.appendChild(vazio);
    return;
  }

  lista.sort((a, b) => {
    const hA = String(a.HoraInicio || "").padStart(5, "0");
    const hB = String(b.HoraInicio || "").padStart(5, "0");
    if (hA < hB) return -1;
    if (hA > hB) return 1;
    return 0;
  });

  const diaWrapper = document.createElement("div");
  diaWrapper.className = "agenda-day";

  const label = document.createElement("div");
  label.className = "agenda-day-label";
  label.textContent = dataISO ? formatarDataISOParaBR(dataISO) : "Dia selecionado";
  diaWrapper.appendChild(label);

  lista.forEach((item) => {
    const slot = criarSlotAgenda(item);
    diaWrapper.appendChild(slot);
  });

  container.appendChild(diaWrapper);
}

function criarSlotAgenda(item) {
  const idAgenda = item.ID_Agenda;
  const idPaciente = item.ID_Paciente;
  const nomePaciente = item.NomePaciente || "";
  const data = item.Data || "";
  const horaInicio = item.HoraInicio || "";
  const horaFim = item.HoraFim || "";
  const tipo = item.Tipo || "";
  const status = item.Status || "";
  const obs = item.Observacoes || "";

  const slot = document.createElement("div");
  slot.className = "agenda-slot";
  slot.dataset.idAgenda = idAgenda || "";

  const horaEl = document.createElement("div");
  horaEl.className = "agenda-slot-time";
  horaEl.textContent = horaInicio
    ? (horaFim ? `${horaInicio} - ${horaFim}` : horaInicio)
    : "";

  const mainEl = document.createElement("div");
  mainEl.className = "agenda-slot-main";
  mainEl.textContent = nomePaciente || "Paciente sem nome";

  const metaEl = document.createElement("div");
  metaEl.className = "agenda-slot-meta";
  const metaPartes = [];
  if (tipo) metaPartes.push(tipo);
  if (status) metaPartes.push(status);
  metaEl.textContent = metaPartes.join(" • ");

  const obsEl = document.createElement("div");
  obsEl.className = "agenda-slot-obs";
  obsEl.textContent = obs || "";

  const statusEl = document.createElement("div");
  statusEl.className = "agenda-slot-status-actions";

  const btnConfirmar = document.createElement("button");
  btnConfirmar.type = "button";
  btnConfirmar.className = "btn-status btn-status-confirmar";
  btnConfirmar.textContent = "Confirmar";
  btnConfirmar.addEventListener("click", () => {
    atualizarStatusAgenda(idAgenda, "Confirmado");
  });

  const btnFaltou = document.createElement("button");
  btnFaltou.type = "button";
  btnFaltou.className = "btn-status btn-status-faltou";
  btnFaltou.textContent = "Faltou";
  btnFaltou.addEventListener("click", () => {
    atualizarStatusAgenda(idAgenda, "Faltou");
  });

  const btnPendente = document.createElement("button");
  btnPendente.type = "button";
  btnPendente.className = "btn-status btn-status-pendente";
  btnPendente.textContent = "Pendente";
  btnPendente.addEventListener("click", () => {
    atualizarStatusAgenda(idAgenda, "Pendente");
  });

  statusEl.appendChild(btnConfirmar);
  statusEl.appendChild(btnFaltou);
  statusEl.appendChild(btnPendente);

  const actionsEl = document.createElement("div");
  actionsEl.className = "agenda-slot-actions";

  const btnAtender = document.createElement("button");
  btnAtender.type = "button";
  btnAtender.className = "btn-link btn-link-primario";
  btnAtender.textContent = "Atender";
  btnAtender.addEventListener("click", () => {
    acionarAtendimentoAPartirDaAgenda({ idPaciente, nomePaciente });
  });

  const btnEditar = document.createElement("button");
  btnEditar.type = "button";
  btnEditar.className = "btn-link";
  btnEditar.textContent = "Editar";
  btnEditar.addEventListener("click", () => {
    carregarAgendamentoNoFormulario({
      ID_Agenda: idAgenda,
      ID_Paciente: idPaciente,
      NomePaciente: nomePaciente,
      Data: data,
      HoraInicio: horaInicio,
      HoraFim: horaFim,
      Tipo: tipo,
      Status: status,
      Observacoes: obs
    });
    abrirDrawerAgenda();
  });

  actionsEl.appendChild(btnAtender);
  actionsEl.appendChild(btnEditar);

  slot.appendChild(horaEl);
  slot.appendChild(mainEl);
  slot.appendChild(metaEl);
  if (obs) slot.appendChild(obsEl);
  slot.appendChild(statusEl);
  slot.appendChild(actionsEl);

  return slot;
}

/* ===========================
   FORMULÁRIO DO DRAWER
=========================== */

function carregarAgendamentoNoFormulario(item) {
  $("agendaIdAgenda").value = item.ID_Agenda || "";
  $("agendaData").value = item.Data || $("dataAgenda")?.value || hojeISO();
  $("agendaHoraInicio").value = item.HoraInicio || "";
  $("agendaHoraFim").value = item.HoraFim || "";
  $("agendaTipo").value = item.Tipo || "";
  $("agendaStatus").value = item.Status || "Agendado";
  $("agendaObservacoes").value = item.Observacoes || "";
  $("agendaIdPaciente").value = item.ID_Paciente || "";
  $("agendaNomePaciente").value = item.NomePaciente || "";
  $("tituloDrawerAgenda").textContent = item.ID_Agenda ? "Editar agendamento" : "Novo agendamento";
}

function limparFormularioAgenda() {
  $("agendaIdAgenda").value = "";
  $("agendaData").value = $("dataAgenda")?.value || hojeISO();
  $("agendaHoraInicio").value = agoraHora();
  $("agendaHoraFim").value = "";
  $("agendaTipo").value = "";
  $("agendaStatus").value = "Agendado";
  $("agendaObservacoes").value = "";
}

/* ===========================
   PACIENTE DO LOCALSTORAGE
=========================== */

function preencherPacienteAgendaDoLocalStorage() {
  const paciente = carregarPacienteSelecionado();
  if (!paciente) return;

  const id = paciente.idPaciente || paciente.ID_Paciente || "";
  const nome = paciente.NomePaciente || paciente.nomePaciente || "";

  $("agendaIdPaciente").value = id;
  $("agendaNomePaciente").value = nome;
}

/* ===========================
   SALVAR
=========================== */

async function salvarAgendamento() {
  const dados = {
    ID_Agenda: $("agendaIdAgenda").value.trim(),
    ID_Paciente: $("agendaIdPaciente").value.trim(),
    NomePaciente: $("agendaNomePaciente").value.trim(),
    Data: $("agendaData").value,
    HoraInicio: $("agendaHoraInicio").value,
    HoraFim: $("agendaHoraFim").value,
    Tipo: $("agendaTipo").value.trim(),
    Status: $("agendaStatus").value.trim(),
    Observacoes: $("agendaObservacoes").value.trim()
  };

  if (!dados.Data) {
    showToast("Informe a data do agendamento.", "aviso");
    $("agendaData").focus();
    return;
  }

  if (!dados.HoraInicio) {
    showToast("Informe a hora de início.", "aviso");
    $("agendaHoraInicio").focus();
    return;
  }

  if (!dados.NomePaciente) {
    showToast("Informe o nome do paciente.", "aviso");
    $("agendaNomePaciente").focus();
    return;
  }

  if (!dados.ID_Paciente && dados.NomePaciente) {
    const respPac = await PacientesApi.listar({ busca: dados.NomePaciente, ativo: "S" });
    if (respPac?.ok) {
      const lista = respPac.lista || respPac.pacientes || [];
      const normalizar = (s) => String(s || "").trim().toLowerCase();

      const candidatos = lista.filter((p) => {
        const nomeP =
          p.NomePaciente ||
          p.nomePaciente ||
          p.NomeCompleto ||
          p.nomeCompleto ||
          p.nome ||
          "";
        return normalizar(nomeP) === normalizar(dados.NomePaciente);
      });

      if (candidatos.length === 1) {
        const p = candidatos[0];
        const idEncontrado =
          p.ID_Paciente || p.idPaciente || p.IdPaciente || p.id || "";
        if (idEncontrado) {
          dados.ID_Paciente = idEncontrado;
          $("agendaIdPaciente").value = idEncontrado;
        }
      }
    }
  }

  if (!dados.ID_Paciente) {
    const confirmar = confirm(
      "Este paciente ainda não está vinculado a um cadastro. Deseja abrir o cadastro para incluir agora?"
    );
    if (confirmar) {
      if (dados.NomePaciente) {
        localStorage.setItem("PRONTIO_NOVO_PACIENTE_NOME", dados.NomePaciente);
      }
      window.location.href = "pacientes.html?novo=1";
    }
    return;
  }

  const btnSalvar = document.querySelector("#agendaForm button[type='submit']");
  if (btnSalvar) {
    btnSalvar.disabled = true;
    btnSalvar.innerHTML = "Salvando...";
  }

  const resp = await AgendaApi.salvar(dados);

  if (btnSalvar) {
    btnSalvar.disabled = false;
    btnSalvar.innerHTML = "Salvar agendamento";
  }

  if (!resp?.ok) {
    showToast("Erro ao salvar agendamento.", "erro");
    return;
  }

  showToast("Agendamento salvo com sucesso!", "sucesso");
  fecharDrawerAgenda();

  setTimeout(() => {
    carregarAgenda().then(() => {
      destacarSlotAgendamento(resp.ID_Agenda || dados.ID_Agenda);
    });
  }, 300);
}

/* ===========================
   AUTOCOMPLETE PACIENTE
=========================== */

async function carregarSugestoesPacientesAgenda(termo) {
  const listaEl = $("agendaSugestoesPaciente");
  if (!listaEl) return;

  const resp = await PacientesApi.listar({ busca: termo, ativo: "S" });
  if (!resp?.ok) {
    esconderSugestoesAgenda();
    return;
  }

  const lista = resp.lista || resp.pacientes || [];
  listaEl.innerHTML = "";
  if (!lista.length) {
    esconderSugestoesAgenda();
    return;
  }

  lista.forEach((p) => {
    const id = p.ID_Paciente || p.idPaciente;
    const nome =
      p.NomePaciente ||
      p.nomePaciente ||
      p.NomeCompleto ||
      p.nomeCompleto ||
      p.nome ||
      "";
    const tel = p.Telefone1 || p.telefone1 || "";

    const item = document.createElement("div");
    item.className = "autocomplete-item";
    item.textContent = tel ? `${nome} • ${tel}` : nome;

    item.addEventListener("click", () => {
      $("agendaNomePaciente").value = nome;
      $("agendaIdPaciente").value = id || "";
      esconderSugestoesAgenda();
    });

    listaEl.appendChild(item);
  });

  listaEl.style.display = "block";
}

function esconderSugestoesAgenda() {
  const listaEl = $("agendaSugestoesPaciente");
  if (listaEl) {
    listaEl.style.display = "none";
    listaEl.innerHTML = "";
  }
}

/* ===========================
   ATUALIZAR STATUS
=========================== */

async function atualizarStatusAgenda(idAgenda, novoStatus) {
  if (!idAgenda) return;

  const resposta = await AgendaApi.atualizarStatus(idAgenda, novoStatus);
  if (!resposta?.ok) {
    showToast("Erro ao atualizar status.", "erro");
    return;
  }

  showToast("Status atualizado!", "sucesso");
  carregarAgenda();
}

/* ===========================
   ATENDER
=========================== */

function acionarAtendimentoAPartirDaAgenda({ idPaciente, nomePaciente }) {
  if (!idPaciente && !nomePaciente) {
    showToast("Não foi possível identificar o paciente deste agendamento.", "erro");
    return;
  }

  salvarPacienteSelecionado({
    idPaciente,
    ID_Paciente: idPaciente,
    NomePaciente: nomePaciente
  });

  window.location.href = "index.html";
}

/* ===========================
   RENDERIZAÇÃO (SEMANA)
=========================== */

function renderizarAgendaSemana(lista, dataBaseISO) {
  const grid = document.getElementById("agendaWeekGrid");
  if (!grid) return;

  grid.innerHTML = "";

  if (!dataBaseISO) return;

  const base = new Date(dataBaseISO);
  if (isNaN(base)) return;

  const diaSemana = base.getDay();
  const deslocamento = diaSemana === 0 ? -6 : 1 - diaSemana;
  const segunda = new Date(base);
  segunda.setDate(base.getDate() + deslocamento);

  const dias = [];

  for (let i = 0; i < 7; i++) {
    const dia = new Date(segunda);
    dia.setDate(segunda.getDate() + i);
    const iso = dia.toISOString().substring(0, 10);

    dias.push({
      titulo: iso,
      lista: lista.filter((c) => c.Data === iso)
    });
  }

  dias.forEach((dia) => {
    const col = document.createElement("div");
    col.className = "agenda-week-column";

    const h = document.createElement("h4");
    h.textContent = formatarDataISOParaBR(dia.titulo);
    col.appendChild(h);

    if (!dia.lista.length) {
      const vazio = document.createElement("div");
      vazio.className = "agenda-week-slot";
      vazio.innerHTML = `<div class="agenda-week-slot-name">Sem agendamentos</div>`;
      col.appendChild(vazio);
    } else {
      dia.lista.forEach((item) => {
        const slot = document.createElement("div");
        slot.className = "agenda-week-slot";

        slot.innerHTML = `
          <div class="agenda-week-slot-time">${item.HoraInicio || ""}</div>
          <div class="agenda-week-slot-name">${item.NomePaciente || ""}</div>
          <div class="agenda-week-slot-type">${item.Tipo || ""}</div>
        `;

        col.appendChild(slot);
      });
    }

    grid.appendChild(col);
  });
}

/* ===========================
   DESTAQUE SLOT APÓS SALVAR
=========================== */

function destacarSlotAgendamento(idAgenda) {
  if (!idAgenda) return;

  const slot = document.querySelector(
    `.agenda-slot[data-id-agenda='${idAgenda}']`
  );
  if (!slot) return;

  slot.classList.add("slot-highlight");

  setTimeout(() => {
    slot.classList.remove("slot-highlight");
  }, 2000);
}
