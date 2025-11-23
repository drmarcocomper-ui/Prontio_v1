/******************************************************
 * UTIL – Funções auxiliares usadas em todo o sistema
 * 
 * IMPORTANTE:
 * - Funções centrais como getSheet_, rowToObject_,
 *   listAllRowsAsObjects_, jsonResponse_, jsonError_,
 *   parseJsonBody_, gerarId_, formatDate_ já estão em Code.gs
 *   para evitar duplicação e conflito de definição.
 *
 * Aqui mantemos apenas helpers complementares.
 ******************************************************/

/**
 * Retorna o Spreadsheet ativo.
 * Útil se em algum momento você quiser trocar para outro arquivo.
 */
function getSpreadsheet_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Retorna um mapa {NomeDaColuna: índiceColuna}
 * Ex.: { ID_Paciente: 1, NomePaciente: 2, ... }
 */
function getHeaderMap_(sheet) {
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) return {};

  const header = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const map = {};
  header.forEach((name, i) => {
    if (name) {
      map[String(name)] = i + 1; // colunas são 1-based
    }
  });
  return map;
}

/**
 * upsertRow_
 *
 * Faz insert/update genérico em uma aba baseada em um campo ID.
 * - sheet: objeto de planilha
 * - headerIdName: nome da coluna ID (ex.: "ID_Paciente")
 * - idValue: valor atual do ID (null/"" se for novo)
 * - dataObj: objeto com dados vindos do front
 * - extraForNew: objeto com campos adicionais apenas para novos registros
 *
 * Retorna:
 *   { id: <id final>, row: <linha gravada> }
 */
function upsertRow_(sheet, headerIdName, idValue, dataObj, extraForNew) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const header = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  // Mapa de colunas: { NomeColuna: índice }
  const colMap = {};
  header.forEach((h, i) => {
    if (h) colMap[String(h)] = i + 1;
  });

  const idCol = colMap[headerIdName];
  if (!idCol) {
    throw new Error("Coluna de ID não encontrada: " + headerIdName);
  }

  let targetRow = 0;

  // Se veio ID -> tenta achar linha existente
  if (idValue && lastRow > 1) {
    const ids = sheet.getRange(2, idCol, lastRow - 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(idValue)) {
        targetRow = i + 2; // +1 cabeçalho, +1 índice 0
        break;
      }
    }
  }

  // Se não encontrou -> nova linha no fim
  if (!targetRow) {
    targetRow = lastRow + 1;

    // se não vier ID, gera um
    if (!idValue) {
      idValue = gerarId_(); // função definida em Code.gs
    }

    // Garante que o objeto tenha o ID
    dataObj[headerIdName] = idValue;

    // Campos extras apenas para novos registros (ex.: DataCadastro, Ativo)
    if (extraForNew && typeof extraForNew === "object") {
      Object.assign(dataObj, extraForNew);
    }
  }

  // Monta a linha na ordem do cabeçalho
  const row = new Array(header.length).fill("");
  header.forEach((h, i) => {
    if (!h) return;
    row[i] = dataObj.hasOwnProperty(h) ? dataObj[h] : "";
  });

  sheet.getRange(targetRow, 1, 1, header.length).setValues([row]);

  return { id: idValue, row: targetRow };
}

/**
 * formatTime_
 * Formata um Date apenas como horário "HH:mm"
 */
function formatTime_(date) {
  if (!(date instanceof Date)) return "";
  return Utilities.formatDate(date, "America/Sao_Paulo", "HH:mm");
}
