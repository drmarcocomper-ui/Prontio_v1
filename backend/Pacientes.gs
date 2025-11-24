/******************************************************
 * PACIENTES – BACKEND (usa helpers do Code.gs)
 * - Listar (com filtros)
 * - Salvar (inserir/atualizar = upsert)
 * - Obter por ID
 *
 * Integração com o front:
 *  - Action "pacientes-listar"  → pacientesListar_(body)
 *  - Action "pacientes-salvar"  → pacientesSalvar_(body)
 *  - Action "pacientes-obter"   → pacientesObter_(body)
 *
 * Observação importante:
 *  - Seu /assets/js/core/api.js envia:
 *      Pacientes.listar(filtros) → { action: "pacientes-listar", filtros }
 *      Pacientes.salvar(dados)   → { action: "pacientes-salvar", dados }
 ******************************************************/

/**
 * Lista pacientes na aba CONFIG.ABA_PACIENTES
 *
 * Filtros esperados (em body.filtros):
 *  - busca: string (nome, CPF, telefone, email, RG)
 *  - ativo: "S", "N", "TODOS" (padrão: S)
 *
 * Retorno:
 *  { pacientes: [ ... ] }
 *
 * Code.gs envelopa como:
 *  { ok: true, action: "pacientes-listar", data: { pacientes: [...] } }
 */
function pacientesListar_(body) {
  const sheet = getSheet_(CONFIG.ABA_PACIENTES);
  let pacientes = listAllRowsAsObjects_(sheet);

  const filtros = body.filtros || {};

  const busca = String(filtros.busca || filtros.Busca || "")
    .toLowerCase()
    .trim();

  let ativo = filtros.ativo || filtros.Ativo || "S";

  // Filtro por status (Ativo)
  if (ativo && ativo !== "TODOS") {
    pacientes = pacientes.filter(p => {
      const val = String(p.Ativo || p.ativo || "S");
      return val === ativo;
    });
  }

  // Filtro de busca (nome, CPF, RG, telefones, email)
  if (busca) {
    pacientes = pacientes.filter(p => {
      const nome =
        String(p.NomePaciente || p.NomeCompleto || p.nome || "").toLowerCase();
      const cpf = String(p.CPF || p.cpf || "").toLowerCase();
      const rg = String(p.RG || p.rg || "").toLowerCase();
      const tel1 = String(p.Telefone1 || p.telefone1 || "").toLowerCase();
      const tel2 = String(p.Telefone2 || p.telefone2 || "").toLowerCase();
      const email = String(p.Email || p.email || "").toLowerCase();

      return (
        nome.includes(busca) ||
        cpf.includes(busca) ||
        rg.includes(busca) ||
        tel1.includes(busca) ||
        tel2.includes(busca) ||
        email.includes(busca)
      );
    });
  }

  return { pacientes };
}

/**
 * Salvar paciente (insert/update)
 *
 * O frontend atualmente envia:
 *   PacientesApi.salvar(dados) → body.dados
 *
 * Também aceitamos:
 *   body.paciente (compatibilidade)
 *   ou o próprio body
 *
 * Regras:
 *  - Se não vier ID_Paciente → gera um novo (paciente novo)
 *  - Se vier ID_Paciente → atualiza a linha existente
 */
function pacientesSalvar_(body) {
  // Flexível para aceitar body.dados, body.paciente ou o próprio body
  const dados = body.dados || body.paciente || body || {};
  const sheet = getSheet_(CONFIG.ABA_PACIENTES);

  // ID do paciente enviado
  const idAtual =
    dados.ID_Paciente || dados.idPaciente || dados.IdPaciente || dados.id || "";

  const ehNovo = !idAtual;

  // Campos extras adicionados somente se for novo paciente
  const extrasNovo = {};

  if (ehNovo) {
    extrasNovo.ID_Paciente = gerarId_();                // ID automático PRONTIO
    extrasNovo.DataCadastro = formatDate_(new Date());  // campo opcional
    extrasNovo.Ativo = dados.Ativo || dados.ativo || "S"; // S=sim, N=não
  }

  // Insere ou atualiza de acordo com o ID_Paciente
  // upsertRow_ deve ser implementado em outro módulo (por ex. Util.gs)
  const resultado = upsertRow_(
    sheet,
    "ID_Paciente",
    idAtual,
    dados,
    extrasNovo
  );

  const linha = resultado.row;

  // Pega valores completos da linha salva para devolver ao frontend
  const lastCol = sheet.getLastColumn();
  const header = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const valores = sheet.getRange(linha, 1, 1, lastCol).getValues()[0];

  const pacienteSalvo = rowToObject_(header, valores);

  return { paciente: pacienteSalvo };
}

/**
 * Obter paciente por ID
 *
 * Aceita:
 *  - body.ID_Paciente
 *  - body.idPaciente
 *  - body.id  (fallback)
 *
 * Retorno:
 *  { paciente: {...} } ou { paciente: null }
 */
function pacientesObter_(body) {
  const id =
    body.ID_Paciente || body.idPaciente || body.IdPaciente || body.id;

  if (!id) return { paciente: null };

  const sheet = getSheet_(CONFIG.ABA_PACIENTES);
  const dados = listAllRowsAsObjects_(sheet);

  const paciente =
    dados.find(p => String(p.ID_Paciente) === String(id)) || null;

  return { paciente };
}
