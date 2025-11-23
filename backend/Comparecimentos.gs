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
  const dados = body.dados || body.comparecimento || body;
  const sheet = getSheet_(CONFIG.ABA_COMPARECIMENTO);

  const agora = new Date();

  // Garante ID
  let id = dados.ID_Comparecimento || dados.id || "";
  if (!id) id = gerarId_();

  // Normaliza campos
  const dataFinal = dados.Data || formatDate_(agora);
  const horaFinal = dados.Hora || formatTime_(agora);

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

  // Upsert genérico
  const result = upsertRow_(sheet, "ID_Comparecimento", id, obj, {
    Data: formatDate_(agora),
    Hora: formatTime_(agora)
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

  return {
    ok: true,
    ID_Comparecimento: result.id,
    row: result.row
  };
}

/**
 * Listar declarações de comparecimento por paciente
 * Action: "comparecimentos-por-paciente"
 */
function comparecimentoListarPorPaciente_(body) {
  const idPaciente = body.ID_Paciente || body.idPaciente;

  if (!idPaciente) {
    throw new Error("ID_Paciente é obrigatório em comparecimentos-por-paciente.");
  }

  const sheet = getSheet_(CONFIG.ABA_COMPARECIMENTO);
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

  return { comparecimentos: filtrados };
}
