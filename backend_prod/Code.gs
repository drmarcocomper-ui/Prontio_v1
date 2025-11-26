/******************************************************
 * PRONTIO – BACKEND UNIFICADO (Code.gs)
 ******************************************************/

const CONFIG = {
  ABA_PACIENTES:       "Pacientes",
  ABA_PRONTUARIO:      "Prontuario",
  ABA_AGENDA:          "Agenda",
  ABA_RECEITAS:        "Receitas",
  ABA_EVOLUCAO:        "Consultas",
  ABA_EXAMES:          "Exames",
  ABA_LAUDOS:          "Laudos",
  ABA_ATESTADOS:       "Atestados",
  ABA_COMPARECIMENTO:  "Comparecimento",
  ABA_MEDICAMENTOS:    "Medicamentos",
  ABA_SADT:            "SADT",
  ABA_CONSENTIMENTO:   "Consentimento",
  ABA_ENCAMINHAMENTO:  "Encaminhamento",
  ABA_PROF_DESTINO:    "ProfissionaisDestino"
};

/******************************************************
 * GET – Teste rápido de saúde da API
 ******************************************************/
function doGet(e) {
  const action = e?.parameter?.action;

  if (action === "ping") {
    return jsonResponse_({
      ok: true,
      mensagem: "PRONTIO API ativa."
    });
  }

  return jsonResponse_({
    ok: true,
    mensagem: "Backend PRONTIO ativo."
  });
}

/******************************************************
 * POST – Roteador principal da API
 ******************************************************/
function doPost(e) {
  try {
    const body = parseJsonBody_(e);
    const action = body.action;

    if (!action) {
      return jsonError_("Parâmetro 'action' é obrigatório.");
    }

    let data;

    switch (action) {

      /***********************
       * PACIENTES
       ************************/
      case "pacientes-salvar":
        data = pacientesSalvar_(body);
        break;

      case "pacientes-listar":
        data = pacientesListar_(body);
        break;

      case "pacientes-obter":
        data = pacientesObter_(body);
        break;


      /***********************
       * AGENDA
       ************************/
      case "agenda-salvar":
        data = agendaSalvar_(body);
        break;

      case "agenda-listar": {
        const lista = agendaListar_(body);
        return jsonResponse_({
          ok: true,
          action,
          lista,
          data: lista
        });
      }

      case "agenda-listar-data":
        data = agendaListarPorData_(body);
        break;

      case "agenda-listar-paciente":
        data = agendaListarPorPaciente_(body);
        break;

      case "agenda-atualizar-status":
        data = agendaAtualizarStatus_(body);
        break;


      /***********************
       * EVOLUÇÃO / CONSULTAS
       ************************/
      case "evolucao-salvar":
        data = evolucaoSalvar_(body);
        break;

      case "evolucao-listar-paciente":
      case "evolucao-por-paciente":
        data = evolucaoListarPorPaciente_(body);
        break;


      /***********************
       * RECEITAS
       ************************/
      case "receita-salvar":
        data = receitaSalvar_(body);
        break;

      case "receita-listar-paciente":
      case "receitas-por-paciente":
        data = receitaListarPorPaciente_(body);
        break;


      /***********************
       * MEDICAMENTOS
       ************************/
      case "medicamentos-listar":
        data = medicamentosListar_(body);
        break;


      /***********************
       * EXAMES
       ************************/
      case "exame-salvar":
        data = exameSalvar_(body);
        break;

      case "exame-listar-paciente":
      case "exames-por-paciente":
        data = exameListarPorPaciente_(body);
        break;


      /***********************
       * LAUDOS
       ************************/
      case "laudo-salvar":
        data = laudoSalvar_(body);
        break;

      case "laudo-listar-paciente":
      case "laudos-por-paciente":
        data = laudoListarPorPaciente_(body);
        break;


      /***********************
       * ATESTADOS
       ************************/
      case "atestado-salvar":
        data = atestadoSalvar_(body);
        break;

      case "atestado-listar-paciente":
      case "atestados-por-paciente":
        data = atestadoListarPorPaciente_(body);
        break;


      /***********************
       * DECLARAÇÃO COMPARECIMENTO
       ************************/
      case "comparecimento-salvar":
        data = comparecimentoSalvar_(body);
        break;

      case "comparecimento-listar-paciente":
      case "comparecimentos-por-paciente":
        data = comparecimentoListarPorPaciente_(body);
        break;


      /***********************
       * SADT
       ************************/
      case "sadt-salvar":
        data = sadtSalvar_(body);
        break;

      case "sadt-listar-paciente":
        data = sadtListarPorPaciente_(body);
        break;


      /***********************
       * CONSENTIMENTO
       ************************/
      case "consentimento-salvar":
        data = consentimentoSalvar_(body);
        break;

      case "consentimento-listar-paciente":
        data = consentimentoListarPorPaciente_(body);
        break;


      /***********************
       * PROFISSIONAIS DE DESTINO
       ************************/
      case "profissionaisdestino-listar":
        data = profissionaisDestinoListar_(body);
        break;


      /***********************
       * ENCAMINHAMENTO
       ************************/
      case "encaminhamento-salvar":
        data = encaminhamentoSalvar_(body);
        break;

      case "encaminhamento-listar-paciente":
      case "encaminhamentos-por-paciente":
        data = encaminhamentoListarPorPaciente_(body);
        break;


      /***********************
       * PRONTUÁRIO (TIMELINE)
       ************************/
      case "listarProntuarioPorPaciente": {
        const registros = listarProntuarioPorPaciente_(body);
        return jsonResponse_({
          ok: true,
          action,
          data: registros,
          registros
        });
      }

      /***********************
       * DEFAULT
       ************************/
      default:
        return jsonError_("Action não reconhecida: " + action);
    }

    return jsonResponse_({
      ok: true,
      action,
      data
    });

  } catch (err) {
    return jsonError_(err);
  }
}

/******************************************************
 * HELPERS – JSON / Sheets / Utils
 ******************************************************/
function parseJsonBody_(e) {
  if (!e?.postData?.contents) {
    throw new Error("Body vazio ou inválido.");
  }
  return JSON.parse(e.postData.contents);
}

function jsonResponse_(obj) {
  // ❌ NADA de .setHeader aqui – TextOutput não tem esse método
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonError_(err) {
  return jsonResponse_({
    ok: false,
    erro: err?.message || String(err)
  });
}

function getSheet_(nomeAba) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(nomeAba);
  if (!sh) throw new Error("Aba não encontrada: " + nomeAba);
  return sh;
}

function rowToObject_(header, row) {
  const obj = {};
  header.forEach((col, idx) => obj[col] = row[idx]);
  return obj;
}

function listAllRowsAsObjects_(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  if (lastRow < 2) return [];

  const header = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const rows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

  return rows.map(r => rowToObject_(header, r));
}

function gerarId_() {
  return Utilities.formatDate(new Date(), "America/Sao_Paulo", "yyyyMMddHHmmssSSS");
}

/******************************************************
 * PRONTUÁRIO
 ******************************************************/
function registrarNoProntuario_(idPaciente, tipo, titulo, descricao) {
  if (!idPaciente || !tipo) return;

  const sh = getSheet_(CONFIG.ABA_PRONTUARIO);
  sh.appendRow([
    String(idPaciente),
    String(tipo).toLowerCase(),
    new Date(),
    titulo || "",
    descricao || ""
  ]);
}

function listarProntuarioPorPaciente_(body) {
  const idPaciente = body.idPaciente;
  if (!idPaciente) return [];

  const sh = getSheet_(CONFIG.ABA_PRONTUARIO);
  const dados = sh.getDataRange().getValues();

  if (dados.length < 2) return [];

  const cab = dados[0];
  const idxID        = cab.indexOf("ID_Paciente");
  const idxTipo      = cab.indexOf("Tipo");
  const idxDataHora  = cab.indexOf("DataHora");
  const idxTitulo    = cab.indexOf("Titulo");
  const idxDescricao = cab.indexOf("Descricao");

  if (idxID < 0 || idxTipo < 0 || idxDataHora < 0) return [];

  const tz = Session.getScriptTimeZone();
  const registros = [];

  for (let i = dados.length - 1; i >= 1; i--) {
    const linha = dados[i];

    if (String(linha[idxID]).trim() !== String(idPaciente).trim()) continue;

    let dataFormatada = "";
    if (linha[idxDataHora] instanceof Date) {
      dataFormatada = Utilities.formatDate(
        linha[idxDataHora],
        tz,
        "dd/MM/yyyy HH:mm"
      );
    } else {
      dataFormatada = String(linha[idxDataHora] || "");
    }

    registros.push({
      tipo: linha[idxTipo] || "",
      tipoTexto: mapTipoProntuario_(linha[idxTipo]),
      data: dataFormatada,
      titulo: linha[idxTitulo] || "",
      texto: linha[idxDescricao] || ""
    });
  }

  return registros;
}

function mapTipoProntuario_(tipo) {
  switch (String(tipo).toLowerCase()) {
    case "evolucao":        return "Evolução";
    case "receita":         return "Receita";
    case "exame":           return "Exame / Pedido de Exame";
    case "laudo":           return "Laudo";
    case "atestado":        return "Atestado";
    case "comparecimento":  return "Declaração de Comparecimento";
    case "encaminhamento":  return "Encaminhamento";
    case "sadt":            return "Solicitação SADT";
    case "consentimento":   return "Consentimento Informado";
    default:                return "Registro";
  }
}
