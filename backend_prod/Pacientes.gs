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
 ******************************************************/

/**
 * Handler do módulo PACIENTES
 * Chamado pelo Api.gs → dispatchAction()
 */
function handlePacientesAction(action, payload) {
  try {
    switch (action) {
      case "pacientes-listar":
        return buildResponse(true, pacientesListar_(payload), []);

      case "pacientes-salvar":
        return buildResponse(true, pacientesSalvar_(payload), []);

      case "pacientes-obter":
        return buildResponse(true, pacientesObter_(payload), []);

      default:
        return buildResponse(false, null, [
          "Ação de pacientes desconhecida: " + action
        ]);
    }
  } catch (err) {
    return buildResponse(false, null, [
      "Erro interno em pacientes: " + err
    ]);
  }
}

/**
 * Lista pacientes na aba CONFIG.ABA_PACIENTES
 */
function pacientesListar_(body) {
  const sheet = getSheet_(CONFIG.ABA_PACIENTES);
  let pacientes = listAllRowsAsObjects_(sheet);

  const filtros = body.filtros || {};

  const busca = String(filtros.busca || filtros.Busca || "")
    .toLowerCase()
    .trim();

  let ativo = filtros.ativo || filtros.Ativo || "S";

  if (ativo && ativo !== "TODOS") {
    pacientes = pacientes.filter(p => {
      const val = String(p.Ativo || p.ativo || "S");
      return val === ativo;
    });
  }

  if (busca) {
    pacientes = pacientes.filter(p => {
      const nome = String(p.NomePaciente || p.NomeCompleto || p.nome || "").toLowerCase();
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
 * Salvar paciente
 */
function pacientesSalvar_(body) {
  const dados = body.dados || body.paciente || body || {};
  const sheet = getSheet_(CONFIG.ABA_PACIENTES);

  const idAtual =
    dados.ID_Paciente || dados.idPaciente || dados.IdPaciente || dados.id || "";

  const ehNovo = !idAtual;

  const extrasNovo = {};

  if (ehNovo) {
    extrasNovo.ID_Paciente = gerarId_();
    extrasNovo.DataCadastro = formatDate_(new Date());
    extrasNovo.Ativo = dados.Ativo || dados.ativo || "S";
  }

  const resultado = upsertRow_(
    sheet,
    "ID_Paciente",
    idAtual,
    dados,
    extrasNovo
  );

  const linha = resultado.row;

  const lastCol = sheet.getLastColumn();
  const header = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const valores = sheet.getRange(linha, 1, 1, lastCol).getValues()[0];

  const pacienteSalvo = rowToObject_(header, valores);

  return { paciente: pacienteSalvo };
}

/**
 * Obter paciente por ID
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
