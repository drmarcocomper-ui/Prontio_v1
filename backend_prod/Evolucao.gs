/******************************************************
 * EVOLUÇÃO / CONSULTAS – compatível com evolucao.js
 *
 * Aba: CONFIG.ABA_EVOLUCAO = "Consultas"
 *
 * Cabeçalhos esperados na linha 1:
 *  ID_Consulta
 *  Data
 *  Hora
 *  ID_Paciente
 *  NomePaciente
 *  Tipo
 *  Evolucao
 *  CriadoEm
 ******************************************************/

/**
 * Salvar evolução
 * Action: "evolucao-salvar"
 *
 * Aceita:
 *  { action:"evolucao-salvar", dados:{ idPaciente, NomePaciente, Data, Hora, Tipo, Evolucao } }
 *  { action:"evolucao-salvar", payload:{...} }
 *  { action:"evolucao-salvar", idPaciente:"...", Evolucao:"...", ... }
 */
function evolucaoSalvar_(body) {
  const dados = body.dados || body.payload || body || {};
  const sh = getSheet_(CONFIG.ABA_EVOLUCAO);

  const lastRow = sh.getLastRow();
  if (lastRow < 1) {
    throw new Error("Aba 'Consultas' sem cabeçalho. Crie a linha 1 com os nomes de colunas.");
  }

  const lastCol = sh.getLastColumn();
  const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];

  const idxIdConsulta  = header.indexOf("ID_Consulta");
  const idxIdPaciente  = header.indexOf("ID_Paciente");
  const idxData        = header.indexOf("Data");
  const idxHora        = header.indexOf("Hora");
  const idxCriadoEm    = header.indexOf("CriadoEm");

  if (idxIdConsulta === -1 || idxIdPaciente === -1) {
    throw new Error("Colunas 'ID_Consulta' e/ou 'ID_Paciente' não encontradas na aba 'Consultas'.");
  }

  const idPacienteCampo =
    dados.idPaciente || dados.ID_Paciente || dados.IdPaciente || "";
  if (!idPacienteCampo) {
    throw new Error("idPaciente é obrigatório em 'evolucao-salvar'.");
  }

  if (!dados.Evolucao && !dados.ID_Consulta) {
    throw new Error("Para nova evolução é necessário pelo menos o campo 'Evolucao'.");
  }

  let idConsulta = (dados.ID_Consulta || dados.idConsulta || "").toString().trim();
  let rowValues;
  let targetRow = -1;

  // Edição: procurar pelo ID_Consulta
  if (idConsulta) {
    const dadosPlanilha = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();
    for (let i = 0; i < dadosPlanilha.length; i++) {
      const linha = dadosPlanilha[i];
      if (String(linha[idxIdConsulta]).trim() === idConsulta) {
        targetRow = i + 2;
        rowValues = linha.slice();
        break;
      }
    }
  }

  const isNovo = targetRow === -1;

  if (isNovo) {
    idConsulta = gerarId_();
    rowValues = new Array(header.length).fill("");
    rowValues[idxIdConsulta] = idConsulta;
    rowValues[idxIdPaciente] = idPacienteCampo;
  }

  // Copia campos pelo nome da coluna
  for (let i = 0; i < header.length; i++) {
    const colName = header[i];
    if (!colName) continue;

    if (colName === "ID_Consulta") continue;
    if (colName === "ID_Paciente") continue;
    if (colName === "CriadoEm" && isNovo) continue; // trata logo abaixo

    if (Object.prototype.hasOwnProperty.call(dados, colName)) {
      rowValues[i] = dados[colName];
    }
  }

  // Se for nova evolução e não vierem Data/Hora, usar data/hora atuais
  const tz = Session.getScriptTimeZone() || "America/Sao_Paulo";

  if (isNovo && idxData > -1 && !rowValues[idxData]) {
    rowValues[idxData] = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd");
  }
  if (isNovo && idxHora > -1 && !rowValues[idxHora]) {
    rowValues[idxHora] = Utilities.formatDate(new Date(), tz, "HH:mm");
  }
  if (isNovo && idxCriadoEm > -1 && !rowValues[idxCriadoEm]) {
    rowValues[idxCriadoEm] = new Date();
  }

  // Grava
  if (isNovo) {
    sh.appendRow(rowValues);
  } else {
    sh.getRange(targetRow, 1, 1, lastCol).setValues([rowValues]);
  }

  const evoObj = rowToObject_(header, rowValues);

  // Atualiza DataUltimaConsulta na aba Pacientes (se existir)
  try {
    atualizarDataUltimaConsulta_(idPacienteCampo, rowValues[idxData] || null);
  } catch (e) {
    Logger.log("Erro ao atualizar DataUltimaConsulta: " + e);
  }

  // Registra no Prontuário (timeline)
  try {
    const nome = dados.NomePaciente || evoObj.NomePaciente || "";
    const texto = dados.Evolucao || evoObj.Evolucao || "";
    registrarNoProntuario_(
      idPacienteCampo,
      "evolucao",
      nome ? "Evolução - " + nome : "Evolução clínica",
      texto
    );
  } catch (e2) {
    Logger.log("Erro ao registrar no prontuário: " + e2);
  }

  return {
    idEvolucao: idConsulta, // mantém o nome "idEvolucao" se o front quiser usar
    evolucao: evoObj,
    isNovo: isNovo
  };
}

/**
 * Lista evoluções de um paciente
 * Actions: "evolucao-listar-paciente" ou "evolucao-por-paciente"
 */
function evolucaoListarPorPaciente_(body) {
  const payload = body.payload || body || {};
  const idPaciente =
    payload.idPaciente || payload.ID_Paciente || payload.IdPaciente;

  if (!idPaciente) {
    throw new Error("idPaciente é obrigatório em 'evolucao-listar-paciente'.");
  }

  const sh = getSheet_(CONFIG.ABA_EVOLUCAO);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) {
    return { idPaciente, total: 0, lista: [], evolucoes: [] };
  }

  const lastCol = sh.getLastColumn();
  const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  const idxIdPaciente = header.indexOf("ID_Paciente");
  if (idxIdPaciente === -1) {
    throw new Error("Coluna 'ID_Paciente' não encontrada na aba 'Consultas'.");
  }

  const dadosPlanilha = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();
  const lista = [];

  for (let i = 0; i < dadosPlanilha.length; i++) {
    const linha = dadosPlanilha[i];
    if (String(linha[idxIdPaciente]).trim() === String(idPaciente).trim()) {
      lista.push(rowToObject_(header, linha));
    }
  }

  return {
    idPaciente: idPaciente,
    total: lista.length,
    lista: lista,
    evolucoes: lista
  };
}

/**
 * Atualiza DataUltimaConsulta na aba Pacientes, se a coluna existir.
 */
function atualizarDataUltimaConsulta_(idPaciente, dataISO) {
  const sh = getSheet_(CONFIG.ABA_PACIENTES);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return;

  const lastCol = sh.getLastColumn();
  const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];

  const idxId  = header.indexOf("ID_Paciente");
  const idxDUC = header.indexOf("DataUltimaConsulta");
  if (idxId === -1 || idxDUC === -1) return;

  const dadosPac = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();
  for (let i = 0; i < dadosPac.length; i++) {
    const linha = dadosPac[i];
    if (String(linha[idxId]).trim() === String(idPaciente).trim()) {
      const rowIndex = i + 2;
      // Usa data atual como "última consulta"
      sh.getRange(rowIndex, idxDUC + 1).setValue(new Date());
      break;
    }
  }
}
