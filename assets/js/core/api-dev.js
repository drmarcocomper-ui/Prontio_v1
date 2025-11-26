/**
 * ============================================================
 * PRONTIO DEV — API DEV
 * Roteador principal do ambiente de desenvolvimento (DEV)
 * ============================================================
 *
 * Front envia:
 *   method: POST
 *   headers: { "Content-Type": "text/plain" }
 *   body: JSON.stringify({ action, payload })
 *
 * Objetivo:
 * - Evitar preflight (OPTIONS)
 * - Garantir compatibilidade total com fetch() local
 * - Nunca expor planilhas ao front
 * - Manter padrão único de resposta
 */

// ============================================================
// ⛔ Entrada principal do WebApp DEV
// ============================================================
function doPost(e) {
  try {
    const rawBody =
      e &&
      e.postData &&
      typeof e.postData.contents === "string"
        ? e.postData.contents
        : "";

    console.log("🔵 PRONTIO DEV :: Corpo recebido =", rawBody);

    if (!rawBody) {
      return buildResponse(false, null, ["Requisição sem corpo."]);
    }

    let request;
    try {
      request = JSON.parse(rawBody);
    } catch (err) {
      console.error("⛔ Erro ao fazer JSON.parse:", err);
      return buildResponse(false, null, ["Formato JSON inválido no corpo."]);
    }

    const action = request.action;
    const payload = request.payload || {};

    if (!action) {
      return buildResponse(false, null, ['Campo "action" é obrigatório.']);
    }

    console.log("🔵 PRONTIO DEV :: action =", action, "payload =", payload);

    // ============================================================
    // 🔀 Roteamento das ações DEV
    // ============================================================
    let data;

    switch (action) {
      // ----------------------------------------------------------
      // PACIENTES (DEV)
      // ----------------------------------------------------------
      case "pacientes-listar":
        data = PacientesDev_listar(payload);
        break;

      case "pacientes-criar":
        data = PacientesDev_criar(payload);
        break;

      case "pacientes-atualizar":
        data = PacientesDev_atualizar(payload);
        break;

      case "pacientes-buscar-por-id":
        data = PacientesDev_buscarPorId(payload);
        break;

      // ----------------------------------------------------------
      // AGENDA (DEV)
      // ----------------------------------------------------------
      case "agenda-listar":
        data = AgendaDev_listar(payload);
        break;

      case "agenda-criar":
        data = AgendaDev_criar(payload);
        break;

      case "agenda-excluir":
        data = AgendaDev_excluir(payload);
        break;

      // ----------------------------------------------------------
      // EVOLUÇÃO (DEV)
      // ----------------------------------------------------------
      case "evolucao-listar":
        data = EvolucaoDev_listar(payload);
        break;

      case "evolucao-criar":
        data = EvolucaoDev_criar(payload);
        break;

      // ----------------------------------------------------------
      // DEFAULT
      // ----------------------------------------------------------
      default:
        console.warn("⚠️ Ação desconhecida recebida:", action);
        return buildResponse(false, null, ["Ação desconhecida: " + action]);
    }

    return buildResponse(true, data, []);

  } catch (err) {
    console.error("⛔ Erro inesperado no roteador DEV:", err);
    return buildResponse(false, null, [String(err)]);
  }
}

// ============================================================
// 📦 Função padronizada de resposta da API
// ============================================================
function buildResponse(success, data, errors) {
  return ContentService.createTextOutput(
    JSON.stringify({
      success: success,
      data: data ?? null,
      errors: errors || []
    })
  ).setMimeType(ContentService.MimeType.JSON);
}
