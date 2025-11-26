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
  // Compatível com: body.dados, body.laudo, body
  const dados = body.dados || body.laudo || body;
  const sheet = getSheet_(CONFIG.ABA_LAUDOS);
  const agora = new Date();

  // Garante ID
  let id =
    dados.ID_Laudo ||
    dados.idLaudo ||
    dados.id ||
    "";

  if (!id) id = gerarId_();

  // Normaliza data/hora (mantém os valores enviados se vierem)
  const dataFinal =
    dados.Data ||
    dados.data ||
    formatDate_(agora); // formato ISO ou dd/MM/yyyy dependendo do seu padrão interno

  const horaFinal =
    dados.Hora ||
    dados.hora ||
    formatTime_(agora);

  const obj = {
    ID_Laudo:     id,
    Data:         dataFinal,
    Hora:         horaFinal,
    ID_Paciente:  dados.ID_Paciente || dados.idPaciente || "",
    NomePaciente: dados.NomePaciente || dados.nomePaciente || "",
    TipoLaudo:    dados.TipoLaudo || dados.tipoLaudo || "",
    Conteudo:     dados.Conteudo || dados.conteudo || "",
    Observacoes:  dados.Observacoes || dados.observacoes || "",
    UrlPdf:       dados.UrlPdf || dados.urlPdf || ""
  };

  // Upsert genérico
  const result = upsertRow_(sheet, "ID_Laudo", id, obj, {
    Data: dataFinal,
    Hora: horaFinal
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

  // Code.gs é quem faz o envelopamento final
  return {
    ID_Laudo: id,
    row: result.row
  };
}

/**
 * Listar laudos de um paciente
 * Action: "laudos-por-paciente"
 */
function laudoListarPorPaciente_(body) {
  const idPaciente =
    body.ID_Paciente ||
    body.idPaciente ||
    body.IdPaciente;

  if (!idPaciente) {
    throw new Error("ID_Paciente é obrigatório em laudos-por-paciente.");
  }

  const sheet = getSheet_(CONFIG.ABA_LAUDOS);
  const dados = listAllRowsAsObjects_(sheet);

  // Filtrar pelo paciente
  const filtrados = dados.filter(item =>
    String(item.ID_Paciente || "").trim() === String(idPaciente).trim()
  );

  // Ordenar por data/hora (mais novos primeiro)
  filtrados.sort((a, b) => {
    const d1 = _parseLaudoDateTime_(a.Data, a.Hora);
    const d2 = _parseLaudoDateTime_(b.Data, b.Hora);

    if (!d1 && !d2) return 0;
    if (!d1) return 1;
    if (!d2) return -1;

    return d2 - d1;
  });

  return { laudos: filtrados };
}

/******************************************************
 * Helper local – converte Data/Hora em Date
 * Aceita:
 *  - "dd/MM/yyyy"
 *  - "yyyy-MM-dd"
 ******************************************************/
function _parseLaudoDateTime_(dataStr, horaStr) {
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
  if (horaStr && horaStr.includes(":")) {
    const h = horaStr.split(":");
    hh = Number(h[0] || 0);
    mm = Number(h[1] || 0);
  }

  return new Date(y, m - 1, d, hh, mm);
}
