/**
 * Pacientes.gs (backend_dev)
 * 
 * Módulo de Pacientes (DEV) do PRONTIO.
 * 
 * Estrutura sugerida de aba:
 *  A: ID_PACIENTE
 *  B: NOME_COMPLETO
 *  C: DATA_NASCIMENTO
 *  D: CPF
 *  E: TELEFONE
 *  F: EMAIL
 *  G: OBSERVACOES
 *  H: DATA_CADASTRO
 */
const SHEET_PACIENTES_DEV = "PACIENTES_DEV";

/**
 * Ação: Pacientes.Criar
 */
function Pacientes_criar(payload) {
  const nomeCompleto = (payload?.nomeCompleto || "").trim();
  const dataNascimento = payload?.dataNascimento || "";
  const cpf = payload?.cpf || "";
  const telefone = payload?.telefone || "";
  const email = payload?.email || "";
  const observacoes = payload?.observacoes || "";

  if (!nomeCompleto) {
    return {
      success: false,
      data: null,
      errors: ["Nome do paciente é obrigatório."]
    };
  }

  const sheet = Pacientes_getSheet_();
  const idPaciente = Pacientes_generateId_();
  const dataCadastro = new Date();

  sheet.appendRow([
    idPaciente,
    nomeCompleto,
    dataNascimento,
    cpf,
    telefone,
    email,
    observacoes,
    dataCadastro
  ]);

  return {
    success: true,
    data: {
      idPaciente,
      nomeCompleto,
      dataNascimento: dataNascimento || null,
      cpf: cpf || null,
      telefone: telefone || null,
      email: email || null,
      observacoes: observacoes || null,
      dataCadastro
    },
    errors: []
  };
}

/**
 * Retorna a aba PACIENTES_DEV.
 */
function Pacientes_getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_PACIENTES_DEV);

  if (!sheet) {
    throw new Error(
      'Aba "' + SHEET_PACIENTES_DEV + '" não encontrada na planilha DEV.'
    );
  }
  return sheet;
}

/**
 * Gera ID único do paciente.
 */
function Pacientes_generateId_() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const ms = String(now.getMilliseconds()).padStart(3, "0");

  return `PAC-${yyyy}-${mm}-${dd}-${hh}${mi}${ss}-${ms}`;
}
