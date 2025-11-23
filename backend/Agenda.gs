/******************************************************
 * AGENDA – BACKEND PRONTIO
 * Aba: CONFIG.ABA_AGENDA
 *
 * Colunas esperadas:
 * ID_Agenda | ID_Paciente | NomePaciente | Data |
 * HoraInicio | HoraFim | Tipo | Status | Observacoes
 ******************************************************/

/**
 * Salvar agendamento (novo ou edição)
 * Recebe dados em body.dados ou body.agenda
 */
function agendaSalvar_(body) {
  const dados = body.dados || body.agenda || body;
  const sheet = getSheet_(CONFIG.ABA_AGENDA);

  // Garante ID
  let id = dados.ID_Agenda || dados.idAgenda || dados.id || "";
  if (!id) id = gerarId_();

  // Normalizar horários
  const horaInicio =
    dados.HoraInicio || dados.horaInicio || dados.Hora_Inicio || "";
  const horaFim =
    dados.HoraFim || dados.horaFim || dados.Hora_Fim || "";

  // Extrai cabeçalho
  const lastCol = sheet.getLastColumn();
  const header = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  // Determina linha a atualizar (se existir)
  const idCol = header.indexOf("ID_Agenda") + 1;
  let rowIndex = 0;

  if (idCol > 0) {
    const ids = sheet.getRange(2, idCol, Math.max(sheet.getLastRow() - 1, 0)).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(id)) {
        rowIndex = i + 2;
        break;
      }
    }
  }

  if (!rowIndex) {
    rowIndex = sheet.getLastRow() + 1;
  }

  const rowValues = new Array(lastCol).fill("");

  // Constrói a linha conforme o header da aba
  header.forEach((nomeCol, c) => {
    switch (nomeCol) {
      case "ID_Agenda":
        rowValues[c] = id;
        break;

      case "ID_Paciente":
        rowValues[c] = dados.ID_Paciente || dados.idPaciente || "";
        break;

      case "NomePaciente":
        rowValues[c] = dados.NomePaciente || dados.nomePaciente || "";
        break;

      case "Data":
        rowValues[c] = dados.Data || dados.data || "";
        break;

      case "HoraInicio":
        rowValues[c] = horaInicio;
        break;

      case "HoraFim":
        rowValues[c] = horaFim;
        break;

      case "Tipo":
        rowValues[c] = dados.Tipo || dados.tipo || "";
        break;

      case "Status":
        rowValues[c] = dados.Status || dados.status || "Agendado";
        break;

      case "Observacoes":
        rowValues[c] = dados.Observacoes || dados.observacoes || "";
        break;

      default:
        rowValues[c] = "";
    }
  });

  sheet.getRange(rowIndex, 1, 1, lastCol).setValues([rowValues]);

  return {
    ID_Agenda: id,
    row: rowIndex
  };
}

/******************************************************
 * LISTAR AGENDA (filtros gerais)
 * Action: "agenda-listar"
 ******************************************************/
function agendaListar_(body) {
  const filtros = body.filtros || {};
  const sheet = getSheet_(CONFIG.ABA_AGENDA);
  let dados = listAllRowsAsObjects_(sheet);

  // filtros
  const data = filtros.data || filtros.Data || "";
  const status = filtros.status || filtros.Status || "";
  const busca = String(filtros.busca || "").toLowerCase().trim();

  // filtro por data
  if (data) {
    dados = dados.filter(i =>
      String(i.Data || "") === String(data)
    );
  }

  // filtro por status
  if (status && status !== "Todos" && status !== "TODOS") {
    dados = dados.filter(i =>
      String(i.Status || "") === String(status)
    );
  }

  // filtro de busca (nome, tipo, observações, telefone)
  if (busca) {
    dados = dados.filter(i => {
      const nome = String(i.NomePaciente || "").toLowerCase();
      const tipo = String(i.Tipo || "").toLowerCase();
      const obs = String(i.Observacoes || "").toLowerCase();
      const tel = String(i.Telefone || i.Telefone1 || "").toLowerCase();
      return (
        nome.includes(busca) ||
        tipo.includes(busca) ||
        obs.includes(busca) ||
        tel.includes(busca)
      );
    });
  }

  return dados;
}

/******************************************************
 * LISTAR AGENDA POR DATA
 ******************************************************/
function agendaListarPorData_(body) {
  const data = body.Data || body.data;
  if (!data) throw new Error("Campo Data é obrigatório.");

  const sheet = getSheet_(CONFIG.ABA_AGENDA);
  const dados = listAllRowsAsObjects_(sheet);

  return dados.filter(i => String(i.Data || "") === String(data));
}

/******************************************************
 * LISTAR AGENDA POR PACIENTE
 ******************************************************/
function agendaListarPorPaciente_(body) {
  const id = body.ID_Paciente || body.idPaciente;
  if (!id) throw new Error("ID_Paciente é obrigatório.");

  const sheet = getSheet_(CONFIG.ABA_AGENDA);
  const dados = listAllRowsAsObjects_(sheet);

  return dados.filter(i => String(i.ID_Paciente || "") === String(id));
}

/******************************************************
 * ATUALIZAR STATUS DO AGENDAMENTO
 ******************************************************/
function agendaAtualizarStatus_(body) {
  const idAgenda = body.ID_Agenda || body.idAgenda;
  const novoStatus = body.Status || body.status;

  if (!idAgenda) throw new Error("ID_Agenda é obrigatório.");
  if (!novoStatus) throw new Error("Status é obrigatório.");

  const sheet = getSheet_(CONFIG.ABA_AGENDA);
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  if (lastRow < 2) throw new Error("Nenhum agendamento cadastrado.");

  const header = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const colMap = {};
  header.forEach((h, i) => {
    if (h) colMap[h] = i + 1;
  });

  const idCol = colMap["ID_Agenda"];
  const statusCol = colMap["Status"];
  if (!idCol || !statusCol) {
    throw new Error("Colunas ID_Agenda/Status não encontradas.");
  }

  const ids = sheet.getRange(2, idCol, lastRow - 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(idAgenda)) {
      sheet.getRange(i + 2, statusCol).setValue(novoStatus);
      return { ID_Agenda: idAgenda, Status: novoStatus };
    }
  }

  throw new Error("Agendamento não encontrado.");
}
