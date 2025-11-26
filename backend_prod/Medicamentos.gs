/******************************************************
 * MEDICAMENTOS – BACKEND PRONTIO
 * Aba: CONFIG.ABA_MEDICAMENTOS
 *
 * Colunas sugeridas:
 * ID_Medicamento | NomeMedicacao | Apresentacao |
 * PosologiaSugerida | QuantidadePadrao | ViaAdministracao |
 * TipoReceita | Observacoes | EhAntibiotico | EhControleEspecial
 ******************************************************/

/**
 * Lista medicamentos da aba "Medicamentos"
 * Action: "medicamentos-listar"
 *
 * O frontend chama:
 *   PRONTIO.API.Medicamentos.listar({ busca })
 *
 * Filtros suportados:
 *   filtros.busca              → nome, apresentação, posologia, observações
 *   filtros.via                → ViaAdministracao
 *   filtros.tipoReceita        → TipoReceita
 *   filtros.ehAntibiotico      → "S" ou "N"
 *   filtros.ehControleEspecial → "S" ou "N"
 */
function medicamentosListar_(body) {
  const sheet = getSheet_(CONFIG.ABA_MEDICAMENTOS);
  const dados = listAllRowsAsObjects_(sheet);

  const filtros = body.filtros || {};

  const busca = String(filtros.busca || "")
    .trim()
    .toLowerCase();

  const via = String(filtros.via || "").trim().toLowerCase();
  const tipoReceita = String(filtros.tipoReceita || "").trim().toLowerCase();

  const ehAntibiotico = String(filtros.ehAntibiotico || "").toUpperCase(); // S/N
  const ehControle = String(filtros.ehControleEspecial || "").toUpperCase(); // S/N

  let resultado = dados;

  /******************************************************
   * 1) Filtro textual (nome, apresentação, posologia, observações)
   ******************************************************/
  if (busca) {
    resultado = resultado.filter(med => {
      return (
        String(med.NomeMedicacao || "").toLowerCase().includes(busca) ||
        String(med.Apresentacao || "").toLowerCase().includes(busca) ||
        String(med.PosologiaSugerida || "").toLowerCase().includes(busca) ||
        String(med.Observacoes || "").toLowerCase().includes(busca)
      );
    });
  }

  /******************************************************
   * 2) Filtro por via de administração
   ******************************************************/
  if (via) {
    resultado = resultado.filter(med =>
      String(med.ViaAdministracao || "")
        .toLowerCase()
        .includes(via)
    );
  }

  /******************************************************
   * 3) Filtro por tipo de receita
   ******************************************************/
  if (tipoReceita) {
    resultado = resultado.filter(med =>
      String(med.TipoReceita || "")
        .toLowerCase()
        .includes(tipoReceita)
    );
  }

  /******************************************************
   * 4) Filtro por antibiótico
   ******************************************************/
  if (ehAntibiotico === "S") {
    resultado = resultado.filter(med =>
      String(med.EhAntibiotico || "").toUpperCase() === "S"
    );
  } else if (ehAntibiotico === "N") {
    resultado = resultado.filter(med =>
      String(med.EhAntibiotico || "").toUpperCase() !== "S"
    );
  }

  /******************************************************
   * 5) Filtro por controle especial
   ******************************************************/
  if (ehControle === "S") {
    resultado = resultado.filter(med =>
      String(med.EhControleEspecial || "").toUpperCase() === "S"
    );
  } else if (ehControle === "N") {
    resultado = resultado.filter(med =>
      String(med.EhControleEspecial || "").toUpperCase() !== "S"
    );
  }

  /******************************************************
   * 6) Ordenação alfabética final por nome
   ******************************************************/
  resultado.sort((a, b) => {
    return String(a.NomeMedicacao || "").localeCompare(
      String(b.NomeMedicacao || ""),
      "pt-BR"
    );
  });

  return { medicamentos: resultado };
}
