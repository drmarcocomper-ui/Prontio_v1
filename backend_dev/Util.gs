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
 *
 * Útil para evitar ficar procurando índice de coluna "na mão".
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
 *
 * Parâmetros:
 *  - sheet:        objeto de planilha (Sheet)
 *  - headerIdName: nome da coluna ID (ex.: "ID_Paciente")
 *  - idValue:      valor atual do ID (null/"" se for novo)
 *  - dataObj:      objeto com dados vindos do front, já normalizado
 *  - extraForNew:  objeto com campos adicionais apenas para novos registros
 *
 * Comportamento:
 *  - Se idValue corresponder a uma linha existente → atualiza essa linha.
 *  - Se não encontrar → insere nova linha no final da aba.
 *  - Se não vier ID, gera um novo via gerarId_().
 *  - Garante que a coluna de ID SEMPRE seja preenchida na linha.
 *
 * Retorna:
 *   { id: <id final>, row: <linha gravada> }
 */
function upsertRow_(sheet, headerIdName, idValue, dataObj, extraForNew) {
  if (!sheet) {
    throw new Error("Sheet não fornecida em upsertRow_.");
  }

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  if (lastCol === 0) {
    throw new Error("Aba sem cabeçalho (nenhuma coluna encontrada) em upsertRow_.");
  }

  // Cabeçalho
  const header = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  // Mapa de colunas: { NomeColuna: índice (1-based) }
  const colMap = {};
  header.forEach((h, i) => {
    if (h) colMap[String(h)] = i + 1;
  });

  const idCol = colMap[headerIdName];
  if (!idCol) {
    throw new Error("Coluna de ID não encontrada: " + headerIdName);
  }

  let targetRow = 0;
  let idFinal = idValue;

  // Se veio ID e há linhas de dados, tenta localizar linha existente
  if (idFinal && lastRow > 1) {
    const ids = sheet.getRange(2, idCol, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(idFinal)) {
        targetRow = i + 2; // +1 cabeçalho, +1 índice 0
        break;
      }
    }
  }

  const isNovo = !targetRow;

  // Garante que dataObj seja um objeto
  if (!dataObj || typeof dataObj !== "object") {
    dataObj = {};
  }

  // Se for novo registro
  if (isNovo) {
    // Próxima linha após o cabeçalho ou último registro
    const linhaBase = lastRow >= 1 ? lastRow : 1;
    targetRow = linhaBase + 1;

    // Se não veio ID, gera um
    if (!idFinal) {
      idFinal = gerarId_(); // função definida em Code.gs
    }

    // Garante que o objeto tenha o ID
    dataObj[headerIdName] = idFinal;

    // Campos extras apenas para novos registros (ex.: DataCadastro, Ativo, etc.)
    if (extraForNew && typeof extraForNew === "object") {
      Object.assign(dataObj, extraForNew);
    }
  } else {
    // Atualização: garante que o ID NÃO seja apagado
    if (!idFinal) {
      // Se por algum motivo idFinal está vazio, é melhor falhar
      throw new Error("ID inexistente em atualização de " + headerIdName + ".");
    }
    dataObj[headerIdName] = idFinal;
  }

  // Monta a linha na ordem do cabeçalho
  const row = new Array(header.length).fill("");
  header.forEach((h, i) => {
    if (!h) return;
    const key = String(h);
    // Usa hasOwnProperty para permitir valores falsy (0, "", false)
    row[i] = Object.prototype.hasOwnProperty.call(dataObj, key)
      ? dataObj[key]
      : "";
  });

  // Grava na planilha
  sheet.getRange(targetRow, 1, 1, header.length).setValues([row]);

  return { id: idFinal, row: targetRow };
}

/**
 * formatTime_
 * Formata um Date apenas como horário "HH:mm"
 */
function formatTime_(date) {
  if (!(date instanceof Date)) return "";
  return Utilities.formatDate(date, "America/Sao_Paulo", "HH:mm");
}
