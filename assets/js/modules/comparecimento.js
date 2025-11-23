// =======================================
// COMPARECIMENTO – PRONTIO
// =======================================

// Ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  const paciente = JSON.parse(localStorage.getItem("pacienteSelecionado"));

  if (!paciente) {
    alert("Nenhum paciente selecionado.");
    window.location.href = "pacientes.html";
    return;
  }

  // Dados do paciente
  document.getElementById("pacienteNome").textContent = paciente.nome;
  document.getElementById("pacienteID").textContent = paciente.id;
  document.getElementById("pacienteTelefone").textContent = paciente.telefone;

  // Datas/horários padrão
  const hoje = new Date();
  document.getElementById("cmpData").value = hoje.toISOString().slice(0, 10);

  const hora = hoje.toTimeString().slice(0, 5);
  document.getElementById("cmpHoraInicio").value = hora;
  document.getElementById("cmpHoraFim").value = hora;

  // Gera texto inicial
  aplicarModeloComparecimento();

  // Eventos
  document.getElementById("cmpData").addEventListener("change", aplicarModeloComparecimento);
  document.getElementById("cmpHoraInicio").addEventListener("change", aplicarModeloComparecimento);
  document.getElementById("cmpHoraFim").addEventListener("change", aplicarModeloComparecimento);
  document.getElementById("cmpTipo").addEventListener("change", aplicarModeloComparecimento);
  document.getElementById("cmpDestino").addEventListener("change", aplicarModeloComparecimento);

  document.getElementById("cmpTexto").addEventListener("input", () => {
    document.getElementById("cmpTexto").dataset.editado = "sim";
  });

  document.getElementById("btnSalvarCmp").addEventListener("click", salvarComparecimento);
  document.getElementById("btnImprimirCmp").addEventListener("click", () => window.print());

  // Histórico
  carregarHistoricoComparecimento();
});

// =======================================
// MODELO DE TEXTO
// =======================================

function aplicarModeloComparecimento() {
  const paciente = JSON.parse(localStorage.getItem("pacienteSelecionado"));
  if (!paciente) return;

  const campoTexto = document.getElementById("cmpTexto");
  if (campoTexto.dataset.editado === "sim") return; // não sobrescreve se já editou

  const nome = paciente.nome || "________________";

  const data = document.getElementById("cmpData").value;
  const horaInicio = document.getElementById("cmpHoraInicio").value;
  const horaFim = document.getElementById("cmpHoraFim").value;
  const tipo = document.getElementById("cmpTipo").value;
  const destino = document.getElementById("cmpDestino").value;

  const dataBr = data ? formatarDataBrasileira(data) : "____/____/______";
  const hIni = horaInicio || "____:____";
  const hFim = horaFim || "____:____";

  const motivoLabel = formatarMotivo(tipo);
  const destinoLabel = formatarDestino(destino);

  let texto =
    `Declaro, para fins de ${destinoLabel}, que o(a) Sr.(a) ${nome} ` +
    `esteve presente em atendimento médico urológico neste serviço, no dia ${dataBr}, ` +
    `no período de ${hIni} às ${hFim}, para ${motivoLabel}.\n\n` +
    `Esta declaração é emitida a pedido do(a) interessado(a), para os devidos fins.`;

  campoTexto.value = texto;
}

// =======================================
// SALVAR DECLARAÇÃO
// =======================================

function salvarComparecimento() {
  const paciente = JSON.parse(localStorage.getItem("pacienteSelecionado"));
  const data = document.getElementById("cmpData").value;
  const horaInicio = document.getElementById("cmpHoraInicio").value;
  const horaFim = document.getElementById("cmpHoraFim").value;
  const tipo = document.getElementById("cmpTipo").value;
  const destino = document.getElementById("cmpDestino").value;
  const texto = document.getElementById("cmpTexto").value.trim();
  const obs = document.getElementById("cmpObs").value.trim();

  if (!data) {
    alert("Informe a data da declaração.");
    return;
  }
  if (!horaInicio || !horaFim) {
    alert("Informe hora de chegada e saída.");
    return;
  }
  if (!texto) {
    alert("Preencha o texto da declaração.");
    return;
  }

  const dataHora = `${data}T${horaInicio}`;

  const registro = {
    id: paciente.id,
    nome: paciente.nome,
    data: dataHora,
    dataBr: formatarDataBrasileira(data),
    horaInicio,
    horaFim,
    tipo: formatarMotivo(tipo),
    destino: formatarDestino(destino),
    texto,
    observacoes: obs
  };

  // LocalStorage
  const historico = JSON.parse(localStorage.getItem("historicoComparecimento")) || [];
  historico.push(registro);
  localStorage.setItem("historicoComparecimento", JSON.stringify(historico));

  // Apps Script
  enviarComparecimentoParaSheets(registro);

  alert("Declaração salva com sucesso.");

  document.getElementById("cmpObs").value = "";
  carregarHistoricoComparecimento();
}

function enviarComparecimentoParaSheets(registro) {
  fetch("https://script.google.com/macros/s/AKfycbwIyIcC9ea34-6528NNnbC5W8aYNIs4fAd8y6GV00i6OYLrKLZ3j1QGlF4NSPxKGiWK-A/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rota: "comparecimento",
      ...registro
    })
  })
    .then(r => r.json())
    .then(res => {
      console.log("Comparecimento enviado para Sheets:", res);
    })
    .catch(err => {
      console.error("Erro ao enviar comparecimento:", err);
    });
}

// =======================================
// HISTÓRICO
// =======================================

function carregarHistoricoComparecimento() {
  const paciente = JSON.parse(localStorage.getItem("pacienteSelecionado"));
  const historico = JSON.parse(localStorage.getItem("historicoComparecimento")) || [];
  const container = document.getElementById("historicoComparecimento");

  const lista = historico.filter(r => r.id === paciente.id);

  if (lista.length === 0) {
    container.innerHTML = "<p>Nenhuma declaração registrada.</p>";
    return;
  }

  lista.sort((a, b) => new Date(b.data) - new Date(a.data));

  container.innerHTML = "";

  lista.forEach(r => {
    const div = document.createElement("div");
    div.classList.add("cmp-item");

    const dataFmt = `${r.dataBr} ${r.horaInicio}–${r.horaFim}`;

    div.innerHTML = `
      <p><strong>${dataFmt}</strong></p>
      <p class="cmp-item-tipo">${r.tipo} (${r.destino})</p>
      <p class="cmp-item-detalhe">${r.texto}</p>
      ${r.observacoes ? `<p><em>Obs:</em> ${r.observacoes}</p>` : ""}
    `;

    container.appendChild(div);
  });
}

// =======================================
// UTILITÁRIOS
// =======================================

function formatarDataBrasileira(isoDate) {
  if (!isoDate) return "";
  const [ano, mes, dia] = isoDate.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarMotivo(tipo) {
  switch (tipo) {
    case "consulta": return "consulta urológica";
    case "exame": return "realização de exame/procedimento";
    case "retorno": return "retorno/revisão";
    case "pos_operatorio": return "avaliação pós-operatória";
    case "outro": return "atendimento médico";
    default: return "atendimento médico";
  }
}

function formatarDestino(destino) {
  switch (destino) {
    case "empresa": return "apresentação à empresa/empregador";
    case "escola": return "apresentação à instituição de ensino";
    case "academia": return "apresentação à academia/atividade física";
    case "justificar": return "justificativa de ausência";
    default: return "apresentação";
  }
}
