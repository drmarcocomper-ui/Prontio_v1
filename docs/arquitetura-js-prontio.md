# Arquitetura de JavaScript – PRONTIO  
Guia oficial de organização do código JS do sistema PRONTIO.

---

## 🎯 Objetivo

Manter um JavaScript:

- modular  
- limpo  
- escalável  
- seguro  
- fácil de manter  
- sem variáveis globais soltas  

Toda a estrutura gira em torno de um único namespace global:

window.PRONTIO = {};

arduino
Copiar código

Nele organizamos cada camada do sistema:

PRONTIO.Config
PRONTIO.API
PRONTIO.Storage
PRONTIO.UI
PRONTIO.Forms
PRONTIO.Utils
PRONTIO.Modules
PRONTIO.App

yaml
Copiar código

---

# 1. 📁 Estrutura de pastas

assets/
js/
script.js ← núcleo do PRONTIO
api.js ← comunicação com Apps Script
utils.js ← funções auxiliares
menu.js ← comportamento do menu lateral
print.js ← impressão de documentos

diff
Copiar código
index.js          ← módulo Atendimento
agenda.js         ← módulo Agenda
pacientes.js      ← módulo Pacientes
evolucao.js       ← módulo Evolução
receita.js        ← módulo Receita
exames.js         ← módulo Exames
laudo.js          ← módulo Laudo
atestado.js       ← módulo Atestado
comparecimento.js ← módulo Comparecimento
sadt.js           ← módulo SADT
consentimento.js  ← módulo Consentimento
prontuario.js     ← módulo Prontuário
yaml
Copiar código

> Cada página HTML chama **somente seu módulo específico**, além dos scripts base.

---

# 2. 🧠 script.js — Núcleo do PRONTIO

Responsável por:

### ✔ Criar o namespace PRONTIO  
### ✔ Carregar configurações (SCRIPT_URL)  
### ✔ `PRONTIO.API.call()` — chamada padronizada ao Apps Script  
### ✔ `PRONTIO.UI` — toasts, loading  
### ✔ `PRONTIO.Storage` — paciente e configs  
### ✔ `PRONTIO.Forms` — utilitários de formulário  
### ✔ `PRONTIO.Utils` — datas, máscaras, tabelas, números  
### ✔ Inicializador global:

```js
document.addEventListener("DOMContentLoaded", () => {
  PRONTIO.App.init();
});
3. 🌐 api.js — Comunicação com o Backend
Contém chamadas padronizadas ao Apps Script:

Copiar código
PRONTIO.API.Pacientes
PRONTIO.API.Agenda
PRONTIO.API.Evolucao
PRONTIO.API.Receita
PRONTIO.API.Exames
PRONTIO.API.Laudos
PRONTIO.API.Atestados
PRONTIO.API.Comparecimento
PRONTIO.API.SADT
PRONTIO.API.Consentimento
Cada serviço usa:

js
Copiar código
PRONTIO.API.call({
  action: "pacientes-listar",
  filtros: { ativo: "S" }
});
4. 📌 utils.js — Funções auxiliares
Organizado em módulos internos:

Copiar código
PRONTIO.Utils.Datas
PRONTIO.Utils.Mascaras
PRONTIO.Utils.Tabelas
PRONTIO.Utils.Numero
Exemplos:

formatar datas

calcular idade

máscara de telefone / CPF

montar tabelas

parse seguro de números

Nenhuma dessas funções acessa DOM ou API — são puras.

5. 🧩 menu.js — Navegação e comportamento da sidebar
Responsável por:

identificar página ativa

destacar item do menu automaticamente

controlar sidebar em mobile

Usando:

js
Copiar código
PRONTIO.Menu.marcarAtivo();
6. 🖨 print.js — Impressão
Centraliza toda impressão do sistema:

scss
Copiar código
PRONTIO.Print.imprimir(selector)
PRONTIO.Print.receita()
PRONTIO.Print.atestado()
PRONTIO.Print.comparecimento()
Posicionamento, margens, cabeçalho do médico e PDF.

7. 📦 Módulos por página
Cada arquivo é responsável somente pela sua tela.

Estrutura padrão:

js
Copiar código
window.PRONTIO = window.PRONTIO || {};
PRONTIO.Modules = PRONTIO.Modules || {};

PRONTIO.Modules.Receita = {
  init() {
    console.log("Tela de Receita carregada");
    // ...
  }
};
Inicialização automática
Cada página HTML contém:

html
Copiar código
<body data-page="receita">
O script.js lê:

js
Copiar código
PRONTIO.App.init = function() {
  const page = document.body.dataset.page;

  if (page && PRONTIO.Modules[ capitalize(page) ]) {
      PRONTIO.Modules[ capitalize(page) ].init();
  }
};
Assim, cada módulo roda somente na página correta.

8. 🧵 Convenções oficiais de código
✔ Nunca usar funções globais
Sempre dentro de:

Copiar código
PRONTIO.*
✔ Nunca usar fetch() diretamente
Use:

scss
Copiar código
PRONTIO.API.call()
✔ Nunca manipular localStorage diretamente
Use:

pgsql
Copiar código
PRONTIO.Storage.*
✔ Nunca repetir funções em módulos
Se repete → mover para utils.js.

✔ Nunca acessar DOM antes do DOMContentLoaded.
✔ Um módulo JS não pode influenciar outro módulo.
9. 🧱 Padrão de nomenclatura
Arquivos:
Copiar código
agenda.js
pacientes.js
receita.js
Namespace:
Copiar código
PRONTIO.Modules.Agenda
PRONTIO.Modules.Pacientes
PRONTIO.Modules.Receita
Funções internas:
camelCase

scss
Copiar código
carregarAgenda()
salvarPaciente()
montarLinha()
10. 🚀 Fluxo de inicialização do PRONTIO
script.js carrega e cria o namespace

API / Utils / UI / Storage são montados

DOMContentLoaded dispara

PRONTIO.App.init() roda

Identifica página via data-page

Chama o módulo específico

Módulo monta UI e carrega dados

11. 💡 Exemplo de módulo PRONTIO completo
js
Copiar código
PRONTIO.Modules.Atestado = {
  init() {
    this.carregarPaciente();
    this.registrarEventos();
  },

  carregarPaciente() {
    const p = PRONTIO.Storage.carregarPacienteSelecionado();
    if (!p) return;
    document.getElementById("pacienteNome").textContent = p.nome;
  },

  registrarEventos() {
    document.getElementById("btnSalvarAtestado")
      .addEventListener("click", () => this.salvar());
  },

  async salvar() {
    const dados = {
      ID_Paciente: PRONTIO.Storage.carregarPacienteSelecionado().id,
      TextoAtestado: document.getElementById("atestadoTexto").value
    };

    await PRONTIO.API.Atestados.salvar(dados);
    PRONTIO.UI.showToast("Atestado salvo!", "sucesso");
  }
};
🎉 Resultado Final
Com essa arquitetura:

O PRONTIO tem JS modular e robusto

O backend e frontend se comunicam perfeitamente

Bugs diminuem drasticamente

Código fica fácil de manter por anos

Novas telas podem ser adicionadas rapidamente

Este arquivo é a documentação OFICIAL da arquitetura JavaScript PRONTIO.



---


