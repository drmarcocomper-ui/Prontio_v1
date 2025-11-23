/******************************************************
 * EXAMES – BACKEND PRONTIO
 * Aba: CONFIG.ABA_EXAMES
 *
 * Colunas esperadas:
 * ID_Exame | Data | Hora | ID_Paciente | NomePaciente |
 * TipoExame | Descricao | Observacoes | UrlPdf
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
  const dados = body.dados || body.exame || body;
  const sheet = getSheet_(CONFIG.ABA_EXAMES);

  const agora = new Date();

  // Garante ID
  let id = dados.ID_Exame || dados.id || "";
  if (!id) id = gerarId_();

  // Normaliza dados finais
  const obj = {
    ID_Exame:     id,
    Data:         dados.Data || formatDate_(agora),
    Hora:         dados.Hora || formatTime_(agora),
    ID_Paciente:  dados.ID_Paciente || dados.idPaciente || "",
    NomePaciente: dados.NomePaciente || dados.nomePaciente || "",
    TipoExame:    dados.TipoExame || "",
    Descricao:    dados.Descricao || "",
    Observacoes:  dados.Observacoes || "",
    UrlPdf:       dados.UrlPdf || ""
  };

  // upsert genérico
  const result = upsertRow_(sheet, "ID_Exame", id, obj, {
    Data: formatDate_(agora),
    Hora: formatTime_(agora)
  });

  /******************************************************
   * Registrar no PRONTUÁRIO
   ******************************************************/
  registrarNoProntuario_(
    obj.ID_Paciente,
    "exame",
    "Pedido de Exame",
    obj.TipoExame || obj.Descricao || ""
  );

  return {
    ok: true,
    ID_Exame: result.id,
    row: result.row
  };
}

/**
 * Listar exames de um paciente
 * Action: "exames-por-paciente"
 */
function exameListarPorPaciente_(body) {
  const idPaciente = body.ID_Paciente || body.idPaciente;

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
    const d1 = new Date(a.Data + " " + a.Hora);
    const d2 = new Date(b.Data + " " + b.Hora);
    return d2 - d1;
  });

  return { exames: filtrados };
}
