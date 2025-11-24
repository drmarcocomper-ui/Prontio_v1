/******************************************************
 * SADT – Solicitação / Guia SADT
 * Aba: CONFIG.ABA_SADT
 *
 * Colunas esperadas:
 * ID_Sadt | Data | Hora | ID_Paciente | NomePaciente |
 * Procedimento | CID | Justificativa | Observacoes | UrlPdf
 ******************************************************/

/**
 * Salvar SADT (novo ou edição)
 * Action: "sadt-salvar"
 *
 * Frontend envia:
 * dados = {
 *   ID_Sadt,
 *   ID_Paciente,
 *   NomePaciente,
 *   Procedimento,
 *   CID,
 *   Justificativa,
 *   Observacoes,
 *   UrlPdf (opcional),
 *   Data, Hora (opcionais)
 * }
 */
function sadtSalvar_(body) {
  // Flexível: aceita body.dados, body.sadt ou o próprio body
  const dados = body.dados || body.sadt || body;
  const sheet = getSheet_(CONFIG.ABA_SADT);

  const agora = new Date();

  // Garante ID
  let id =
    dados.ID_Sadt ||
    dados.IdSadt ||
    dados.idSadt ||
    dados.id ||
    "";

  if (!id) id = gerarId_();

  // Normaliza Data/Hora (mantém valor enviado se vier)
  const dataFinal =
    dados.Data ||
    dados.data ||
    formatDate_(agora);

  const horaFinal =
    dados.Hora ||
    dados.hora ||
    formatTime_(agora);

  const obj = {
    ID_Sadt:       id,
    Data:          dataFinal,
    Hora:          horaFinal,
    ID_Paciente:   dados.ID_Paciente || dados.idPaciente || "",
    NomePaciente:  dados.NomePaciente || dados.nomePaciente || "",
    Procedimento:  dados.Procedimento || dados.procedimento || "",
    CID:           dados.CID || dados.cid || "",
    Justificativa: dados.Justificativa || dados.justificativa || "",
    Observacoes:   dados.Observacoes || dados.observacoes || "",
    UrlPdf:        dados.UrlPdf || dados.urlPdf || ""
  };

  // Upsert genérico
  const result = upsertRow_(
    sheet,
    "ID_Sadt",
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
    "sadt",
    "Solicitação SADT",
    obj.Procedimento || obj.Justificativa || ""
  );

  // Code.gs fará { ok: true, data: ... }
  return {
    ID_Sadt: id,
    row: result.row
  };
}

/**
 * Listar SADT por paciente
 * Action: "sadt-listar-paciente"
 */
function sadtListarPorPaciente_(body) {
  const idPaciente =
    body.ID_Paciente ||
    body.idPaciente ||
    body.IdPaciente;

  if (!idPaciente) {
    throw new Error("ID_Paciente é obrigatório em sadt-listar-paciente.");
  }

  const sheet = getSheet_(CONFIG.ABA_SADT);
  const dados = listAllRowsAsObjects_(sheet);

  // Filtrar apenas registros do paciente
  const filtrados = dados.filter(r =>
    String(r.ID_Paciente || "").trim() === String(idPaciente).trim()
  );

  // Ordenação segura
  filtrados.sort((a, b) => {
    const d1 = _parseSadtDateTime_(a.Data, a.Hora);
    const d2 = _parseSadtDateTime_(b.Data, b.Hora);

    if (!d1 && !d2) return 0;
    if (!d1) return 1;
    if (!d2) return -1;

    return d2 - d1; // mais recente primeiro
  });

  return { sadt: filtrados };
}

/******************************************************
 * Helper local – converte Data/Hora em Date
 * Aceita:
 *  - "dd/MM/yyyy"
 *  - "yyyy-MM-dd"
 ******************************************************/
function _parseSadtDateTime_(dataStr, horaStr) {
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

  // Hora
  let hh = 0, mm = 0;
  if (horaStr.includes(":")) {
    const h = horaStr.split(":");
    hh = Number(h[0] || 0);
    mm = Number(h[1] || 0);
  }

  return new Date(y, m - 1, d, hh, mm);
}
