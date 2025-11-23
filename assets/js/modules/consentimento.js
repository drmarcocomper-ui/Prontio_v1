// =======================================
// CONSENTIMENTO – PRONTIO
// =======================================

const MODELOS_CONSENTIMENTO = [
  {
    valor: "CONS_VASECTOMIA",
    label: "Consentimento para vasectomia",
    texto: `Eu, ______________________________________, declaro ter sido informado(a) de forma clara e compreensível sobre o procedimento de VASECTOMIA ao qual serei submetido(a).

Fui esclarecido(a) quanto a:
- Objetivo do procedimento: esterilização cirúrgica masculina, com finalidade contraceptiva.
- Técnica utilizada e necessidade de anestesia local/regional, podendo haver desconforto ou dor.
- Principais riscos: hematoma escrotal, infecção, dor crônica, falha na oclusão dos deferentes, necessidade de novo procedimento, alteração transitória do volume de sêmen, entre outros.
- Possibilidade de recanalização espontânea, ainda que rara, e necessidade de manter outro método contraceptivo até confirmação do espermograma com ausência de espermatozoides.
- Caráter, em regra, definitivo do método, com dificuldade e resultados incertos em tentativas de reversão.

Tive oportunidade de fazer perguntas, que foram respondidas satisfatoriamente, e estou ciente de que posso revogar este consentimento antes do procedimento, se assim desejar.

Declaro que AUTORIZO a realização do procedimento de vasectomia, bem como as condutas necessárias em caso de intercorrências durante o ato cirúrgico.

Local e data: ______________________________________

Assinatura do paciente: _____________________________

Assinatura do médico: ______________________________`
  },
  {
    valor: "CONS_URETEROLITOTRIPSIA",
    label: "Consentimento para ureterolitotripsia",
    texto: `Eu, ______________________________________, declaro ter sido informado(a) sobre o procedimento de URETEROLITOTRIPSIA (tratamento endoscópico de cálculo em ureter), sua indicação e riscos.

Fui esclarecido(a) quanto a:
- Objetivo do procedimento: fragmentação e/ou retirada de cálculo ureteral.
- Possível necessidade de colocação de cateter duplo J após o procedimento.
- Riscos e possíveis complicações: dor, sangramento, infecção urinária, febre, perfuração de vias urinárias, extravasamento de urina, necessidade de procedimento adicional, persistência de fragmentos residuais ou de cálculo.
- Possibilidade de internação prolongada ou necessidade de cuidados intensivos em caso de complicações.

Tive oportunidade de esclarecer dúvidas e estou ciente de que posso revogar este consentimento antes do procedimento, se assim desejar.

Declaro que AUTORIZO a realização da ureterolitotripsia, bem como os procedimentos complementares julgados necessários pelo médico responsável.

Local e data: ______________________________________

Assinatura do paciente: _____________________________

Assinatura do médico: ______________________________`
  },
  {
    valor: "CONS_RTU_PROSTATA",
    label: "Consentimento para RTU de próstata",
    texto: `Eu, ______________________________________, declaro ter sido informado(a) sobre o procedimento de RESEÇÃO TRANSURETRAL DE PRÓSTATA (RTU de próstata), sua indicação e riscos.

Fui esclarecido(a) quanto a:
- Objetivo do procedimento: desobstrução do canal urinário pela ressecção de tecido prostático.
- Necessidade de anestesia e uso de sonda vesical no pós-operatório.
- Principais riscos: sangramento, infecção, retenção urinária, estenose uretral, incontinência urinária, disfunção erétil, ejaculação retrógrada, necessidade de reoperação ou tratamento complementar.
- Possibilidade de necessidade de internação prolongada e monitorização intensiva em caso de intercorrências.

Tive oportunidade de fazer perguntas, que foram respondidas adequadamente, e compreendi as explicações fornecidas.

Declaro que AUTORIZO a realização da RTU de próstata, bem como as medidas necessárias em caso de complicações.

Local e data: ______________________________________

Assinatura do paciente: _____________________________

Assinatura do médico: ______________________________`
  },
  {
    valor: "CONS_PROSTATECTOMIA_ROBOTICA",
    label: "Consentimento para prostatectomia radical robótica",
    texto: `Eu, ______________________________________, declaro ter sido informado(a) de forma clara sobre o procedimento de PROSTATECTOMIA RADICAL ASSISTIDA POR ROBÔ (cirurgia para tratamento do câncer de próstata localizado).

Fui esclarecido(a) quanto a:
- Objetivo do procedimento: remoção cirúrgica da próstata e, quando indicado, das vesículas seminais e linfonodos.
- Técnica robótica, com pequenas incisões, utilização de braços robóticos e console cirúrgico.
- Riscos e possíveis complicações: sangramento, infecção, trombose, lesão de órgãos vizinhos, fístulas, incontinência urinária, disfunção erétil, alterações de fertilidade, necessidade de transfusão de sangue ou reintervenções.
- Possibilidade de necessidade de tratamentos complementares (radioterapia, hormonioterapia) a depender do resultado anatomopatológico.

Estou ciente dos benefícios esperados, bem como dos riscos e alternativas terapêuticas discutidas com o médico responsável.

Declaro que AUTORIZO a realização da prostatectomia radical robótica, bem como as condutas necessárias em caso de intercorrências.

Local e data: ______________________________________

Assinatura do paciente: _____________________________

Assinatura do médico: ______________________________`
  },
  {
    valor: "CONS_TEXTO_LIVRE",
    label: "Consentimento em texto livre",
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

  // Data/hora agora
  const agora = new Date();
  document.getElementById("consData").value = agora.toISOString().slice(0, 16);

  // Popular tipos de consentimento
  preencherTiposConsentimento();

  // Eventos
  document.getElementById("consTipo").addEventListener("change", aplicarModeloConsentimento);
  document.getElementById("consTexto").addEventListener("input", () => {
    document.getElementById("consTexto").dataset.editado = "sim";
  });

  document.getElementById("btnSalvarConsentimento").addEventListener("click", salvarConsentimento);
  document.getElementById("btnImprimirConsentimento").addEventListener("click", imprimirConsentimento);

  // Histórico
  carregarHistoricoConsentimento();
});

// =======================================
// MODELOS
// =======================================

function preencherTiposConsentimento() {
  const select = document.getElementById("consTipo");
  select.innerHTML = "";

  MODELOS_CONSENTIMENTO.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.valor;
    opt.textContent = m.label;
    select.appendChild(opt);
  });

  aplicarModeloConsentimento();
}

function aplicarModeloConsentimento() {
  const valor = document.getElementById("consTipo").value;
  const modelo = MODELOS_CONSENTIMENTO.find(m => m.valor === valor);
  const campoTexto = document.getElementById("consTexto");

  if (!modelo) return;

  // Não sobrescrever se já editado manualmente e modelo for texto livre
  if (campoTexto.dataset.editado === "sim" && modelo.valor === "CONS_TEXTO_LIVRE") {
    return;
  }

  if (modelo.valor === "CONS_TEXTO_LIVRE") {
    if (!campoTexto.value.trim()) campoTexto.value = "";
    return;
  }

  // Se já existe texto manual e modelo tem texto, só sobrescreve se estiver vazio
  if (campoTexto.dataset.editado === "sim" && campoTexto.value.trim()) return;

  campoTexto.value = modelo.texto || "";
  campoTexto.dataset.editado = "";
}

// =======================================
// SALVAR CONSENTIMENTO
// =======================================

function salvarConsentimento() {
  const paciente = JSON.parse(localStorage.getItem("pacienteSelecionado"));
  const data = document.getElementById("consData").value;
  const tipoValor = document.getElementById("consTipo").value;
  const localProc = document.getElementById("consLocal").value.trim();
  const procedimento = document.getElementById("consProcedimento").value.trim();
  const cid = document.getElementById("consCID").value.trim();
  const texto = document.getElementById("consTexto").value.trim();
  const obs = document.getElementById("consObs").value.trim();
  const assinado = document.getElementById("consAssinado").checked;

  if (!data) {
    alert("Informe a data do consentimento.");
    return;
  }
  if (!procedimento) {
    alert("Informe o procedimento principal.");
    return;
  }
  if (!texto) {
    alert("Preencha o texto do consentimento.");
    return;
  }

  const tipoLabel = obterLabelConsentimento(tipoValor);

  // Resumo para o prontuário
  let resumo = `${tipoLabel} – ${procedimento}`;
  if (localProc) resumo += ` | Local: ${localProc}`;
  if (cid) resumo += ` | CID: ${cid}`;
  if (assinado) resumo += ` | Assinado`;

  const registro = {
    id: paciente.id,
    nome: paciente.nome,
    data,
    tipo: tipoLabel,
    local: localProc,
    procedimento,
    cid,
    texto,
    observacoes: obs,
    assinado,
    resumo
  };

  // LocalStorage
  const historico = JSON.parse(localStorage.getItem("historicoConsentimento")) || [];
  historico.push(registro);
  localStorage.setItem("historicoConsentimento", JSON.stringify(historico));

  // Apps Script
  enviarConsentimentoParaSheets(registro);

  alert("Consentimento salvo com sucesso.");

  document.getElementById("consObs").value = "";
  carregarHistoricoConsentimento();
}

function obterLabelConsentimento(valor) {
  const m = MODELOS_CONSENTIMENTO.find(x => x.valor === valor);
  return m ? m.label : "Consentimento informado";
}

function enviarConsentimentoParaSheets(registro) {
  fetch("https://script.google.com/macros/s/AKfycbwIyIcC9ea34-6528NNnbC5W8aYNIs4fAd8y6GV00i6OYLrKLZ3j1QGlF4NSPxKGiWK-A/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rota: "consentimento",
      ...registro
    })
  })
    .then(r => r.json())
    .then(res => {
      console.log("Consentimento enviado para Sheets:", res);
    })
    .catch(err => {
      console.error("Erro ao enviar consentimento:", err);
    });
}

// =======================================
// HISTÓRICO
// =======================================

function carregarHistoricoConsentimento() {
  const paciente = JSON.parse(localStorage.getItem("pacienteSelecionado"));
  const historico = JSON.parse(localStorage.getItem("historicoConsentimento")) || [];
  const container = document.getElementById("historicoConsentimento");

  const lista = historico.filter(r => r.id === paciente.id);

  if (lista.length === 0) {
    container.innerHTML = "<p>Nenhum consentimento registrado.</p>";
    return;
  }

  lista.sort((a, b) => new Date(b.data) - new Date(a.data));

  container.innerHTML = "";

  lista.forEach(r => {
    const div = document.createElement("div");
    div.classList.add("cons-item");

    const dataFmt = r.data.replace("T", " ");

    div.innerHTML = `
      <p><strong>${dataFmt}</strong></p>
      <p class="cons-item-tipo">${r.tipo}</p>
      <p>${r.resumo}</p>
      ${r.assinado ? `<p class="cons-item-tag">Documento assinado</p>` : ""}
      <p>${r.texto}</p>
      ${r.observacoes ? `<p><em>Obs:</em> ${r.observacoes}</p>` : ""}
    `;

    container.appendChild(div);
  });
}

// =======================================
// IMPRESSÃO
// =======================================

function imprimirConsentimento() {
  const assinado = document.getElementById("consAssinado").checked;
  if (!assinado) {
    alert("Este documento ainda não está assinado. Use a impressão para colher a assinatura do paciente.");
  }
  window.print();
}
