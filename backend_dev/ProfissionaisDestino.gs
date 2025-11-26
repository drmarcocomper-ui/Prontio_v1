/******************************************************
 * PROFISSIONAIS DE DESTINO – BACKEND PRONTIO
 * Aba: CONFIG.ABA_PROF_DESTINO ("ProfissionaisDestino")
 *
 * Colunas sugeridas:
 * ID_Profissional | Nome | Especialidade | Telefone | Local | Observacoes
 *
 * Uso:
 *  Action: "profissionaisdestino-listar"
 *  Frontend (sugestão):
 *    PRONTIO.API.ProfissionaisDestino.listar({
 *      filtros: { busca: "urologia" }
 *    })
 ******************************************************/

/**
 * Lista profissionais de destino (com filtro opcional).
 *
 * Espera (opcional em body):
 * {
 *   filtros: {
 *     busca: "texto livre"  // procura em Nome, Especialidade, Local, Telefone, Observacoes
 *   }
 * }
 *
 * Retorno:
 * {
 *   profissionais: [
 *     { ID_Profissional, Nome, Especialidade, Telefone, Local, Observacoes, ... }
 *   ]
 * }
 *
 * O Code.gs faz o envelopamento final:
 *  { ok: true, action: "profissionaisdestino-listar", data: { profissionais } }
 */
function profissionaisDestinoListar_(body) {
  const filtros = (body && body.filtros) ? body.filtros : {};

  const busca = String(filtros.busca || filtros.Busca || "")
    .toLowerCase()
    .trim();

  // Usa a aba configurada no CONFIG
  const sheet = getSheet_(CONFIG.ABA_PROF_DESTINO);
  const dados = listAllRowsAsObjects_(sheet);

  let resultado = dados;

  // Filtro de texto (opcional)
  if (busca) {
    resultado = resultado.filter(function (p) {
      const nome = String(p.Nome || "").toLowerCase();
      const esp  = String(p.Especialidade || "").toLowerCase();
      const tel  = String(p.Telefone || "").toLowerCase();
      const loc  = String(p.Local || "").toLowerCase();
      const obs  = String(p.Observacoes || "").toLowerCase();

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
    return String(a.Nome || "").localeCompare(
      String(b.Nome || ""),
      "pt-BR"
    );
  });

  return { profissionais: resultado };
}
