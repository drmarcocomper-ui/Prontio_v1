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
 * Listar todos os medicamentos
 * Action: "medicamentos-listar"
 *
 * O frontend usa:
 * PRONTIO.API.Medicamentos.listar({ filtroOpcional })
 */
function medicamentosListar_(body) {
  const sheet = getSheet_(CONFIG.ABA_MEDICAMENTOS);
  const dados = listAllRowsAsObjects_(sheet);

  // Se um dia quiser filtrar, podemos usar body.filtros
  const filtros = body.filtros || {};
  const busca = String(filtros.busca || "").trim().toLowerCase();

  let resultado = dados;

  if (busca) {
    resultado = resultado.filter(med => {
      return (
        String(med.NomeMedicacao || "").toLowerCase().includes(busca) ||
        String(med.Apresentacao || "").toLowerCase().includes(busca) ||
        String(med.PosologiaSugerida || "").toLowerCase().includes(busca)
      );
    });
  }

  // Ordenar alfabeticamente por nome
  resultado.sort((a, b) =>
    String(a.NomeMedicacao || "").localeCompare(
      String(b.NomeMedicacao || ""),
      "pt-BR"
    )
  );

  return { medicamentos: resultado };
}
