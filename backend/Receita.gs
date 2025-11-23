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

  const agora = new Date();
  let idReceita = dados.ID_Receita || dados.id || "";

  if (!idReceita) {
    idReceita = gerarId_();
  }

  const itens = dados.itens || [];
  if (!itens.length) {
    throw new Error("Receita sem itens. Informe pelo menos um medicamento.");
  }

  const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const colMap = {};
  header.forEach((col, i) => {
    if (col) colMap[col] = i;
  });

  const dataFinal = dados.Data || formatDate_(agora);
  const horaFinal = dados.Hora || formatTime_(agora);

  const linhas = [];

  itens.forEach((item, index) => {
    const linha = new Array(header.length).fill("");

    function set(colName, value) {
      if (colMap[colName] !== undefined) {
        linha[colMap[colName]] = value;
      }
    }

    set("ID_Receita", idReceita);
    set("ID_Paciente", dados.ID_Paciente || dados.idPaciente || "");
    set("NomePaciente", dados.NomePaciente || dados.nomePaciente || "");
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
  registrarNoProntuario_(
    dados.ID_Paciente,
    "receita",
    "Receita Médica",
    `Receita emitida em ${dataFinal} às ${horaFinal}`
  );

  return {
    ok: true,
    ID_Receita: idReceita,
    itens: linhas.length
  };
}

/**
 * Lista de receitas por paciente
 * Action: "receitas-por-paciente"
 */
function receitaListarPorPaciente_(body) {
  const idPaciente = body.ID_Paciente || body.idPaciente;

  if (!idPaciente) {
    throw new Error("ID_Paciente é obrigatório em receitas-por-paciente.");
  }

  const sheet = getSheet_(CONFIG.ABA_RECEITAS);
  const linhas = listAllRowsAsObjects_(sheet);

  const lista = linhas.filter(item =>
    String(item.ID_Paciente || "").trim() === String(idPaciente).trim()
  );

  // agrupar por ID_Receita
  const agrupado = {};

  lista.forEach(row => {
    const id = row.ID_Receita;
    if (!agrupado[id]) {
      agrupado[id] = {
        ID_Receita: id,
        ID_Paciente: row.ID_Paciente,
        NomePaciente: row.NomePaciente,
        Data: row.Data,
        Hora: row.Hora,
        TipoReceita: row.TipoReceita,
        Observacoes: row.Observacoes,
        UrlPdf: row.UrlPdf,
        itens: []
      };
    }
    agrupado[id].itens.push({
      ItemNumero: row.ItemNumero,
      ID_Medicamento: row.ID_Medicamento,
      NomeMedicacao: row.NomeMedicacao,
      DescricaoCompleta: row.DescricaoCompleta
    });
  });

  // transformar em array ordenado por Data/Hora
  const receitas = Object.values(agrupado);

  receitas.sort((a, b) => {
    const d1 = new Date(a.Data + " " + a.Hora);
    const d2 = new Date(b.Data + " " + b.Hora);
    return d2 - d1;
  });

  return { receitas };
}
