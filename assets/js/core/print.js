/******************************************************
 * PRONTIO – print.js
 * Funções padronizadas para impressão de documentos
 * (receita, atestado, comparecimento, laudos etc.)
 *
 * Organização:
 * - PRONTIO.Print.imprimir(selector, options)
 * - PRONTIO.Print.receita()
 * - PRONTIO.Print.atestado()
 * - PRONTIO.Print.comparecimento()
 *
 * Compatibilidade:
 * - Mantém funções globais antigas:
 *   imprimeArea(), imprimeReceita(), imprimeAtestado(),
 *   imprimeComparecimento()
 ******************************************************/

window.PRONTIO = window.PRONTIO || {};
PRONTIO.Print = PRONTIO.Print || {};

/* ===============================================================
   FUNÇÃO PRINCIPAL
   =============================================================== */

PRONTIO.Print.imprimir = function (selector, options = {}) {
  const { titulo = "Documento", tipo = "" } = options;
  const elemento = document.querySelector(selector);

  if (!elemento) {
    PRONTIO.UI.showToast("Área de impressão não encontrada.", "erro");
    return;
  }

  // Configurações do médico salvas no sistema
  const cfg = PRONTIO.Storage.carregarConfigApp() || {};
  const nomeMedico = cfg.nomeMedico || "Dr. Nome do Médico";
  const crm = cfg.crm || "CRM-XX 0000";
  const clinica = cfg.clinica || "";
  const endereco = cfg.endereco || "";
  const telefone = cfg.telefone || "";

  const conteudo = elemento.innerHTML;

  const janela = window.open("", "_blank", "width=900,height=600");
  if (!janela) {
    PRONTIO.UI.showToast("Não foi possível abrir a janela de impressão.", "erro");
    return;
  }

  /* ============================================================
     HTML DA IMPRESSÃO
     ============================================================ */
  janela.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>${titulo}</title>

      <!-- Fonte Inter (Google Fonts) -->
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

      <style>
        body {
          margin: 1.5cm;
          font-family: 'Inter', system-ui, sans-serif;
          color: #000;
        }

        .print-header {
          text-align: center;
          margin-bottom: 1rem;
          padding-bottom: .6rem;
          border-bottom: 1px solid #ccc;
        }

        .print-header-nome {
          font-size: 1.15rem;
          font-weight: 700;
        }

        .print-header-sub {
          font-size: .9rem;
        }

        .print-title {
          text-align: center;
          font-size: 1.1rem;
          margin: 1.2rem 0;
          font-weight: 600;
          text-transform: uppercase;
        }

        .print-footer {
          margin-top: 2.5rem;
          text-align: center;
          font-size: .85rem;
          color: #555;
        }

        .print-container {
          width: 100%;
        }

        .no-print {
          display: none !important;
        }

        @page {
          size: A4;
          margin: 15mm;
        }
      </style>
    </head>

    <body>
      <div class="print-container">

        <header class="print-header">
          <div class="print-header-nome">${nomeMedico}</div>
          <div class="print-header-sub">CRM: ${crm}</div>
          ${clinica ? `<div class="print-header-sub">${clinica}</div>` : ""}
          ${endereco ? `<div class="print-header-sub">${endereco}</div>` : ""}
          ${telefone ? `<div class="print-header-sub">Tel: ${telefone}</div>` : ""}
        </header>

        <h1 class="print-title">${titulo}</h1>

        <main>${conteudo}</main>

        <footer class="print-footer">
          ${nomeMedico} – CRM ${crm}
        </footer>
      </div>

      <script>
        window.addEventListener('load', function(){
          window.print();
          setTimeout(() => window.close(), 200);
        });
      </script>

    </body>
    </html>
  `);

  janela.document.close();
};

/* ===============================================================
   ATALHOS ESPECÍFICOS POR TIPO DE DOCUMENTO
   =============================================================== */

PRONTIO.Print.receita = function (selector = "#previewReceita") {
  PRONTIO.Print.imprimir(selector, {
    titulo: "Receita Médica",
    tipo: "receita",
  });
};

PRONTIO.Print.atestado = function (selector = "#area-atestado") {
  PRONTIO.Print.imprimir(selector, {
    titulo: "Atestado Médico",
    tipo: "atestado",
  });
};

PRONTIO.Print.comparecimento = function (selector = "#area-comparecimento") {
  PRONTIO.Print.imprimir(selector, {
    titulo: "Declaração de Comparecimento",
    tipo: "comparecimento",
  });
};

/* ===============================================================
   WRAPPERS DE COMPATIBILIDADE (código antigo continua funcionando)
   =============================================================== */

window.imprimeArea = PRONTIO.Print.imprimir;
window.imprimeReceita = PRONTIO.Print.receita;
window.imprimeAtestado = PRONTIO.Print.atestado;
window.imprimeComparecimento = PRONTIO.Print.comparecimento;
