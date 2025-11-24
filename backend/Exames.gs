/******************************************************
 * EXAMES – BACKEND PRONTIO
 * Aba: CONFIG.ABA_EXAMES
 *
 * Colunas esperadas:
 * ID_Exame | Data | Hora | ID_Paciente | NomePaciente |
 * TipoExame | Descricao | Observacoes | UrlPdf
 *
 * Integração com o front:
 *  - Action "exame-salvar"           → exameSalvar_(body)
 *  - Action "exame-listar-paciente"  → exameListarPorPaciente_(body)
 *  - Action "exames-por-paciente"    → exameListarPorPaciente_(body)
 ******************************************************/

/**
 * Salvar pedido de exame (novo ou edição)
 * Action: "exame-salvar"
 *
 * Frontend envia:
 * dados = {
 *   ID_Exame,
 *   ID_Paciente,
 *   NomePaciente,
 *   TipoExame,
 *   Descricao,
 *   Observacoes,
 *   UrlPdf (opcional),
 *   Data (opcional),
 *   Hora (opcional)
 * }
 */
function exameSalvar_(body) {
  // Flexível: aceita body.dados, body.exame ou o próprio body
  const dados = body.dados || body.exame || body;
  const sheet = getSheet_(CONFIG.ABA_EXAMES);
  const agora = new Date();

  // Garante ID
  let id =
    dados.ID_Exame ||
    dados.idExame ||
    dados.id ||
    "";

  if (!id) id = gerarId_();

  // Normaliza Data/Hora (mantém o valor enviado se vier)
  const dataFinal =
    dados.Data ||
    dados.data ||
    formatDate_(agora);

  const horaFinal =
    dados.Hora ||
    dados.hora ||
    formatTime_(agora);

  const obj = {
    ID_Exame:     id,
    Data:         dataFinal,
    Hora:         horaFinal,
    ID_Paciente:  dados.ID_Paciente || dados.idPaciente || "",
    NomePaciente: dados.NomePaciente || dados.nomePaciente || "",
    TipoExame:    dados.TipoExame || dados.tipoExame || "",
    Descricao:    dados.Descricao || dados.descricao || "",
    Observacoes:  dados.Observacoes || dados.observacoes || "",
    UrlPdf:       dados.UrlPdf || dados.urlPdf || ""
  };

  // upsert genérico:
  // - se já existir linha com esse ID_Exame, atualiza;
  // - senão, insere nova linha.
  const result = upsertRow_(
    sheet,
    "ID_Exame",
    id,
    obj,
    {
      Data: dataFinal,
      Hora: horaFinal
    }
  );

  /******************************************************
   * Registrar no PRONTUÁRIO
   ******************************************************/
  registrarNoProntuario_(
    obj.ID_Paciente,
    "exame",
    "Pedido de Exame",
    obj.TipoExame || obj.Descricao || ""
  );

  // Code.gs envelopa como { ok: true, action, data }
  return {
    ID_Exame: id,
    row: result.row
  };
}

/**
 * Listar exames de um paciente
 * Actions:
 *  - "exame-listar-paciente"
 *  - "exames-por-paciente"
 */
function exameListarPorPaciente_(body) {
  const idPaciente =
    body.ID_Paciente ||
    body.idPaciente ||
    body.IdPaciente;

  if (!idPaciente) {
    throw new Error("ID_Paciente é obrigatório em exames-por-paciente.");
  }

  const sheet = getSheet_(CONFIG.ABA_EXAMES);
  const dados = listAllRowsAsObjects_(sheet);

  const filtrados = dados.filter(item =>
    String(item.ID_Paciente || "").trim() === String(idPaciente).trim()
  );

  // ordenar por data e hora (mais novo primeiro)
  filtrados.sort((a, b) => {
    const d1 = _parseExameDateTime_(a.Data, a.Hora);
    const d2 = _parseExameDateTime_(b.Data, b.Hora);

    if (!d1 && !d2) return 0;
    if (!d1) return 1;
    if (!d2) return -1;

    return d2 - d1;
  });

  return { exames: filtrados };
}

/******************************************************
 * Helper local – converte Data/Hora em Date
 * Aceita:
 *  - "dd/MM/yyyy"
 *  - "yyyy-MM-dd"
 ******************************************************/
function _parseExameDateTime_(dataStr, horaStr) {
  if (!dataStr) return null;

  let d, m, y;

  dataStr = String(dataStr).trim();
  horaStr = String(horaStr || "").trim();

  if (dataStr.includes("/")) {
    // dd/MM/yyyy
    const partes = dataStr.split("/");
    if (partes.length !== 3) return null;
    d = Number(partes[0]);
    m = Number(partes[1]);
    y = Number(partes[2]);
  } else if (dataStr.includes("-")) {
    // yyyy-MM-dd
    const partes = dataStr.split("-");
    if (partes.length !== 3) return null;
    y = Number(partes[0]);
    m = Number(partes[1]);
    d = Number(partes[2]);
  } else {
    return null;
  }

  let hh = 0, mm = 0;
  if (horaStr) {
    const partesHora = horaStr.split(":");
    hh = Number(partesHora[0] || 0);
    mm = Number(partesHora[1] || 0);
  }

  return new Date(y, m - 1, d, hh, mm);
}
