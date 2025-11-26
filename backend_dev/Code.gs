/**
 * Code.gs (backend_dev)
 * 
 * Arquivo PRINCIPAL da API DEV.
 * Contém:
 *  - doPost(e)
 *  - roteador geral
 *  - delegadores por módulo
 *  - resposta JSON padronizada
 *
 * Convenção de ação:
 *   action = "Modulo.Metodo"
 *   Ex.: "Pacientes.Criar"
 */

/**
 * Entrada principal da API (Web App).
 */
function doPost(e) {
  let requestBody;

  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Requisição sem corpo.");
    }
    requestBody = JSON.parse(e.postData.contents);
  } catch (error) {
    return buildJsonResponse({
      success: false,
      data: null,
      errors: ["Falha ao ler JSON de entrada: " + error.message]
    });
  }

  const action = requestBody.action;
  const payload = requestBody.payload || {};

  let result;

  try {
    result = routeAction_(action, payload);
  } catch (error) {
    result = {
      success: false,
      data: null,
      errors: ["Erro interno: " + error.message]
    };
  }

  return buildJsonResponse(result);
}

/**
 * Roteador de ações.
 *
 * @param {string} action - Ex.: "Pacientes.Criar"
 * @param {Object} payload
 * @returns {Object}
 */
function routeAction_(action, payload) {
  if (!action) {
    return {
      success: false,
      data: null,
      errors: ["Ação não informada."]
    };
  }

  const parts = String(action).split(".");

  if (parts.length !== 2) {
    return {
      success: false,
      data: null,
      errors: [
        'Ação inválida: "' +
          action +
          '". Use o formato "Modulo.Metodo".'
      ]
    };
  }

  const modulo = parts[0];
  const metodo = parts[1];

  switch (modulo) {
    case "Pacientes":
      return handlePacientesAction_(metodo, payload);

    // No futuro (Agenda, Evolução, Receita etc.):
    // case "Agenda": return handleAgendaAction_(metodo, payload);
    // case "Evolucao": return handleEvolucaoAction_(metodo, payload);

    default:
      return {
        success: false,
        data: null,
        errors: ['Módulo desconhecido: "' + modulo + '".']
      };
  }
}

/**
 * Delegador do módulo Pacientes.
 *
 * @param {string} metodo
 * @param {Object} payload
 */
function handlePacientesAction_(metodo, payload) {
  switch (metodo) {
    case "Criar":
      return Pacientes_criar(payload);

    // No futuro:
    // case "Listar": return Pacientes_listar(payload);
    // case "BuscarPorId": return Pacientes_buscarPorId(payload);

    default:
      return {
        success: false,
        data: null,
        errors: ['Método desconhecido em Pacientes: "' + metodo + '".']
      };
  }
}

/**
 * Constrói resposta JSON padronizada.
 */
function buildJsonResponse(obj) {
  const json = JSON.stringify(obj);
  return ContentService.createTextOutput(json).setMimeType(
    ContentService.MimeType.JSON
  );
}
