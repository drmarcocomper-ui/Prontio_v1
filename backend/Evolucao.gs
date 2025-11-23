/******************************************************
 * EVOLUÇÃO / CONSULTAS – BACKEND PRONTIO
 * Aba: CONFIG.ABA_EVOLUCAO ("Consultas")
 *
 * Colunas esperadas:
 * ID_Evolucao | Data | Hora | ID_Paciente | NomePaciente |
 * Tipo | Evolucao | CriadoEm
 ******************************************************/

/**
 * Salvar evolução (novo ou editar)
 * O frontend envia:
 * {
 *   action: "evolucao-salvar",
 *   dados: {
 *      ID_Evolucao,
 *      ID_Paciente,
 *      NomePaciente,
 *      Tipo,
 *      Evolucao,
 *      Data (opcional),
 *      Hora (opcional)
 *   }
 * }
 */
function evolucaoSalvar_(body) {
  // Pode vir como body.dados, body.evolucao ou o próprio body
  const dados = body.dados || body.evolucao || body;
  const sheet = getSheet_(CONFIG.ABA_EVOLUCAO);

  const agora = new Date();

  // ID existente ou novo
  let id = dados.ID_Evolucao || dados.id || "";
  if (!id) id = gerarId_();

  // Se não vierem Data/Hora, usamos a data/hora atuais
  const dataFinal = dados.Data || formatDate_(agora);
  const horaFinal = dados.Hora || formatTime_(agora);

  // Objeto completo conforme colunas da planilha
  const obj = {
    ID_Evolucao:  id,
    Data:         dataFinal,
    Hora:         horaFinal,
    ID_Paciente:  dados.ID_Paciente || dados.idPaciente || "",
    NomePaciente: dados.NomePaciente || dados.nomePaciente || "",
    Tipo:         dados.Tipo || dados.tipo || "",
    Evolucao:     dados.Evolucao || dados.evolucao || "",
    CriadoEm:     dados.CriadoEm || Utilities.formatDate(
      agora, "America/Sao_Paulo", "dd/MM/yyyy HH:mm:ss"
    )
  };

  // Upsert na aba Consultas
  const result = upsertRow_(sheet, "ID_Evolucao", id, obj, {
    Data:     formatDate_(agora),
    Hora:     formatTime_(agora),
    CriadoEm: Utilities.formatDate(agora, "America/Sao_Paulo", "dd/MM/yyyy HH:mm:ss")
  });

  // REGISTRA NO PRONTUÁRIO
  registrarNoProntuario_(
    obj.ID_Paciente,
    "evolucao",
    obj.Tipo || "Evolução Clínica",
    obj.Evolucao || ""
  );

  return {
    ok: true,
    ID_Evolucao: result.id,
    row: result.row
  };
}

/**
 * Listar evoluções de um paciente
 * Action:
 *  - "evolucao-listar-paciente"
 *  - "evolucao-por-paciente"
 */
function evolucaoListarPorPaciente_(body) {
  const idPaciente = body.ID_Paciente || body.idPaciente;

  if (!idPaciente) {
    throw new Error("ID_Paciente é obrigatório em evolucao-listar-paciente.");
  }

  const sheet = getSheet_(CONFIG.ABA_EVOLUCAO);
  const dados = listAllRowsAsObjects_(sheet);

  // Filtrar evoluções do paciente
  const filtrados = dados.filter(item =>
    String(item.ID_Paciente || "") === String(idPaciente)
  );

  // Ordenar por data/hora (mais recentes primeiro)
  filtrados.sort((a, b) => {
    const d1 = new Date(a.Data + " " + a.Hora);
    const d2 = new Date(b.Data + " " + b.Hora);
    return d2 - d1;
  });

  return { evolucao: filtrados };
}
