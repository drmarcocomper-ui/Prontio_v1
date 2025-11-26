/******************************************************
 * DECLARAÇÃO DE COMPARECIMENTO – BACKEND PRONTIO
 * Aba: CONFIG.ABA_COMPARECIMENTO
 *
 * Colunas esperadas:
 * ID_Comparecimento | Data | Hora | ID_Paciente | NomePaciente |
 * Texto | Observacoes | UrlPdf
 ******************************************************/

/**
 * Salvar declaração de comparecimento
 * Action: "comparecimento-salvar"
 *
 * Frontend envia:
 * dados = {
 *   ID_Comparecimento,
 *   ID_Paciente,
 *   NomePaciente,
 *   Texto,
 *   Observacoes,
 *   UrlPdf (opcional),
 *   Data, Hora (opcionais)
 * }
 */
function comparecimentoSalvar_(body) {
  // Aceita body.dados, body.comparecimento ou o próprio body
  const dados = body.dados || body.comparecimento || body;
  const sheet = getSheet_(CONFIG.ABA_COMPARECIMENTO);
  const agora = new Date();

  // Garante ID
  let id =
    dados.ID_Comparecimento ||
    dados.idComparecimento ||
    dados.id ||
    "";

  if (!id) id = gerarId_();

  // Normaliza Data/Hora
  const dataFinal =
    dados.Data ||
    dados.data ||
    formatDate_(agora); // mantém padrão do backend

  const horaFinal =
    dados.Hora ||
    dados.hora ||
    formatTime_(agora);

  const obj = {
    ID_Comparecimento: id,
    Data:              dataFinal,
    Hora:              horaFinal,
    ID_Paciente:       dados.ID_Paciente || dados.idPaciente || "",
    NomePaciente:      dados.NomePaciente || dados.nomePaciente || "",
    Texto:             dados.Texto || dados.texto || "",
    Observacoes:       dados.Observacoes || dados.observacoes || "",
    UrlPdf:            dados.UrlPdf || dados.urlPdf || ""
  };

  // UPSERT
  const result = upsertRow_(sheet, "ID_Comparecimento", id, obj, {
    Data: dataFinal,
    Hora: horaFinal
  });

  /******************************************************
   * Registrar no PRONTUÁRIO
   ******************************************************/
  registrarNoProntuario_(
    obj.ID_Paciente,
    "comparecimento",
    "Declaração de Comparecimento",
    obj.Texto || ""
  );

  // Quem envelopa com ok/action/data é o Code.gs
  return {
    ID_Comparecimento: id,
    row: result.row
  };
}

/**
 * Listar declarações de comparecimento por paciente
 * Action: "comparecimentos-por-paciente"
 */
function comparecimentoListarPorPaciente_(body) {
  const idPaciente =
    body.ID_Paciente ||
    body.idPaciente ||
    body.IdPaciente;

  if (!idPaciente) {
    throw new Error("ID_Paciente é obrigatório em comparecimentos-por-paciente.");
  }

  const sheet = getSheet_(CONFIG.ABA_COMPARECIMENTO);
  const dados = listAllRowsAsObjects_(sheet);

  // Filtra
  const filtrados = dados.filter(item =>
    String(item.ID_Paciente || "").trim() === String(idPaciente).trim()
  );

  // Ordena por Data/Hora desc — seguro para dd/MM/yyyy e yyyy-MM-dd
  filtrados.sort((a, b) => {
    const d1 = _parseComparecimentoDateTime_(a.Data, a.Hora);
    const d2 = _parseComparecimentoDateTime_(b.Data, b.Hora);

    if (!d1 && !d2) return 0;
    if (!d1) return 1;
    if (!d2) return -1;

    return d2 - d1; // mais novo primeiro
  });

  return { comparecimentos: filtrados };
}

/******************************************************
 * Helper local – converte Data e Hora para Date
 * Aceita dd/MM/yyyy ou yyyy-MM-dd
 ******************************************************/
function _parseComparecimentoDateTime_(dataStr, horaStr) {
  if (!dataStr) return null;

  let d, m, y;

  dataStr = String(dataStr).trim();
  horaStr = String(horaStr || "").trim();

  if (dataStr.includes("/")) {
    // dd/MM/yyyy
    [d, m, y] = dataStr.split("/");
  } else if (dataStr.includes("-")) {
    // yyyy-MM-dd
    [y, m, d] = dataStr.split("-");
  } else {
    return null;
  }

  d = Number(d);
  m = Number(m);
  y = Number(y);

  let hh = 0, mm = 0;
  if (horaStr.includes(":")) {
    [hh, mm] = horaStr.split(":").map(Number);
  }

  return new Date(y, m - 1, d, hh, mm);
}
