/******************************************************
 * PACIENTES – BACKEND (usa helpers do Code.gs)
 * - Listar
 * - Salvar (inserir/atualizar = upsert)
 * - Obter por ID (opcional)
 ******************************************************/

/**
 * Lista todos os pacientes na aba CONFIG.ABA_PACIENTES
 */
function pacientesListar_(body) {
  const sheet = getSheet_(CONFIG.ABA_PACIENTES);
  const pacientes = listAllRowsAsObjects_(sheet);
  return { pacientes };
}

/**
 * Salvar paciente (insert/update)
 * O frontend envia:
 *   body.paciente = { NomePaciente, CPF, Telefone1, ... }
 */
function pacientesSalvar_(body) {
  const dados = body.paciente || {};
  const sheet = getSheet_(CONFIG.ABA_PACIENTES);

  // ID do paciente enviado
  const idAtual = dados.ID_Paciente;
  const ehNovo = !idAtual;

  // Campos extras adicionados somente se for novo paciente
  const extrasNovo = {};

  if (ehNovo) {
    extrasNovo.ID_Paciente = gerarId_();                // ID automático PRONTIO
    extrasNovo.DataCadastro = formatDate_(new Date());  // campo opcional
    extrasNovo.Ativo = dados.Ativo || "S";              // S=sim, N=não
  }

  // Insere ou atualiza de acordo com o ID_Paciente
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
 * Pode ser usado pelo frontend caso necessário.
 */
function pacientesObter_(body) {
  const id = body.ID_Paciente;
  if (!id) return { paciente: null };

  const sheet = getSheet_(CONFIG.ABA_PACIENTES);
  const dados = listAllRowsAsObjects_(sheet);

  const paciente = dados.find(p => String(p.ID_Paciente) === String(id)) || null;

  return { paciente };
}
