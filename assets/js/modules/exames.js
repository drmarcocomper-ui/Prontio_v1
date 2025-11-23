// assets/js/exames.js

// URL do seu Web App do Google Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzBnqkzjjx4m2Xzq1ST9vAelhdJQYfj85kfBdpt9i2Pxm7gb3Uh9Wf-X5LJEnTTv1UmKg/exec";

document.addEventListener("DOMContentLoaded", () => {
  inicializarPaciente();
  configurarTipoSolicitacao();
  configurarModelosExame();
  configurarBotoes();
});

/**
 * Lê o paciente do localStorage e preenche os campos (spans + hidden).
 * Espera algo como:
 * localStorage.setItem("pacienteSelecionado",
 *   JSON.stringify({ id: "123", nome: "Fulano da Silva", telefone: "2799..." })
 * );
 */
function inicializarPaciente() {
  const spanNome = document.getElementById("pacienteNome");
  const spanID = document.getElementById("pacienteID");
  const spanTelefone = document.getElementById("pacienteTelefone");

  const inputIdHidden = document.getElementById("pacienteIdHidden");
  const inputNomeHidden = document.getElementById("pacienteNomeHidden");
  const inputTelefoneHidden = document.getElementById("pacienteTelefoneHidden");

  try {
    const dadoBruto = localStorage.getItem("pacienteSelecionado");
    if (!dadoBruto) {
      spanNome.textContent = "–";
      spanID.textContent = "–";
      spanTelefone.textContent = "–";
      return;
    }

    const paciente = JSON.parse(dadoBruto);

    if (!paciente || !paciente.id || !paciente.nome) {
      spanNome.textContent = "–";
      spanID.textContent = "–";
      spanTelefone.textContent = "–";
      return;
    }

    spanNome.textContent = paciente.nome;
    spanID.textContent = paciente.id;
    spanTelefone.textContent = paciente.telefone || "–";

    inputIdHidden.value = paciente.id;
    inputNomeHidden.value = paciente.nome;
    inputTelefoneHidden.value = paciente.telefone || "";
  } catch (e) {
    console.error("Erro ao ler paciente do localStorage:", e);
    spanNome.textContent = "–";
    spanID.textContent = "–";
    spanTelefone.textContent = "–";
  }
}

/**
 * Mostra/esconde o campo Convênio de acordo com o tipo de solicitação.
 */
function configurarTipoSolicitacao() {
  const selectTipo = document.getElementById("tipoSolicitacao");
  const grupoConvenio = document.getElementById("grupoConvenio");

  // Começa escondido
  if (grupoConvenio) {
    grupoConvenio.style.display = "none";
  }

  selectTipo.addEventListener("change", () => {
    if (selectTipo.value === "SADT convenio") {
      grupoConvenio.style.display = "block";
    } else {
      grupoConvenio.style.display = "none";
      const convenioInput = document.getElementById("convenio");
      if (convenioInput) convenioInput.value = "";
    }
  });
}

/**
 * Modelos básicos de exames para preencher o select "tipoExame" dependendo da categoria.
 * Você pode ajustar/expandir essa lista depois.
 */
function configurarModelosExame() {
  const selectCategoria = document.getElementById("categoriaExame");
  const selectTipoExame = document.getElementById("tipoExame");
  const textareaTexto = document.getElementById("exameTexto");

  const modelos = {
    imagem: [
      { valor: "USG_prostata", texto: "USG de próstata" },
      { valor: "USG_rins_vias_urinarias", texto: "USG de rins e vias urinárias" },
      { valor: "RM_prostata", texto: "Ressonância magnética de próstata" }
    ],
    laboratorio: [
      { valor: "PSA_total", texto: "PSA total" },
      { valor: "PSA_livre", texto: "PSA livre" },
      { valor: "perfil_hormonal", texto: "Perfil hormonal" }
    ],
    urodinamico: [
      { valor: "estudo_urodinamico", texto: "Estudo urodinâmico" }
    ],
    "biópsia": [
      { valor: "biopsia_prostata", texto: "Biópsia de próstata" }
    ],
    outro: [
      { valor: "outro", texto: "Outro exame" }
    ]
  };

  function carregarOpcoes(categoria) {
    const lista = modelos[categoria] || modelos["outro"];
    selectTipoExame.innerHTML = "";
    lista.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item.valor;
      opt.textContent = item.texto;
      selectTipoExame.appendChild(opt);
    });
  }

  // Inicial
  carregarOpcoes(selectCategoria.value);

  selectCategoria.addEventListener("change", () => {
    carregarOpcoes(selectCategoria.value);
    // Limpa o texto do pedido quando muda a categoria
    textareaTexto.value = "";
  });

  // Quando o tipo de exame muda, opcionalmente preenche um modelo de texto
  selectTipoExame.addEventListener("change", () => {
    const tipo = selectTipoExame.value;

    if (tipo === "USG_prostata") {
      textareaTexto.value =
        "Solicito ultrassonografia de próstata com medida do volume prostático e avaliação de lesões suspeitas. " +
        "Indicação clínica: acompanhamento de doença prostática.";
    } else if (tipo === "USG_rins_vias_urinarias") {
      textareaTexto.value =
        "Solicito ultrassonografia de rins e vias urinárias para avaliação de cálculos, dilatações e anomalias estruturais. " +
        "Indicação clínica: dor lombar / investigação de litíase urinária.";
    } else if (tipo === "RM_prostata") {
      textareaTexto.value =
        "Solicito ressonância magnética de próstata multiparamétrica para avaliação de lesões suspeitas, " +
        "com laudo estruturado PI-RADS, se possível.";
    } else if (tipo === "PSA_total") {
      textareaTexto.value =
        "Solicito dosagem de PSA total em soro para rastreio / acompanhamento de doença prostática.";
    } else if (tipo === "PSA_livre") {
      textareaTexto.value =
        "Solicito dosagem de PSA livre em soro para complementação diagnóstica em conjunto com PSA total.";
    } else if (tipo === "perfil_hormonal") {
      textareaTexto.value =
        "Solicito perfil hormonal com testosterona total, testosterona livre (ou SHBG), LH, FSH, prolactina, estradiol e outros conforme rotina do laboratório.";
    } else if (tipo === "estudo_urodinamico") {
      textareaTexto.value =
        "Solicito estudo urodinâmico completo para avaliação funcional do trato urinário inferior, " +
        "incluindo fluxo-pressão e cistometria, se disponível.";
    } else if (tipo === "biopsia_prostata") {
      textareaTexto.value =
        "Solicito biópsia de próstata guiada por ultrassom transretal, com múltiplos fragmentos setoriais " +
        "conforme protocolo do serviço. Indicação clínica: suspeita de neoplasia prostática.";
    } else {
      // Caso 'outro'
      textareaTexto.value = "";
    }
  });
}

/**
 * Configura os botões de Salvar e Imprimir.
 */
function configurarBotoes() {
  const btnSalvar = document.getElementById("btnSalvarExame");
  const btnImprimir = document.getElementById("btnImprimirExame");

  btnSalvar.addEventListener("click", salvarPedidoExame);
  btnImprimir.addEventListener("click", imprimirPedidoExame);
}

/**
 * Monta o payload e envia para o Apps Script, salvando na aba Exames.
 */
async function salvarPedidoExame() {
  const mensagemDiv = document.getElementById("mensagemExame");

  limparMensagem(mensagemDiv);

  const idPaciente = document.getElementById("pacienteIdHidden").value.trim();
  const nomePaciente = document.getElementById("pacienteNomeHidden").value.trim();
  const telefonePaciente = document.getElementById("pacienteTelefoneHidden").value.trim();

  if (!idPaciente || !nomePaciente) {
    mostrarMensagem(mensagemDiv, "Selecione um paciente antes de registrar exames.", "erro");
    return;
  }

  const tipoSolicitacao = document.getElementById("tipoSolicitacao").value;
  const convenio = document.getElementById("convenio").value.trim();
  const dataPedido = document.getElementById("exameData").value;
  const categoria = document.getElementById("categoriaExame").value;
  const tipoExame = document.getElementById("tipoExame").value;
  const textoPedido = document.getElementById("exameTexto").value.trim();
  const observacoesInternas = document.getElementById("exameObs").value.trim();
  const urgente = document.getElementById("flagUrgente").checked ? "Sim" : "Não";

  if (!tipoSolicitacao) {
    mostrarMensagem(mensagemDiv, "Informe o tipo da solicitação (SADT convênio ou exame particular).", "erro");
    return;
  }

  if (!dataPedido || !tipoExame || !textoPedido) {
    mostrarMensagem(mensagemDiv, "Preencha data, tipo de exame e o texto do pedido.", "erro");
    return;
  }

  const payload = {
    action: "salvarExame",
    idPaciente,
    nomePaciente,
    telefonePaciente,
    tipoSolicitacao,
    convenio,
    dataPedido,
    categoria,
    tipoExame,
    textoPedido,
    observacoesInternas,
    urgente
  };

  try {
    mostrarMensagem(mensagemDiv, "Salvando solicitação...", "sucesso");

    const resposta = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    const dados = await resposta.json();

    if (dados && dados.ok) {
      mostrarMensagem(mensagemDiv, "Pedido de exame salvo com sucesso.", "sucesso");
      adicionarNoHistoricoLocal({
        dataPedido,
        categoria,
        tipoExame,
        urgente,
        tipoSolicitacao,
        convenio
      });
      limparCamposExame();
    } else {
      console.error("Resposta Apps Script:", dados);
      mostrarMensagem(mensagemDiv, "Não foi possível salvar. Tente novamente.", "erro");
    }
  } catch (erro) {
    console.error("Erro ao enviar para o Apps Script:", erro);
    mostrarMensagem(mensagemDiv, "Erro de comunicação com o servidor.", "erro");
  }
}

/**
 * Apenas dispara a impressão da página.
 * Depois você pode refinar para imprimir só o pedido.
 */
function imprimirPedidoExame() {
  window.print();
}

/**
 * Mostra mensagem de feedback.
 */
function mostrarMensagem(el, texto, tipo) {
  el.textContent = texto;
  el.classList.remove("sucesso", "erro");
  if (tipo === "sucesso") el.classList.add("sucesso");
  if (tipo === "erro") el.classList.add("erro");
  el.style.display = "block";
}

function limparMensagem(el) {
  el.textContent = "";
  el.classList.remove("sucesso", "erro");
  el.style.display = "none";
}

/**
 * Limpa apenas os campos do pedido (não mexe nos dados do paciente).
 */
function limparCamposExame() {
  document.getElementById("exameData").value = "";
  document.getElementById("exameTexto").value = "";
  document.getElementById("exameObs").value = "";
  document.getElementById("flagUrgente").checked = false;
  // Mantém categoria e tipoExame; se quiser limpar, descomente:
  // document.getElementById("categoriaExame").value = "imagem";
  // configurarModelosExame(); // chamaria de novo
}

/**
 * Adiciona um item simples no histórico em tela (lado cliente).
 * Depois você pode trocar para carregar do Google Sheets.
 */
function adicionarNoHistoricoLocal(dados) {
  const container = document.getElementById("historicoExames");
  const div = document.createElement("div");
  div.className = "exame-item";

  const header = document.createElement("div");
  header.className = "exame-item-header";

  const titulo = document.createElement("span");
  titulo.textContent = dados.tipoExame || "Exame";

  const flag = document.createElement("span");
  if (dados.urgente === "Sim") {
    flag.textContent = "Urgente";
    flag.style.color = "#b91c1c";
    flag.style.fontSize = "0.8rem";
  } else {
    flag.textContent = "";
  }

  header.appendChild(titulo);
  header.appendChild(flag);

  const meta = document.createElement("div");
  meta.className = "exame-item-meta";
  const partes = [];

  if (dados.dataPedido) partes.push(`Data: ${dados.dataPedido}`);
  if (dados.categoria) partes.push(`Categoria: ${dados.categoria}`);
  if (dados.tipoSolicitacao) partes.push(`Tipo: ${dados.tipoSolicitacao}`);
  if (dados.convenio) partes.push(`Convênio: ${dados.convenio}`);

  meta.textContent = partes.join(" | ");

  div.appendChild(header);
  div.appendChild(meta);

  container.prepend(div);
}
