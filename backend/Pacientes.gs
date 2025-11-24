/******************************************************
 * PACIENTES – CRUD compatível com pacientes.js
 *
 * Aba: CONFIG.ABA_PACIENTES = "Pacientes"
 *
 * Cabeçalhos esperados na linha 1:
 *  ID_Paciente
 *  DataCadastro
 *  NomePaciente
 *  DataNascimento
 *  Sexo
 *  CPF
 *  RG
 *  Telefone1
 *  Telefone2
 *  Email
 *  EnderecoRua
 *  EnderecoNumero
 *  EnderecoBairro
 *  EnderecoCidade
 *  EnderecoUF
 *  EnderecoCEP
 *  Alergias
 *  MedicacoesEmUso
 *  DoencasCronicas
 *  ObsImportantes
 *  PlanoSaude
 *  NumeroCarteirinha
 *  ValidadeCarteirinha
 *  Ativo
 *  DataUltimaConsulta
 ******************************************************/

/**
 * Salvar paciente
 * Action: "pacientes-salvar"
 *
 * Aceita:
 *  { action:"pacientes-salvar", dados:{ ...campos de paciente.js... } }
 *  { action:"pacientes-salvar", payload:{ ... } }
 *  { action:"pacientes-salvar", NomePaciente:"...", ... }
 */
function pacientesSalvar_(body) {
  const dados = body.dados || body.payload || body || {};
  const sh = getSheet_(CONFIG.ABA_PACIENTES);

  const lastRow = sh.getLastRow();
  if (lastRow < 1) {
    throw new Error("Aba 'Pacientes' sem cabeçalho. Crie a linha 1 com os nomes de colunas.");
  }

  const lastCol = sh.getLastColumn();
  const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];

  const idxId           = header.indexOf("ID_Paciente");
  const idxDataCadastro = header.indexOf("DataCadastro");

  if (idxId === -1) {
    throw new Error("Coluna 'ID_Paciente' não encontrada na aba 'Pacientes'.");
  }

  if (!dados.NomePaciente && !dados.ID_Paciente) {
    throw new Error("Campo 'NomePaciente' é obrigatório para novo paciente.");
  }

  let idPaciente = (dados.ID_Paciente || dados.idPaciente || "").toString().trim();
  let rowValues;
  let targetRow = -1;

  // Edição: tentar localizar pela coluna ID_Paciente
  if (idPaciente) {
    const dataPlanilha = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();
    for (let i = 0; i < dataPlanilha.length; i++) {
      const linha = dataPlanilha[i];
      if (String(linha[idxId]).trim() === idPaciente) {
        targetRow = i + 2;
        rowValues = linha.slice();
        break;
      }
    }
  }

  const isNovo = targetRow === -1;

  if (isNovo) {
    idPaciente = gerarId_();
    rowValues = new Array(header.length).fill("");
    rowValues[idxId] = idPaciente;

    if (idxDataCadastro > -1) {
      rowValues[idxDataCadastro] = new Date();
    }
  }

  // Copia dados para as colunas com o mesmo nome
  for (let i = 0; i < header.length; i++) {
    const colName = header[i];
    if (!colName) continue;

    if (colName === "ID_Paciente") continue;
    if (colName === "DataCadastro" && isNovo) continue; // já setado

    if (Object.prototype.hasOwnProperty.call(dados, colName)) {
      rowValues[i] = dados[colName];
    }
  }

  // Se não veio "Ativo" em novo cadastro, assume "S"
  const idxAtivo = header.indexOf("Ativo");
  if (isNovo && idxAtivo > -1 && !rowValues[idxAtivo]) {
    rowValues[idxAtivo] = "S";
  }

  // Grava
  if (isNovo) {
    sh.appendRow(rowValues);
  } else {
    sh.getRange(targetRow, 1, 1, lastCol).setValues([rowValues]);
  }

  const pacienteObj = rowToObject_(header, rowValues);

  return {
    idPaciente: idPaciente,
    paciente: pacienteObj,
    isNovo: isNovo
  };
}

/**
 * Listar pacientes
 * Action: "pacientes-listar"
 *
 * Retorno (injetado em doPost):
 *  { ok:true, total, pacientes, data:{total,pacientes} }
 */
function pacientesListar_(body) {
  const sh = getSheet_(CONFIG.ABA_PACIENTES);
  const lista = listAllRowsAsObjects_(sh);
  return {
    total: lista.length,
    pacientes: lista
  };
}

/**
 * Obter paciente por ID
 * Action: "pacientes-obter"
 *
 * Aceita:
 *  { action:"pacientes-obter", idPaciente:"..." }
 *  { action:"pacientes-obter", payload:{ idPaciente:"..." } }
 */
function pacientesObter_(body) {
  const payload = body.payload || body || {};
  const idPaciente = payload.idPaciente || payload.ID_Paciente;

  if (!idPaciente) {
    throw new Error("idPaciente é obrigatório em 'pacientes-obter'.");
  }

  const sh = getSheet_(CONFIG.ABA_PACIENTES);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) {
    return { paciente: null };
  }

  const lastCol = sh.getLastColumn();
  const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  const idxId = header.indexOf("ID_Paciente");
  if (idxId === -1) {
    throw new Error("Coluna 'ID_Paciente' não encontrada na aba 'Pacientes'.");
  }

  const dadosPlanilha = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();
  for (let i = 0; i < dadosPlanilha.length; i++) {
    const linha = dadosPlanilha[i];
    if (String(linha[idxId]).trim() === String(idPaciente).trim()) {
      const obj = rowToObject_(header, linha);
      return { paciente: obj };
    }
  }

  return { paciente: null };
}
