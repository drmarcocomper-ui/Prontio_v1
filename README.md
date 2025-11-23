# PRONTIO – Sistema de Consultório Médico

PRONTIO é um sistema web para uso em consultório médico, inicialmente pensado para um único médico (Dr. Marco Antônio Comper), com possibilidade de expansão futura.

O foco é ser simples, leve e de baixo custo, utilizando:

- HTML, CSS e JavaScript puro  
- Google Apps Script + Google Sheets como “backend” inicial  
- Estrutura modular por páginas (pacientes, agenda, evolução, documentos, etc.)

---

## 1. Estrutura de Pastas

```text
/
├── index.html (opcional, dependendo do deploy)
├── manifest.json
├── service-worker.js
├── views/
│   ├── atendimento.html
│   ├── pacientes.html
│   ├── agenda.html
│   ├── evolucao.html
│   ├── receita.html
│   ├── exames.html
│   ├── laudo.html
│   ├── atestado.html
│   ├── comparecimento.html
│   ├── encaminhamento.html
│   ├── consentimento.html
│   ├── sadt.html
│   ├── prontuario.html
│   └── guia-visual.html
└── assets/
    ├── css/
    │   ├── main.css
    │   ├── layout.css
    │   ├── forms.css
    │   ├── components.css
    │   └── modules/
    │       ├── pacientes.css
    │       ├── agenda.css
    │       ├── evolucao.css
    │       ├── receita.css
    │       ├── exames.css
    │       ├── laudo.css
    │       ├── atestado.css
    │       ├── comparecimento.css
    │       ├── sadt.css
    │       └── prontuario.css
    ├── js/
    │   ├── core/
    │   │   ├── script.js
    │   │   ├── api.js
    │   │   ├── utils.js
    │   │   ├── layout.js
    │   │   ├── print.js
    │   │   └── sidebar-loader.js
    │   └── modules/
    │       ├── pacientes.js
    │       ├── agenda.js
    │       ├── evolucao.js
    │       ├── receita.js
    │       ├── exames.js
    │       ├── laudo.js
    │       ├── atestado.js
    │       ├── comparecimento.js
    │       ├── encaminhamento.js
    │       ├── consentimento.js
    │       ├── sadt.js
    │       └── prontuario.js
    └── img/
        └── icons/
            ├── icon-192.png
            └── icon-512.png
