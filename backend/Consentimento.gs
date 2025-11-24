/******************************************************
 * CONSENTIMENTO INFORMADO – BACKEND PRONTIO
 * Aba: CONFIG.ABA_CONSENTIMENTO
 *
 * Colunas esperadas:
 * ID_Consentimento | Data | Hora | ID_Paciente | NomePaciente |
 * Procedimento | Texto | Observacoes | UrlPdf
 ******************************************************/

/**
 * Salvar Consentimento
 * Action: "consentimento-salvar"
 *
 * Frontend envia:
 * dados = {
 *   ID_Consentimento,
 *   ID_Paciente,
 *   NomePaciente,
 *   Procedimento,
 *   Texto,
 *   Observacoes,
 *   UrlPdf (opcional),
 *   Data, Hora (opcionais)
 * }
 */
function consentimentoSalvar_(body) {
  // Aceita body.dados, body.consentimento ou o próprio body
  const dados = body.dados || body.consentimento || body;
  const sheet = getSheet_(CONFIG.ABA_CONSENTIMENTO);

  const agora = new Date();

  // Garante ID
  let id =
    dados.ID_Consentimento ||
    dados.idConsentimento ||
    dados.id ||
    "";

  if (!id) id = gerarId_();

  // Normaliza Data e Hora (mantendo o que vier do front, se vier)
  const dataFinal =
    dados.Data ||
    dados.data ||
    formatDate_(agora);

  const horaFinal =
    dados.Hora ||
    dados.hora ||
    formatTime_(agora);

  const obj = {
    ID_Consentimento: id,
    Data:             dataFinal,
    Hora:             horaFinal,
    ID_Paciente:      dados.ID_Paciente || dados.idPaciente || "",
    NomePaciente:     dados.NomePaciente || dados.nomePaciente || "",
    Procedimento:     dados.Procedimento || dados.procedimento || "",
    Texto:            dados.Texto || dados.texto || "",
    Observacoes:      dados.Observacoes || dados.observacoes || "",
    UrlPdf:           dados.UrlPdf || dados.urlPdf || ""
  };

  // Upsert genérico
  const result = upsertRow_(
    sheet,
    "ID_Consentimento",
    id,
    obj,
    { Data: dataFinal, Hora: horaFinal }
  );

  /******************************************************
   * Registrar no PRONTUÁRIO
   ******************************************************/
  registrarNoProntuario_(
    obj.ID_Paciente,
    "consentimento",
    "Termo de Consentimento",
    obj.Procedimento || obj.Texto || ""
  );

  // Code.gs fará o envelopamento { ok, action, data }
  return {
    ID_Consentimento: id,
    row: result.row
  };
}

/**
 * Listar consentimentos de um paciente
 * Actions:
 *  - "consentimento-listar-paciente"
 *  - "consentimentos-por-paciente"
 */
function consentimentoListarPorPaciente_(body) {
  const idPaciente =
    body.ID_Paciente ||
    body.idPaciente ||
    body.IdPaciente;

  if (!idPaciente) {
    throw new Error("ID_Paciente é obrigatório em consentimentos-por-paciente.");
  }

  const sheet = getSheet_(CONFIG.ABA_CONSENTIMENTO);
  const dados = listAllRowsAsObjects_(sheet);

  const filtrados = dados.filter(r =>
    String(r.ID_Paciente || "").trim() === String(idPaciente).trim()
  );

  // Ordenação por Data + Hora (mais novos primeiro)
  filtrados.sort((a, b) => {
    const d1 = _parseConsentimentoDateTime_(a.Data, a.Hora);
    const d2 = _parseConsentimentoDateTime_(b.Data, b.Hora);

    if (!d1 && !d2) return 0;
    if (!d1) return 1;
    if (!d2) return -1;

    return d2 - d1;
  });

  return { consentimentos: filtrados };
}

/******************************************************
 * Helper local – converte Data/Hora em Date
 * Aceita:
 *  - "dd/MM/yyyy"
 *  - "yyyy-MM-dd"
 ******************************************************/
function _parseConsentimentoDateTime_(dataStr, horaStr) {
  if (!dataStr) return null;

  let d, m, y;

  dataStr = String(dataStr).trim();
  horaStr = String(horaStr || "").trim();

  if (dataStr.includes("/")) {
    // dd/MM/yyyy
    const p = dataStr.split("/");
    if (p.length !== 3) return null;
    d = Number(p[0]);
    m = Number(p[1]);
    y = Number(p[2]);
  } else if (dataStr.includes("-")) {
    // yyyy-MM-dd
    const p = dataStr.split("-");
    if (p.length !== 3) return null;
    y = Number(p[0]);
    m = Number(p[1]);
    d = Number(p[2]);
  } else {
    return null;
  }

  let hh = 0, mm = 0;
  if (horaStr && horaStr.includes(":")) {
    const h = horaStr.split(":");
    hh = Number(h[0] || 0);
    mm = Number(h[1] || 0);
  }

  return new Date(y, m - 1, d, hh, mm);
}
