// =======================================
// LAUDO – PRONTIO
// =======================================

const LAUDOS_MODELOS = [
  {
    valor: "LAUDO_USG_PROSTATA",
    label: "Laudo de USG de próstata",
    texto: `Exame realizado por via transretal.

Achados:
- Próstata de contornos regulares, limites bem definidos.
- Volume prostático aproximado de ___ mL.
- Zona periférica: sem áreas hipoecoicas suspeitas / com área hipoecoica em ___.
- Zona de transição: sinais de hiperplasia nodular / sem alterações significativas.
- Vesículas seminais sem alterações relevantes.

Conclusão:
- Achados compatíveis com próstata de volume ____, sem sinais ultrassonográficos típicos de neoplasia / com área suspeita em ___ (recomenda-se correlação com PSA e avaliação urológica).`
  },
  {
    valor: "LAUDO_RM_PROSTATA",
    label: "Laudo de RM de próstata",
    texto: `Exame realizado com protocolo multiparamétrico (T2, DWI/ADC, DCE), segundo recomendações PI-RADS.

Achados:
- Volume prostático: ___ mL.
- Zona periférica: sem lesões suspeitas / lesão focal em ___, hipointensa em T2, com restrição à difusão e realce precoce.
- Zona de transição: nódulos típicos de hiperplasia / sem lesões suspeitas.
- Ausência de sinais de extensão extraprostatica evidente.
- Vesículas seminais e estruturas adjacentes sem alterações significativas.

Conclusão:
- Achados compatíveis com ___.
- Lesão em ___, classificada como PI-RADS __.
Sugere-se correlação com PSA, toque retal e avaliação urológica.`
  },
  {
    valor: "LAUDO_BIOPSIA_PROSTATA",
    label: "Laudo descritivo pós-biópsia de próstata (texto clínico)",
    texto: `Paciente submetido à biópsia de próstata guiada por ultrassonografia transretal.

Procedimento:
- Realizado sob anestesia local / sedação.
- Coletados ___ fragmentos, distribuídos entre zona periférica e de transição.
- Procedimento realizado sem intercorrências imediatas.

Orientações:
- Orientado quanto a sinais de alerta (febre, retenção urinária, hematúria intensa, hematoquezia).
- Amostras encaminhadas para estudo anatomopatológico.
- Aguardar resultado para definição de conduta complementar.`
  },
  {
    valor: "LAUDO_CLINICO_GERAL",
    label: "Laudo clínico geral (capacidade laborativa / situação atual)",
    texto: `Paciente em seguimento urológico, em acompanhamento ambulatorial.

Ao exame clínico atual:
- Estado geral: bom / regular.
- Sinais vitais estáveis.
- Sem queixas álgicas significativas / com queixas referidas em ___.
- Sistema urinário: referindo sintomas de ___ / sem queixas atuais.

Conclusão:
- No momento, o paciente encontra-se em condições clínicas de ___.
- Indica-se acompanhamento periódico com urologista e seguimento de exames complementares conforme solicitados em prontuário.`
  },
  {
    valor: "LAUDO_TEXTO_LIVRE",
    label: "Laudo em texto livre",
    texto: ""
  }
];

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
  document.getElementById("laudoData").value = agora.toISOString().slice(0,16);

  // Popular tipos de laudo
  preencherTiposLaudo();

  // Eventos
  document.getElementById("tipoLaudo").addEventListener("change", aplicarModeloLaudo);
  document.getElementById("btnSalvarLaudo").addEventListener("click", salvarLaudo);
  document.getElementById("btnImprimirLaudo").addEventListener("click", imprimirLaudo);

  // Histórico
  carregarHistoricoLaudos();
});

// =======================================
// TIPOS / MODELOS
// =======================================

function preencherTiposLaudo() {
  const select = document.getElementById("tipoLaudo");
  select.innerHTML = "";

  LAUDOS_MODELOS.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.valor;
    opt.textContent = m.label;
    select.appendChild(opt);
  });

  aplicarModeloLaudo();
}

function aplicarModeloLaudo() {
  const valor = document.getElementById("tipoLaudo").value;
  const modelo = LAUDOS_MODELOS.find(m => m.valor === valor);
  const campoTexto = document.getElementById("laudoTexto");

  if (!modelo) return;

  // Se for texto livre, não sobrescreve se já tiver texto
  if (modelo.valor === "LAUDO_TEXTO_LIVRE") {
    if (!campoTexto.value.trim()) campoTexto.value = "";
    return;
  }

  // Se já há texto digitado, só sobrescreve se estiver vazio
  if (campoTexto.value.trim() && modelo.texto === "") return;

  campoTexto.value = modelo.texto || "";
}

// =======================================
// SALVAR LAUDO
// =======================================

function salvarLaudo() {
  const paciente = JSON.parse(localStorage.getItem("pacienteSelecionado"));
  const data = document.getElementById("laudoData").value;
  const tipoValor = document.getElementById("tipoLaudo").value;
  const texto = document.getElementById("laudoTexto").value.trim();
  const obs = document.getElementById("laudoObs").value.trim();
  const relevante = document.getElementById("flagLaudoImportante").checked;

  if (!data) {
    alert("Informe a data do laudo.");
    return;
  }

  if (!texto) {
    alert("Preencha o texto do laudo.");
    return;
  }

  const tipoLabel = obterLabelLaudo(tipoValor);

  const registro = {
    id: paciente.id,
    nome: paciente.nome,
    data,
    tipo: tipoLabel,
    texto,
    observacoes: obs,
    relevante
  };

  // LocalStorage
  const historico = JSON.parse(localStorage.getItem("historicoLaudos")) || [];
  historico.push(registro);
  localStorage.setItem("historicoLaudos", JSON.stringify(historico));

  // Apps Script
  enviarLaudoParaSheets(registro);

  alert("Laudo salvo com sucesso.");

  // Mantém texto principal, limpa observação, apenas se quiser
  document.getElementById("laudoObs").value = "";
  document.getElementById("flagLaudoImportante").checked = false;

  carregarHistoricoLaudos();
}

function obterLabelLaudo(valor) {
  const m = LAUDOS_MODELOS.find(x => x.valor === valor);
  return m ? m.label : "Laudo";
}

function enviarLaudoParaSheets(registro) {
  fetch("https://script.google.com/macros/s/AKfycbwIyIcC9ea34-6528NNnbC5W8aYNIs4fAd8y6GV00i6OYLrKLZ3j1QGlF4NSPxKGiWK-A/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rota: "laudo",
      ...registro
    })
  })
    .then(r => r.json())
    .then(res => {
      console.log("Laudo enviado para Sheets:", res);
    })
    .catch(err => {
      console.error("Erro ao enviar laudo:", err);
    });
}

// =======================================
// HISTÓRICO
// =======================================

function carregarHistoricoLaudos() {
  const paciente = JSON.parse(localStorage.getItem("pacienteSelecionado"));
  const historico = JSON.parse(localStorage.getItem("historicoLaudos")) || [];
  const container = document.getElementById("historicoLaudos");

  const lista = historico.filter(r => r.id === paciente.id);

  if (lista.length === 0) {
    container.innerHTML = "<p>Nenhum laudo registrado.</p>";
    return;
  }

  // Mais recente primeiro
  lista.sort((a, b) => new Date(b.data) - new Date(a.data));

  container.innerHTML = "";

  lista.forEach(r => {
    const div = document.createElement("div");
    div.classList.add("laudo-item");

    const dataFmt = r.data.replace("T", " ");

    div.innerHTML = `
      <p><strong>${dataFmt}</strong></p>
      <p class="laudo-item-tipo">${r.tipo}</p>
      ${r.relevante ? `<p class="laudo-item-tag">Laudo relevante</p>` : ""}
      <p>${r.texto}</p>
      ${r.observacoes ? `<p><em>Obs:</em> ${r.observacoes}</p>` : ""}
    `;

    container.appendChild(div);
  });
}

// =======================================
// IMPRESSÃO
// =======================================

function imprimirLaudo() {
  const relevante = document.getElementById("flagLaudoImportante").checked;
  if (relevante) {
    alert("Este laudo está marcado como relevante. Verifique se o texto está completo antes de imprimir.");
  }
  window.print();
}
