/******************************************************
 * ATESTADOS – BACKEND PRONTIO
 * Aba: CONFIG.ABA_ATESTADOS
 *
 * Colunas esperadas:
 * ID_Atestado | Data | Hora | ID_Paciente | NomePaciente |
 * TextoAtestado | CID | Periodo | Observacoes | UrlPdf
 *
 * Integração com o front:
 *  Action "atestado-salvar"          → atestadoSalvar_(body)
 *  Action "atestado-listar-paciente" → atestadoListarPorPaciente_(body)
 *  Action "atestados-por-paciente"   → atestadoListarPorPaciente_(body)
 ******************************************************/

/**
 * Salvar atestado (novo ou edição)
 * Action: "atestado-salvar"
 *
 * Frontend envia (via PRONTIO.API.Atestados.salvar):
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
  // Flexível: aceita body.dados, body.atestado ou o próprio body
  const dados = body.dados || body.atestado || body;
  const sheet = getSheet_(CONFIG.ABA_ATESTADOS);

  const agora = new Date();

  // Garante ID
  let id =
    dados.ID_Atestado ||
    dados.idAtestado ||
    dados.id ||
    "";

  if (!id) id = gerarId_();

  // Se não vier Data/Hora, usar atual
  const dataFinal =
    dados.Data ||
    dados.data ||
    formatDate_(agora); // usa o helper global já existente

  const horaFinal =
    dados.Hora ||
    dados.hora ||
    formatTime_(agora); // assumindo que você já tem formatTime_ definido em outro arquivo

  const obj = {
    ID_Atestado:   id,
    Data:          dataFinal,
    Hora:          horaFinal,
    ID_Paciente:   dados.ID_Paciente || dados.idPaciente || "",
    NomePaciente:  dados.NomePaciente || dados.nomePaciente || "",
    TextoAtestado: dados.TextoAtestado || dados.textoAtestado || "",
    CID:           dados.CID || dados.cid || "",
    Periodo:       dados.Periodo || dados.periodo || "",
    Observacoes:   dados.Observacoes || dados.observacoes || "",
    UrlPdf:        dados.UrlPdf || dados.urlPdf || ""
  };

  // Upsert genérico:
  // - Se já existir ID_Atestado, atualiza a linha
  // - Senão, insere uma nova
  const result = upsertRow_(
    sheet,
    "ID_Atestado",
    id,
    obj,
    {
      // Para registros novos, garante que Data/Hora não fiquem vazias
      Data: dataFinal,
      Hora: horaFinal
    }
  );

  /******************************************************
   * Registrar no PRONTUÁRIO
   ******************************************************/
  registrarNoProntuario_(
    obj.ID_Paciente,
    "atestado",
    "Atestado Médico",
    obj.TextoAtestado || ""
  );

  // Padrão: o Code.gs faz o envelopamento { ok, action, data }
  return {
    ID_Atestado: id,
    row: result.row
  };
}

/**
 * Listar atestados de um paciente
 * Actions:
 *  - "atestado-listar-paciente"
 *  - "atestados-por-paciente"
 */
function atestadoListarPorPaciente_(body) {
  const idPaciente =
    body.ID_Paciente ||
    body.idPaciente ||
    body.IdPaciente;

  if (!idPaciente) {
    throw new Error("ID_Paciente é obrigatório em atestados-por-paciente.");
  }

  const sheet = getSheet_(CONFIG.ABA_ATESTADOS);
  const dados = listAllRowsAsObjects_(sheet);

  // Filtra somente os atestados deste paciente
  const filtrados = dados.filter(item =>
    String(item.ID_Paciente || "").trim() === String(idPaciente).trim()
  );

  // Ordenar por Data/Hora (mais novos primeiro)
  filtrados.sort((a, b) => {
    const d1 = _parseAtestadoDateTime_(a.Data, a.Hora);
    const d2 = _parseAtestadoDateTime_(b.Data, b.Hora);

    if (!d1 && !d2) return 0;
    if (!d1) return 1;
    if (!d2) return -1;

    return d2 - d1; // mais recente primeiro
  });

  return { atestados: filtrados };
}

/******************************************************
 * Helper local – converte Data/Hora em Date
 * Aceita:
 *  - "dd/MM/yyyy" (padrão brasileiro)
 *  - "yyyy-MM-dd" (caso mude no futuro)
 ******************************************************/
function _parseAtestadoDateTime_(dataStr, horaStr) {
  if (!dataStr) return null;

  let dia, mes, ano;

  dataStr = String(dataStr).trim();
  horaStr = String(horaStr || "").trim();

  if (dataStr.includes("/")) {
    // formato dd/MM/yyyy
    const partes = dataStr.split("/");
    if (partes.length !== 3) return null;
    dia = Number(partes[0]);
    mes = Number(partes[1]);
    ano = Number(partes[2]);
  } else if (dataStr.includes("-")) {
    // formato yyyy-MM-dd
    const partes = dataStr.split("-");
    if (partes.length !== 3) return null;
    ano = Number(partes[0]);
    mes = Number(partes[1]);
    dia = Number(partes[2]);
  } else {
    return null;
  }

  let hh = 0;
  let mm = 0;
  if (horaStr) {
    const partesHora = horaStr.split(":");
    hh = Number(partesHora[0] || 0);
    mm = Number(partesHora[1] || 0);
  }

  return new Date(ano, mes - 1, dia, hh, mm);
}
