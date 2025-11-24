/******************************************************
 * PRONTIO – api.js
 * Camada de acesso ao backend por módulo
 *
 * Depende de:
 *  - api-core.js  (define callApi / PRONTIO.API.call)
 *
 * Organização:
 * - PRONTIO.API.Pacientes
 * - PRONTIO.API.Agenda
 * - PRONTIO.API.Evolucao
 * - PRONTIO.API.Receita
 * - PRONTIO.API.Exames
 * - PRONTIO.API.Laudos
 * - PRONTIO.API.Atestados
 * - PRONTIO.API.Comparecimento
 * - PRONTIO.API.Medicamentos
 ******************************************************/

window.PRONTIO = window.PRONTIO || {};
PRONTIO.API = PRONTIO.API || {};

// Atalho interno para a função de chamada genérica
const _call = PRONTIO.API.call || window.callApi;

/* ========= PACIENTES ========= */

PRONTIO.API.Pacientes = {
  /**
   * Lista pacientes (com filtros opcionais no futuro).
   * Backend: pacientes-listar
   */
  listar(filtros = {}) {
    // No backend, pacientesListar_(body) recebe { action, filtros }
    return _call({ action: "pacientes-listar", filtros });
  },

  /**
   * Salva paciente (novo ou edição).
   * Backend: pacientes-salvar
   * body.dados vai para Pacientes.gs, que aceita body.dados / body.payload / body direto.
   */
  salvar(dados) {
    return _call({ action: "pacientes-salvar", dados });
  },

  /**
   * Obtém um paciente específico pelo ID.
   * Backend: pacientes-obter
   */
  obter(idPaciente) {
    return _call({ action: "pacientes-obter", idPaciente });
  },
};

/* ========= AGENDA ========= */

PRONTIO.API.Agenda = {
  listar(filtros = {}) {
    return _call({ action: "agenda-listar", filtros });
  },

  salvar(dados) {
    return _call({ action: "agenda-salvar", dados });
  },

  atualizarStatus(idAgenda, status) {
    return _call({
      action: "agenda-atualizar-status",
      ID_Agenda: idAgenda,
      Status: status,
    });
  },
};

/* ========= EVOLUÇÃO / CONSULTAS ========= */

PRONTIO.API.Evolucao = {
  salvar(dados) {
    return _call({ action: "evolucao-salvar", dados });
  },

  listarPorPaciente(idPaciente) {
    return _call({ action: "evolucao-por-paciente", idPaciente });
  },
};

/* ========= RECEITAS ========= */

PRONTIO.API.Receita = {
  salvar(dados) {
    return _call({ action: "receita-salvar", dados });
  },

  listarPorPaciente(idPaciente) {
    return _call({ action: "receitas-por-paciente", idPaciente });
  },
};

/* ========= EXAMES ========= */

PRONTIO.API.Exames = {
  salvar(dados) {
    return _call({ action: "exame-salvar", dados });
  },

  listarPorPaciente(idPaciente) {
    return _call({ action: "exames-por-paciente", idPaciente });
  },
};

/* ========= LAUDOS ========= */

PRONTIO.API.Laudos = {
  salvar(dados) {
    return _call({ action: "laudo-salvar", dados });
  },

  listarPorPaciente(idPaciente) {
    return _call({ action: "laudos-por-paciente", idPaciente });
  },
};

/* ========= ATESTADOS ========= */

PRONTIO.API.Atestados = {
  salvar(dados) {
    return _call({ action: "atestado-salvar", dados });
  },

  listarPorPaciente(idPaciente) {
    return _call({ action: "atestados-por-paciente", idPaciente });
  },
};

/* ========= COMPARECIMENTO ========= */

PRONTIO.API.Comparecimento = {
  salvar(dados) {
    return _call({ action: "comparecimento-salvar", dados });
  },

  listarPorPaciente(idPaciente) {
    return _call({ action: "comparecimentos-por-paciente", idPaciente });
  },
};

/* ========= MEDICAMENTOS ========= */

PRONTIO.API.Medicamentos = {
  listar(filtros = {}) {
    return _call({ action: "medicamentos-listar", filtros });
  },
};

/* ==========================================================
   WRAPPERS GLOBAIS (compatibilidade com código antigo)
   ========================================================== */

window.PacientesApi = PRONTIO.API.Pacientes;
window.AgendaApi = PRONTIO.API.Agenda;
window.EvolucaoApi = PRONTIO.API.Evolucao;
window.ReceitaApi = PRONTIO.API.Receita;
window.ExamesApi = PRONTIO.API.Exames;
window.LaudosApi = PRONTIO.API.Laudos;
window.AtestadosApi = PRONTIO.API.Atestados;
window.ComparecimentoApi = PRONTIO.API.Comparecimento;
window.MedicamentosApi = PRONTIO.API.Medicamentos;
