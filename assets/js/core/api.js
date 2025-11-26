/******************************************************
 * PRONTIO – api.js (PRODUÇÃO)
 *
 * Camada de ATALHOS acima do api-core.js
 * 
 * Requisitos:
 *  - api-core.js deve ser carregado ANTES deste arquivo;
 *  - api-core.js define window.callApi e PRONTIO.API.call.
 *
 * Objetivo:
 *  - Organizar chamadas de API por módulos:
 *      PRONTIO.Pacientes.listar(...)
 *      PRONTIO.Agenda.listarPorData(...)
 *      PRONTIO.Prontuario.listarPorPaciente(...)
 *      etc.
 *
 * TODAS as actions foram alinhadas com seu doPost (Code.gs):
 *  - pacientes-salvar / pacientes-listar / pacientes-obter
 *  - agenda-salvar / agenda-listar / agenda-listar-data / agenda-listar-paciente / agenda-atualizar-status
 *  - evolucao-salvar / evolucao-listar-paciente
 *  - receita-salvar / receita-listar-paciente
 *  - medicamentos-listar
 *  - exame-salvar / exame-listar-paciente
 *  - laudo-salvar / laudo-listar-paciente
 *  - atestado-salvar / atestado-listar-paciente
 *  - comparecimento-salvar / comparecimento-listar-paciente
 *  - sadt-salvar / sadt-listar-paciente
 *  - consentimento-salvar / consentimento-listar-paciente
 *  - profissionaisdestino-listar
 *  - encaminhamento-salvar / encaminhamento-listar-paciente
 *  - listarProntuarioPorPaciente
 ******************************************************/

window.PRONTIO = window.PRONTIO || {};
PRONTIO.API = PRONTIO.API || {};

// ---------------------------------------------------------------------------
// Função auxiliar genérica
// ---------------------------------------------------------------------------

/**
 * Chama a API do PRONTIO (PRODUÇÃO), garantindo um formato básico para o payload.
 *
 * @param {string} action - Nome da action (igual ao doPost do Apps Script).
 * @param {object} data   - Dados complementares (serão mesclados ao body).
 * @returns {Promise<object>} Resposta JSON do backend.
 */
PRONTIO.API.request = async function (action, data) {
  if (!action) {
    throw new Error("PRONTIO.API.request: action é obrigatório.");
  }

  const body = Object.assign({}, data || {}, { action });

  // callApi vem do api-core.js (produção)
  return window.callApi(body);
};

// ---------------------------------------------------------------------------
// MÓDULO: Pacientes
// ---------------------------------------------------------------------------

PRONTIO.Pacientes = {
  /**
   * Salva (cria/edita) um paciente.
   * Backend: action = "pacientes-salvar"
   * @param {object} paciente - Objeto com os dados do paciente.
   */
  salvar(paciente) {
    return PRONTIO.API.request("pacientes-salvar", {
      paciente: paciente || {},
    });
  },

  /**
   * Lista pacientes.
   * Backend: action = "pacientes-listar"
   * @param {object} filtros - Ex.: { termo: "Maria" }
   */
  listar(filtros) {
    return PRONTIO.API.request("pacientes-listar", {
      filtros: filtros || {},
    });
  },

  /**
   * Obtém dados de um paciente específico.
   * Backend: action = "pacientes-obter"
   * @param {string} idPaciente
   */
  obter(idPaciente) {
    return PRONTIO.API.request("pacientes-obter", {
      idPaciente,
    });
  },
};

// ---------------------------------------------------------------------------
// MÓDULO: Agenda
// ---------------------------------------------------------------------------

PRONTIO.Agenda = {
  /**
   * Salva (cria/edita) um agendamento.
   * Backend: action = "agenda-salvar"
   * @param {object} agendamento 
   */
  salvar(agendamento) {
    return PRONTIO.API.request("agenda-salvar", {
      agendamento: agendamento || {},
    });
  },

  /**
   * Lista a agenda de forma geral (conforme filtros do backend).
   * Backend: action = "agenda-listar"
   * @param {object} filtros - Ex.: { dataInicio, dataFim } ou o que você definiu no Apps Script.
   */
  listar(filtros) {
    return PRONTIO.API.request("agenda-listar", filtros || {});
  },

  /**
   * Lista agendamentos de uma data específica.
   * Backend: action = "agenda-listar-data"
   * @param {string} dataISO - Ex.: "2025-11-25"
   */
  listarPorData(dataISO) {
    return PRONTIO.API.request("agenda-listar-data", {
      data: dataISO,
    });
  },

  /**
   * Lista agendamentos de um paciente.
   * Backend: action = "agenda-listar-paciente"
   * @param {string} idPaciente
   */
  listarPorPaciente(idPaciente) {
    return PRONTIO.API.request("agenda-listar-paciente", {
      idPaciente,
    });
  },

  /**
   * Atualiza o status de um agendamento.
   * Backend: action = "agenda-atualizar-status"
   * @param {string} idAgendamento
   * @param {string} novoStatus
   */
  atualizarStatus(idAgendamento, novoStatus) {
    return PRONTIO.API.request("agenda-atualizar-status", {
      idAgendamento,
      status: novoStatus,
    });
  },
};

// ---------------------------------------------------------------------------
// MÓDULO: Evolução / Consultas
// ---------------------------------------------------------------------------

PRONTIO.Evolucao = {
  /**
   * Salva uma evolução/consulta.
   * Backend: action = "evolucao-salvar"
   * @param {object} evolucao
   */
  salvar(evolucao) {
    return PRONTIO.API.request("evolucao-salvar", {
      evolucao: evolucao || {},
    });
  },

  /**
   * Lista evoluções de um paciente.
   * Backend: action = "evolucao-listar-paciente"
   * (alias no backend: "evolucao-por-paciente")
   * @param {string} idPaciente
   */
  listarPorPaciente(idPaciente) {
    return PRONTIO.API.request("evolucao-listar-paciente", {
      idPaciente,
    });
  },
};

// ---------------------------------------------------------------------------
// MÓDULO: Receitas
// ---------------------------------------------------------------------------

PRONTIO.Receitas = {
  /**
   * Salva uma receita.
   * Backend: action = "receita-salvar"
   * @param {object} receita
   */
  salvar(receita) {
    return PRONTIO.API.request("receita-salvar", {
      receita: receita || {},
    });
  },

  /**
   * Lista receitas de um paciente.
   * Backend: action = "receita-listar-paciente"
   * (alias no backend: "receitas-por-paciente")
   * @param {string} idPaciente
   */
  listarPorPaciente(idPaciente) {
    return PRONTIO.API.request("receita-listar-paciente", {
      idPaciente,
    });
  },
};

// ---------------------------------------------------------------------------
// MÓDULO: Medicamentos (tabela de apoio)
// ---------------------------------------------------------------------------

PRONTIO.Medicamentos = {
  /**
   * Lista medicamentos cadastrados.
   * Backend: action = "medicamentos-listar"
   * @param {object} filtros - opcional
   */
  listar(filtros) {
    return PRONTIO.API.request("medicamentos-listar", {
      filtros: filtros || {},
    });
  },
};

// ---------------------------------------------------------------------------
// MÓDULO: Exames
// ---------------------------------------------------------------------------

PRONTIO.Exames = {
  /**
   * Salva pedido de exame.
   * Backend: action = "exame-salvar"
   * @param {object} exame
   */
  salvar(exame) {
    return PRONTIO.API.request("exame-salvar", {
      exame: exame || {},
    });
  },

  /**
   * Lista exames de um paciente.
   * Backend: action = "exame-listar-paciente"
   * (alias no backend: "exames-por-paciente")
   * @param {string} idPaciente
   */
  listarPorPaciente(idPaciente) {
    return PRONTIO.API.request("exame-listar-paciente", {
      idPaciente,
    });
  },
};

// ---------------------------------------------------------------------------
// MÓDULO: Laudos
// ---------------------------------------------------------------------------

PRONTIO.Laudos = {
  /**
   * Salva laudo.
   * Backend: action = "laudo-salvar"
   * @param {object} laudo
   */
  salvar(laudo) {
    return PRONTIO.API.request("laudo-salvar", {
      laudo: laudo || {},
    });
  },

  /**
   * Lista laudos de um paciente.
   * Backend: action = "laudo-listar-paciente"
   * (alias no backend: "laudos-por-paciente")
   * @param {string} idPaciente
   */
  listarPorPaciente(idPaciente) {
    return PRONTIO.API.request("laudo-listar-paciente", {
      idPaciente,
    });
  },
};

// ---------------------------------------------------------------------------
// MÓDULO: Atestados
// ---------------------------------------------------------------------------

PRONTIO.Atestados = {
  /**
   * Salva atestado.
   * Backend: action = "atestado-salvar"
   * @param {object} atestado
   */
  salvar(atestado) {
    return PRONTIO.API.request("atestado-salvar", {
      atestado: atestado || {},
    });
  },

  /**
   * Lista atestados de um paciente.
   * Backend: action = "atestado-listar-paciente"
   * (alias no backend: "atestados-por-paciente")
   * @param {string} idPaciente
   */
  listarPorPaciente(idPaciente) {
    return PRONTIO.API.request("atestado-listar-paciente", {
      idPaciente,
    });
  },
};

// ---------------------------------------------------------------------------
// MÓDULO: Declaração de Comparecimento
// ---------------------------------------------------------------------------

PRONTIO.Comparecimento = {
  /**
   * Salva declaração de comparecimento.
   * Backend: action = "comparecimento-salvar"
   * @param {object} comparecimento
   */
  salvar(comparecimento) {
    return PRONTIO.API.request("comparecimento-salvar", {
      comparecimento: comparecimento || {},
    });
  },

  /**
   * Lista declarações de comparecimento de um paciente.
   * Backend: action = "comparecimento-listar-paciente"
   * (alias no backend: "comparecimentos-por-paciente")
   * @param {string} idPaciente
   */
  listarPorPaciente(idPaciente) {
    return PRONTIO.API.request("comparecimento-listar-paciente", {
      idPaciente,
    });
  },
};

// ---------------------------------------------------------------------------
// MÓDULO: SADT
// ---------------------------------------------------------------------------

PRONTIO.SADT = {
  /**
   * Salva solicitação SADT.
   * Backend: action = "sadt-salvar"
   * @param {object} sadt
   */
  salvar(sadt) {
    return PRONTIO.API.request("sadt-salvar", {
      sadt: sadt || {},
    });
  },

  /**
   * Lista SADT de um paciente.
   * Backend: action = "sadt-listar-paciente"
   * @param {string} idPaciente
   */
  listarPorPaciente(idPaciente) {
    return PRONTIO.API.request("sadt-listar-paciente", {
      idPaciente,
    });
  },
};

// ---------------------------------------------------------------------------
// MÓDULO: Consentimento
// ---------------------------------------------------------------------------

PRONTIO.Consentimento = {
  /**
   * Salva consentimento informado.
   * Backend: action = "consentimento-salvar"
   * @param {object} consentimento
   */
  salvar(consentimento) {
    return PRONTIO.API.request("consentimento-salvar", {
      consentimento: consentimento || {},
    });
  },

  /**
   * Lista consentimentos de um paciente.
   * Backend: action = "consentimento-listar-paciente"
   * @param {string} idPaciente
   */
  listarPorPaciente(idPaciente) {
    return PRONTIO.API.request("consentimento-listar-paciente", {
      idPaciente,
    });
  },
};

// ---------------------------------------------------------------------------
// MÓDULO: Profissionais de Destino
// ---------------------------------------------------------------------------

PRONTIO.ProfissionaisDestino = {
  /**
   * Lista profissionais de destino.
   * Backend: action = "profissionaisdestino-listar"
   * @param {object} filtros - opcional
   */
  listar(filtros) {
    return PRONTIO.API.request("profissionaisdestino-listar", {
      filtros: filtros || {},
    });
  },
};

// ---------------------------------------------------------------------------
// MÓDULO: Encaminhamento
// ---------------------------------------------------------------------------

PRONTIO.Encaminhamento = {
  /**
   * Salva encaminhamento.
   * Backend: action = "encaminhamento-salvar"
   * @param {object} encaminhamento
   */
  salvar(encaminhamento) {
    return PRONTIO.API.request("encaminhamento-salvar", {
      encaminhamento: encaminhamento || {},
    });
  },

  /**
   * Lista encaminhamentos de um paciente.
   * Backend: action = "encaminhamento-listar-paciente"
   * (alias no backend: "encaminhamentos-por-paciente")
   * @param {string} idPaciente
   */
  listarPorPaciente(idPaciente) {
    return PRONTIO.API.request("encaminhamento-listar-paciente", {
      idPaciente,
    });
  },
};

// ---------------------------------------------------------------------------
// MÓDULO: Prontuário (Timeline)
// ---------------------------------------------------------------------------

PRONTIO.Prontuario = {
  /**
   * Lista todo o prontuário (timeline) de um paciente.
   * Backend: action = "listarProntuarioPorPaciente"
   * @param {string} idPaciente
   */
  listarPorPaciente(idPaciente) {
    return PRONTIO.API.request("listarProntuarioPorPaciente", {
      idPaciente,
    });
  },
};

// ---------------------------------------------------------------------------
// LOG de inicialização
// ---------------------------------------------------------------------------

console.log("PRONTIO (PRODUÇÃO) :: api.js carregado. Atalhos por módulo disponíveis.");
