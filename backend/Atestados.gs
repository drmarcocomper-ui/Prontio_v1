/******************************************************
 * ATESTADOS – BACKEND PRONTIO
 * Aba: CONFIG.ABA_ATESTADOS
 *
 * Colunas esperadas:
 * ID_Atestado | Data | Hora | ID_Paciente | NomePaciente |
 * TextoAtestado | CID | Periodo | Observacoes | UrlPdf
 ******************************************************/

/**
 * Salvar atestado (novo ou edição)
 * Action: "atestado-salvar"
 *
 * Frontend envia:
 * dados = {
 *   ID_Atestado,
 *   ID_Paciente,
 *   NomePaciente,
 *   TextoAtestado,
 *   CID,
 *   Periodo,
 *   Observacoes,
 *   UrlPdf (opcional),
 *   Data, Hora (opcionais)
 * }
 */
function atestadoSalvar_(body) {
  const dados = body.dados || body.atestado || body;
  const sheet = getSheet_(CONFIG.ABA_ATESTADOS);

  const agora = new Date();

  // Garante ID
  let id = dados.ID_Atestado || dados.id || "";
  if (!id) id = gerarId_();

  // Se não vier Data/Hora, usar atual
  const dataFinal = dados.Data || formatDate_(agora);
  const horaFinal = dados.Hora || formatTime_(agora);

  const obj = {
    ID_Atestado:  id,
    Data:         dataFinal,
    Hora:         horaFinal,
    ID_Paciente:  dados.ID_Paciente || dados.idPaciente || "",
    NomePaciente: dados.NomePaciente || dados.nomePaciente || "",
    TextoAtestado: dados.TextoAtestado || dados.textoAtestado || "",
    CID:          dados.CID || dados.cid || "",
    Periodo:      dados.Periodo || dados.periodo || "",
    Observacoes:  dados.Observacoes || dados.observacoes || "",
    UrlPdf:       dados.UrlPdf || dados.urlPdf || ""
  };

  // Upsert genérico
  const result = upsertRow_(sheet, "ID_Atestado", id, obj, {
    Data: formatDate_(agora),
    Hora: formatTime_(agora)
  });

  /******************************************************
   * Registrar no PRONTUÁRIO
   ******************************************************/
  registrarNoProntuario_(
    obj.ID_Paciente,
    "atestado",
    "Atestado Médico",
    obj.TextoAtestado || ""
  );

  return {
    ok: true,
    ID_Atestado: result.id,
    row: result.row
  };
}

/**
 * Listar atestados de um paciente
 * Action: "atestados-por-paciente"
 */
function atestadoListarPorPaciente_(body) {
  const idPaciente = body.ID_Paciente || body.idPaciente;
  if (!idPaciente) {
    throw new Error("ID_Paciente é obrigatório em atestados-por-paciente.");
  }

  const sheet = getSheet_(CONFIG.ABA_ATESTADOS);
  const dados = listAllRowsAsObjects_(sheet);

  const filtrados = dados.filter(item =>
    String(item.ID_Paciente || "").trim() === String(idPaciente).trim()
  );

  // Ordenar por Data/Hora (mais novos primeiro)
  filtrados.sort((a, b) => {
    const d1 = new Date(a.Data + " " + a.Hora);
    const d2 = new Date(b.Data + " " + b.Hora);
    return d2 - d1;
  });

  return { atestados: filtrados };
}
