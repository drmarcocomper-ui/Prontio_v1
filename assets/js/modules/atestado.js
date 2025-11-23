// =======================================
// ATESTADO – PRONTIO
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

  // Data agora
  const agora = new Date();
  document.getElementById("atestadoData").value = agora.toISOString().slice(0, 16);

  // Gerar modelo inicial
  aplicarModeloAtestado();

  // Eventos
  document.getElementById("tipoAtestado").addEventListener("change", aplicarModeloAtestado);
  document.getElementById("diasAfastamento").addEventListener("input", aplicarModeloAtestado);
  document.getElementById("inicioAfastamento").addEventListener("change", aplicarModeloAtestado);
  document.getElementById("flagAtestadoCurto").addEventListener("change", aplicarModeloAtestado);

  document.getElementById("btnSalvarAtestado").addEventListener("click", salvarAtestado);
  document.getElementById("btnImprimirAtestado").addEventListener("click", imprimirAtestado);

  // Histórico
  carregarHistoricoAtestados();
});

// =======================================
// MODELO DE TEXTO
// =======================================

function aplicarModeloAtestado() {
  const paciente = JSON.parse(localStorage.getItem("pacienteSelecionado"));
  if (!paciente) return;

  const tipo = document.getElementById("tipoAtestado").value;
  const dias = Number(document.getElementById("diasAfastamento").value || 0);
  const cid = document.getElementById("cidAtestado").value.trim();
  const inicio = document.getElementById("inicioAfastamento").value;
  const curto = document.getElementById("flagAtestadoCurto").checked;

  const campoTexto = document.getElementById("atestadoTexto");

  // Se o usuário já digitou algo manual e não marcou nada, não sobrescrever à força
  if (campoTexto.dataset.editado === "sim") return;

  const nome = paciente.nome || "________________";

  let texto = "";

  // Construção básica
  if (curto || dias === 0) {
    texto =
      `Atesto, para os devidos fins, que o(a) Sr.(a) ${nome} foi atendido(a) em consulta médica ` +
      `nesta data, encontrando-se sob cuidados médicos urológicos.\n\n` +
      `Recomenda-se repouso e/ou afastamento de atividades conforme necessidade clínica ` +
      `e orientação médica, sem afastamento prolongado programado neste momento.`;
  } else {
    const dataInicioFormatada = inicio
      ? formatarDataBrasileira(inicio)
      : "____/____/______";

    texto =
      `Atesto, para os devidos fins, que o(a) Sr.(a) ${nome} necessita de afastamento de suas ` +
      `atividades habituais por ${dias} (${extenso(dias)}) dia(s), a partir de ${dataInicioFormatada}, ` +
      `por motivo de tratamento médico urológico.\n\n` +
      `Durante este período, o paciente deverá evitar esforços físicos e seguir as orientações ` +
      `médicas específicas do caso.`;
  }

  if (cid) {
    texto += `\n\nCID (opcional informado ao paciente): ${cid}.`;
  }

  if (tipo === "atividade_fisica") {
    texto += `\n\nEste atestado destina-se, em especial, à liberação/afastamento de atividades físicas ou esportivas.`;
  } else if (tipo === "escola") {
    texto += `\n\nEste atestado destina-se à justificativa de ausência em atividades escolares/acadêmicas.`;
  } else if (tipo === "trabalho") {
    texto += `\n\nEste atestado destina-se à justificativa de ausência em atividades laborais.`;
  }

  campoTexto.value = texto;
}

// Marca como editado manualmente quando o usuário mexer
document.addEventListener("input", e => {
  if (e.target && e.target.id === "atestadoTexto") {
    e.target.dataset.editado = "sim";
  }
});

// =======================================
// SALVAR ATESTADO
// =======================================

function salvarAtestado() {
  const paciente = JSON.parse(localStorage.getItem("pacienteSelecionado"));
  const data = document.getElementById("atestadoData").value;
  const tipo = document.getElementById("tipoAtestado").value;
  const dias = Number(document.getElementById("diasAfastamento").value || 0);
  const cid = document.getElementById("cidAtestado").value.trim();
  const inicio = document.getElementById("inicioAfastamento").value;
  const texto = document.getElementById("atestadoTexto").value.trim();
  const obs = document.getElementById("atestadoObs").value.trim();
  const curto = document.getElementById("flagAtestadoCurto").checked;

  if (!data) {
    alert("Informe a data do atestado.");
    return;
  }

  if (!texto) {
    alert("Preencha o texto do atestado.");
    return;
  }

  const tipoLabel = formatarTipoAtestado(tipo);

  // Texto curto para aparecer no prontuário
  let resumo = tipoLabel;
  if (!curto && dias > 0) {
    resumo += ` – ${dias} dia(s) de afastamento`;
  }
  if (cid) {
    resumo += ` – CID: ${cid}`;
  }

  const registro = {
    id: paciente.id,
    nome: paciente.nome,
    data,
    tipo: tipoLabel,
    dias,
    cid,
    inicioAfastamento: inicio,
    texto,
    observacoes: obs,
    curto,
    resumo
  };

  // LocalStorage (usado também pelo prontuário)
  const historico = JSON.parse(localStorage.getItem("historicoAtestados")) || [];
  historico.push(registro);
  localStorage.setItem("historicoAtestados", JSON.stringify(historico));

  // Apps Script
  enviarAtestadoParaSheets(registro);

  alert("Atestado salvo com sucesso.");

  document.getElementById("atestadoObs").value = "";
  carregarHistoricoAtestados();
}

function enviarAtestadoParaSheets(registro) {
  fetch("https://script.google.com/macros/s/AKfycbwIyIcC9ea34-6528NNnbC5W8aYNIs4fAd8y6GV00i6OYLrKLZ3j1QGlF4NSPxKGiWK-A/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rota: "atestado",
      ...registro
    })
  })
    .then(r => r.json())
    .then(res => {
      console.log("Atestado enviado para Sheets:", res);
    })
    .catch(err => {
      console.error("Erro ao enviar atestado:", err);
    });
}

// =======================================
// HISTÓRICO
// =======================================

function carregarHistoricoAtestados() {
  const paciente = JSON.parse(localStorage.getItem("pacienteSelecionado"));
  const historico = JSON.parse(localStorage.getItem("historicoAtestados")) || [];
  const container = document.getElementById("historicoAtestados");

  const lista = historico.filter(r => r.id === paciente.id);

  if (lista.length === 0) {
    container.innerHTML = "<p>Nenhum atestado registrado.</p>";
    return;
  }

  lista.sort((a, b) => new Date(b.data) - new Date(a.data));

  container.innerHTML = "";

  lista.forEach(r => {
    const div = document.createElement("div");
    div.classList.add("atestado-item");

    const dataFmt = r.data.replace("T", " ");

    div.innerHTML = `
      <p><strong>${dataFmt}</strong></p>
      <p class="atestado-item-tipo">${r.tipo}</p>
      <p class="atestado-item-detalhe">${r.resumo}</p>
      <p>${r.texto}</p>
      ${r.observacoes ? `<p><em>Obs:</em> ${r.observacoes}</p>` : ""}
    `;

    container.appendChild(div);
  });
}

// =======================================
// IMPRESSÃO
// =======================================

function imprimirAtestado() {
  window.print();
}

// =======================================
// UTILITÁRIOS
// =======================================

function formatarTipoAtestado(tipo) {
  switch (tipo) {
    case "trabalho": return "Atestado para trabalho";
    case "escola": return "Atestado para escola/curso";
    case "atividade_fisica": return "Atestado para atividade física";
    case "outro": return "Atestado médico";
    default: return "Atestado";
  }
}

function formatarDataBrasileira(isoDate) {
  if (!isoDate) return "";
  const [ano, mes, dia] = isoDate.split("-");
  return `${dia}/${mes}/${ano}`;
}

// Converte número simples em texto (até 30 está ótimo para uso prático)
function extenso(num) {
  const mapa = {
    0: "zero",
    1: "um",
    2: "dois",
    3: "três",
    4: "quatro",
    5: "cinco",
    6: "seis",
    7: "sete",
    8: "oito",
    9: "nove",
    10: "dez",
    11: "onze",
    12: "doze",
    13: "treze",
    14: "quatorze",
    15: "quinze",
    16: "dezesseis",
    17: "dezessete",
    18: "dezoito",
    19: "dezenove",
    20: "vinte",
    21: "vinte e um",
    22: "vinte e dois",
    23: "vinte e três",
    24: "vinte e quatro",
    25: "vinte e cinco",
    26: "vinte e seis",
    27: "vinte e sete",
    28: "vinte e oito",
    29: "vinte e nove",
    30: "trinta"
  };
  return mapa[num] || String(num);
}
