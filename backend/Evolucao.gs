/******************************************************
 * EVOLUÇÃO / CONSULTAS – BACKEND PRONTIO
 * Aba: CONFIG.ABA_EVOLUCAO ("Consultas")
 *
 * Colunas esperadas:
 * ID_Evolucao | Data | Hora | ID_Paciente | NomePaciente |
 * Tipo | Evolucao | CriadoEm
 ******************************************************/

/**
 * Salvar evolução (novo ou edição)
 *
 * Front-end envia:
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
  const dados = body.dados || body.evolucao || body;
  const sheet = getSheet_(CONFIG.ABA_EVOLUCAO);

  const agora = new Date();

  // ID novo ou existente
  let id = dados.ID_Evolucao || dados.id || "";
  if (!id) id = gerarId_();

  // Se o usuário não enviar Data e Hora, preencher com agora
  const dataFinal =
    dados.Data ||
    dados.data ||
    Utilities.formatDate(agora, "America/Sao_Paulo", "yyyy-MM-dd");

  const horaFinal =
    dados.Hora ||
    dados.hora ||
    Utilities.formatDate(agora, "America/Sao_Paulo", "HH:mm");

  const obj = {
    ID_Evolucao:  id,
    Data:         dataFinal,
    Hora:         horaFinal,
    ID_Paciente:  dados.ID_Paciente || dados.idPaciente || "",
    NomePaciente: dados.NomePaciente || dados.nomePaciente || "",
    Tipo:         dados.Tipo || dados.tipo || "",
    Evolucao:     dados.Evolucao || dados.evolucao || "",
    CriadoEm:     dados.CriadoEm ||
                  Utilities.formatDate(agora, "America/Sao_Paulo", "dd/MM/yyyy HH:mm:ss")
  };

  // Upsert
  const result = upsertRow_(
    sheet,
    "ID_Evolucao",
    id,
    obj,
    {
      Data:     dataFinal,
      Hora:     horaFinal,
      CriadoEm: Utilities.formatDate(agora, "America/Sao_Paulo", "dd/MM/yyyy HH:mm:ss")
    }
  );

  // Registrar no prontuário
  registrarNoProntuario_(
    obj.ID_Paciente,
    "evolucao",
    obj.Tipo || "Evolução Clínica",
    obj.Evolucao || ""
  );

  return {
    ID_Evolucao: id,
    row: result.row
  };
}


/**
 * Listar evoluções de um paciente (ordenadas por data/hora desc)
 *
 * Actions aceitas:
 *   "evolucao-listar-paciente"
 *   "evolucao-por-paciente"
 */
function evolucaoListarPorPaciente_(body) {
  const idPaciente =
    body.ID_Paciente ||
    body.idPaciente ||
    body.idpaciente;

  if (!idPaciente) {
    throw new Error("ID_Paciente é obrigatório em evolucao-listar-paciente.");
  }

  const sheet = getSheet_(CONFIG.ABA_EVOLUCAO);
  const lista = listAllRowsAsObjects_(sheet);

  // Filtrar evoluções do paciente
  const filtrados = lista.filter(item =>
    String(item.ID_Paciente || "") === String(idPaciente)
  );

  // Ordenar por Data e Hora (mais recente primeiro)
  filtrados.sort((a, b) => {
    const d1 = new Date(a.Data + " " + a.Hora);
    const d2 = new Date(b.Data + " " + b.Hora);
    return d2 - d1;
  });

  return { evolucao: filtrados };
}
