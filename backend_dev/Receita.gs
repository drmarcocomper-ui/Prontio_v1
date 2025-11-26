/******************************************************
 * RECEITAS – BACKEND PRONTIO
 * Aba: CONFIG.ABA_RECEITAS
 *
 * Colunas esperadas:
 * ID_Receita | ID_Paciente | NomePaciente | Data | Hora |
 * ItemNumero | ID_Medicamento | NomeMedicacao |
 * DescricaoCompleta | TipoReceita | Observacoes | UrlPdf
 ******************************************************/

/**
 * Salva uma receita com múltiplos itens (medicamentos)
 * Action: "receita-salvar"
 *
 * O frontend envia:
 * dados = {
 *   ID_Receita,
 *   ID_Paciente,
 *   NomePaciente,
 *   Data,
 *   Hora,
 *   TipoReceita,
 *   Observacoes,
 *   UrlPdf (opcional)
 *   itens: [
 *     { ItemNumero, ID_Medicamento, NomeMedicacao, DescricaoCompleta }
 *   ]
 * }
 */
function receitaSalvar_(body) {
  const dados = body.dados || body.receita || body;
  const sheet = getSheet_(CONFIG.ABA_RECEITAS);
  const tz = "America/Sao_Paulo";
  const agora = new Date();

  let idReceita = dados.ID_Receita || dados.id || "";
  if (!idReceita) {
    idReceita = gerarId_();
  }

  const itens = dados.itens || [];
  if (!itens.length) {
    throw new Error("Receita sem itens. Informe pelo menos um medicamento.");
  }

  const lastCol = sheet.getLastColumn();
  const header = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const colMap = {};
  header.forEach((col, i) => {
    if (col) colMap[col] = i; // índice 0-based para o array da linha
  });

  // Data/Hora padrão (no formato adequado para ordenação)
  const dataFinal =
    dados.Data ||
    dados.data ||
    Utilities.formatDate(agora, tz, "yyyy-MM-dd");

  const horaFinal =
    dados.Hora ||
    dados.hora ||
    Utilities.formatDate(agora, tz, "HH:mm");

  /******************************************************
   * Se a receita já existir, removemos as linhas antigas
   * com o mesmo ID_Receita antes de gravar a nova versão.
   ******************************************************/
  if (sheet.getLastRow() > 1 && colMap["ID_Receita"] !== undefined) {
    const idColIndex = colMap["ID_Receita"]; // índice no array (0-based)
    const dadosExistentes = sheet.getRange(2, 1, sheet.getLastRow() - 1, lastCol).getValues();

    // Apagar de baixo pra cima para não bagunçar o índice
    for (let i = dadosExistentes.length - 1; i >= 0; i--) {
      const linha = dadosExistentes[i];
      const idLinha = linha[idColIndex];
      if (String(idLinha || "") === String(idReceita)) {
        sheet.deleteRow(i + 2); // +2 por causa do cabeçalho
      }
    }
  }

  /******************************************************
   * Monta as novas linhas da receita (1 por item)
   ******************************************************/
  const linhas = [];

  itens.forEach((item, index) => {
    const linha = new Array(header.length).fill("");

    function set(colName, value) {
      if (colMap[colName] !== undefined) {
        linha[colMap[colName]] = value;
      }
    }

    const idPaciente =
      dados.ID_Paciente ||
      dados.idPaciente ||
      dados.IdPaciente ||
      "";

    const nomePaciente =
      dados.NomePaciente ||
      dados.nomePaciente ||
      "";

    set("ID_Receita", idReceita);
    set("ID_Paciente", idPaciente);
    set("NomePaciente", nomePaciente);
    set("Data", dataFinal);
    set("Hora", horaFinal);
    set("ItemNumero", item.ItemNumero || index + 1);
    set("ID_Medicamento", item.ID_Medicamento || "");
    set("NomeMedicacao", item.NomeMedicacao || "");
    set("DescricaoCompleta", item.DescricaoCompleta || "");
    set("TipoReceita", dados.TipoReceita || "");
    set("Observacoes", dados.Observacoes || "");
    set("UrlPdf", dados.UrlPdf || "");

    linhas.push(linha);
  });

  if (linhas.length) {
    const start = sheet.getLastRow() + 1;
    sheet.getRange(start, 1, linhas.length, header.length).setValues(linhas);
  }

  /******************************************************
   * Registrar no PRONTUÁRIO
   ******************************************************/
  const idPacProntuario =
    dados.ID_Paciente ||
    dados.idPaciente ||
    "";

  registrarNoProntuario_(
    idPacProntuario,
    "receita",
    "Receita Médica",
    "Receita emitida em " + dataFinal + " às " + horaFinal
  );

  return {
    ID_Receita: idReceita,
    itens: linhas.length
  };
}

/**
 * Lista de receitas por paciente
 * Action: "receitas-por-paciente"
 */
function receitaListarPorPaciente_(body) {
  const idPaciente =
    body.ID_Paciente ||
    body.idPaciente ||
    body.IdPaciente;

  if (!idPaciente) {
    throw new Error("ID_Paciente é obrigatório em receitas-por-paciente.");
  }

  const sheet = getSheet_(CONFIG.ABA_RECEITAS);
  const linhas = listAllRowsAsObjects_(sheet);

  const lista = linhas.filter(item =>
    String(item.ID_Paciente || "").trim() === String(idPaciente).trim()
  );

  // Agrupar por ID_Receita
  const agrupado = {};

  lista.forEach(row => {
    const id = row.ID_Receita;
    if (!id) return;

    if (!agrupado[id]) {
      agrupado[id] = {
        ID_Receita:   id,
        ID_Paciente:  row.ID_Paciente,
        NomePaciente: row.NomePaciente,
        Data:         row.Data,
        Hora:         row.Hora,
        TipoReceita:  row.TipoReceita,
        Observacoes:  row.Observacoes,
        UrlPdf:       row.UrlPdf,
        itens:        []
      };
    }

    agrupado[id].itens.push({
      ItemNumero:       row.ItemNumero,
      ID_Medicamento:   row.ID_Medicamento,
      NomeMedicacao:    row.NomeMedicacao,
      DescricaoCompleta: row.DescricaoCompleta
    });
  });

  // Transformar em array e ordenar por Data/Hora (mais recentes primeiro)
  const receitas = Object.values(agrupado);

  receitas.sort((a, b) => {
    const d1 = new Date(String(a.Data || "") + " " + String(a.Hora || ""));
    const d2 = new Date(String(b.Data || "") + " " + String(b.Hora || ""));
    return d2 - d1;
  });

  return { receitas };
}
