/******************************************************
 * PROFISSIONAIS DE DESTINO – BACKEND PRONTIO
 * Aba: ProfissionaisDestino
 *
 * Colunas sugeridas:
 * ID_Profissional | Nome | Especialidade | Telefone | Local | Observacoes
 *
 * Uso:
 *  Action: "profissionaisdestino-listar"
 *  Frontend: PRONTIO.API.Medicamentos.listar({ filtros: { busca: "urologia" } })
 ******************************************************/

/**
 * Lista todos os profissionais de destino (com filtro opcional).
 *
 * Espera (opcional):
 * {
 *   filtros: {
 *     busca: "texto livre"  // procura em Nome, Especialidade, Local, Telefone
 *   }
 * }
 *
 * Retorno:
 * { profissionais: [ { ID_Profissional, Nome, Especialidade, Telefone, Local, Observacoes, ... } ] }
 */
function profissionaisDestinoListar_(body) {
  var filtros = body && body.filtros ? body.filtros : {};
  var buscaRaw = filtros.busca || "";
  var busca = String(buscaRaw).toLowerCase().trim();

  // Se você adicionou CONFIG.ABA_PROFISSIONAIS_DESTINO, pode usar:
  // var sheet = getSheet_(CONFIG.ABA_PROFISSIONAIS_DESTINO);
  // Por enquanto, vamos usar o nome literal da aba:
  var sheet = getSheet_("ProfissionaisDestino");

  var dados = listAllRowsAsObjects_(sheet);
  var resultado = dados;

  // Filtro de texto (opcional)
  if (busca) {
    resultado = resultado.filter(function (p) {
      var nome = String(p.Nome || "").toLowerCase();
      var esp  = String(p.Especialidade || "").toLowerCase();
      var tel  = String(p.Telefone || "").toLowerCase();
      var loc  = String(p.Local || "").toLowerCase();
      var obs  = String(p.Observacoes || "").toLowerCase();

      return (
        nome.includes(busca) ||
        esp.includes(busca)  ||
        tel.includes(busca)  ||
        loc.includes(busca)  ||
        obs.includes(busca)
      );
    });
  }

  // Ordenar alfabeticamente por Nome
  resultado.sort(function (a, b) {
    return String(a.Nome || "").localeCompare(String(b.Nome || ""), "pt-BR");
  });

  return { profissionais: resultado };
}
