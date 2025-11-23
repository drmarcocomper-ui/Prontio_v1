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
  const dados = body.dados || body.sadt || body;
  const sheet = getSheet_(CONFIG.ABA_SADT);

  const agora = new Date();

  // Garante ID
  let id = dados.ID_Sadt || dados.id || "";
  if (!id) id = gerarId_();

  const dataFinal = dados.Data || formatDate_(agora);
  const horaFinal = dados.Hora || formatTime_(agora);

  const obj = {
    ID_Sadt:       id,
    Data:          dataFinal,
    Hora:          horaFinal,
    ID_Paciente:   dados.ID_Paciente || dados.idPaciente || "",
    NomePaciente:  dados.NomePaciente || dados.nomePaciente || "",
    Procedimento:  dados.Procedimento || "",
    CID:           dados.CID || "",
    Justificativa: dados.Justificativa || "",
    Observacoes:   dados.Observacoes || "",
    UrlPdf:        dados.UrlPdf || dados.urlPdf || ""
  };

  // Upsert genérico
  const result = upsertRow_(sheet, "ID_Sadt", id, obj, {
    Data: formatDate_(agora),
    Hora: formatTime_(agora)
  });

  /******************************************************
   * Registrar no PRONTUÁRIO
   ******************************************************/
  registrarNoProntuario_(
    obj.ID_Paciente,
    "encaminhamento",              // tipo usado na timeline
    "Solicitação SADT",
    obj.Procedimento || obj.Justificativa || ""
  );

  return {
    ok: true,
    ID_Sadt: result.id,
    row: result.row
  };
}

/**
 * Listar SADT por paciente
 * Action: "sadt-listar-paciente"
 */
function sadtListarPorPaciente_(body) {
  const idPaciente = body.ID_Paciente || body.idPaciente;

  if (!idPaciente) {
    throw new Error("ID_Paciente é obrigatório em sadt-listar-paciente.");
  }

  const sheet = getSheet_(CONFIG.ABA_SADT);
  const dados = listAllRowsAsObjects_(sheet);

  const filtrados = dados.filter(r =>
    String(r.ID_Paciente || "").trim() === String(idPaciente).trim()
  );

  // Ordenar por Data/Hora
  filtrados.sort((a, b) => {
    const d1 = new Date(a.Data + " " + a.Hora);
    const d2 = new Date(b.Data + " " + b.Hora);
    return d2 - d1;
  });

  return { sadt: filtrados };
}
