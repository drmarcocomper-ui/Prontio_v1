/******************************************************
 * LAUDOS – BACKEND PRONTIO
 * Aba: CONFIG.ABA_LAUDOS
 *
 * Colunas esperadas:
 * ID_Laudo | Data | Hora | ID_Paciente | NomePaciente |
 * TipoLaudo | Conteudo | Observacoes | UrlPdf
 ******************************************************/

/**
 * Salvar laudo (novo ou edição)
 * Action: "laudo-salvar"
 *
 * Frontend envia:
 * dados = {
 *   ID_Laudo,
 *   ID_Paciente,
 *   NomePaciente,
 *   TipoLaudo,
 *   Conteudo,
 *   Observacoes,
 *   UrlPdf (opcional),
 *   Data, Hora (opcionais)
 * }
 */
function laudoSalvar_(body) {
  const dados = body.dados || body.laudo || body;
  const sheet = getSheet_(CONFIG.ABA_LAUDOS);

  const agora = new Date();

  // Garante ID
  let id = dados.ID_Laudo || dados.id || "";
  if (!id) id = gerarId_();

  // Normaliza Data e Hora
  const dataFinal = dados.Data || formatDate_(agora);
  const horaFinal = dados.Hora || formatTime_(agora);

  const obj = {
    ID_Laudo:     id,
    Data:         dataFinal,
    Hora:         horaFinal,
    ID_Paciente:  dados.ID_Paciente || dados.idPaciente || "",
    NomePaciente: dados.NomePaciente || dados.nomePaciente || "",
    TipoLaudo:    dados.TipoLaudo || "",
    Conteudo:     dados.Conteudo || "",
    Observacoes:  dados.Observacoes || "",
    UrlPdf:       dados.UrlPdf || ""
  };

  // Upsert genérico
  const result = upsertRow_(sheet, "ID_Laudo", id, obj, {
    Data: formatDate_(agora),
    Hora: formatTime_(agora)
  });

  /******************************************************
   * Registrar no PRONTUÁRIO
   ******************************************************/
  registrarNoProntuario_(
    obj.ID_Paciente,
    "laudo",
    obj.TipoLaudo || "Laudo Médico",
    obj.Conteudo || ""
  );

  return {
    ok: true,
    ID_Laudo: result.id,
    row: result.row
  };
}

/**
 * Listar laudos de um paciente
 * Action: "laudos-por-paciente"
 */
function laudoListarPorPaciente_(body) {
  const idPaciente = body.ID_Paciente || body.idPaciente;

  if (!idPaciente) {
    throw new Error("ID_Paciente é obrigatório em laudos-por-paciente.");
  }

  const sheet = getSheet_(CONFIG.ABA_LAUDOS);
  const dados = listAllRowsAsObjects_(sheet);

  const filtrados = dados.filter(item =>
    String(item.ID_Paciente || "").trim() === String(idPaciente).trim()
  );

  // Ordenar por Data/Hora
  filtrados.sort((a, b) => {
    const d1 = new Date(a.Data + " " + a.Hora);
    const d2 = new Date(b.Data + " " + b.Hora);
    return d2 - d1;
  });

  return { laudos: filtrados };
}
