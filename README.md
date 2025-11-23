# PRONTIO – Sistema de Consultório Médico

Bem-vindo ao **PRONTIO**, um sistema web profissional para consultório médico focado em organização, agilidade e baixo custo. Desenvolvido inicialmente para uso em consultório individual, o PRONTIO foi estruturado para escalar futuramente para múltiplos profissionais.

---

## 📌 Sumário

* [Visão Geral](#visão-geral)
* [Principais Funcionalidades](#principais-funcionalidades)
* [Tecnologias Utilizadas](#tecnologias-utilizadas)
* [Arquitetura do Sistema](#arquitetura-do-sistema)
* [Estrutura de Pastas](#estrutura-de-pastas)
* [Guia de Desenvolvimento](#guia-de-desenvolvimento)
* [PWA (Progressive Web App)](#pwa-progressive-web-app)
* [Integração com Google Sheets](#integração-com-google-sheets)
* [Fluxo Git Profissional](#fluxo-git-profissional)
* [Deploy](#deploy)
* [Licença](#licença)

---

## 📖 Visão Geral

O **PRONTIO** foi criado para trazer uma solução simples e eficiente para o consultório médico, permitindo:

* Gestão completa de pacientes
* Agenda diária e semanal
* Emissão de documentos (atestado, receita, laudo, exames etc.)
* Evolução clínica e prontuário estruturado
* Integração com Google Sheets
* Funcionalidade de PWA (instalável)

---

## 🩺 Principais Funcionalidades

* Cadastro e gerenciamento de pacientes
* Agenda médica por dia e semana
* Emissão de documentos profissionais em PDF:

  * Receita
  * Atestado
  * Declaração de comparecimento
  * Encaminhamento
  * SADT / Internação
  * Exames
  * Laudos
* Evolução clínica com histórico em timeline
* Prontuário estruturado por tipos de registro
* Modo PWA (instalação no celular ou desktop)

---

## 🛠️ Tecnologias Utilizadas

* **HTML5**, **CSS3**, **JavaScript Puro**
* **Google Sheets + Apps Script** como backend
* Estrutura modular por telas (views)
* PWA com:

  * `manifest.json`
  * `service-worker.js`
* GitFlow simplificado: `main` (produção) e `dev` (desenvolvimento)

---

## 🏗️ Arquitetura do Sistema

A arquitetura é dividida em três camadas principais:

### 1. **Frontend**

* Views HTML independentes
* Componentes globais (topbar, sidebar, cartões, forms)
* CSS dividido em:

  * base (global, variables, utilities)
  * layout (app, grid, sidebar)
  * módulos (agenda.css, pacientes.css etc.)

### 2. **Lógica do Cliente (JavaScript)**

* `/assets/js/core/` → scripts globais
* `/assets/js/modules/` → scripts específicos de cada tela

### 3. **Backend (Google Apps Script)**

* Scripts no diretório `/backend/`
* Conexão via rotas simples REST

---

## 📁 Estrutura de Pastas

```text
/prontio/
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
│   ├── guia-visual.html
│   └── partials/
│       └── sidebar.html
│
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   ├── layout.css
│   │   ├── components.css
│   │   ├── forms.css
│   │   ├── dark-mode.css
│   │   └── modules/
│   │       ├── pacientes.css
│   │       ├── agenda.css
│   │       ...
│   ├── js/
│   │   ├── core/
│   │   │   ├── script.js
│   │   │   ├── layout.js
│   │   │   ├── sidebar-loader.js
│   │   │   ├── utils.js
│   │   │   └── api.js
│   │   └── modules/
│   │       ├── pacientes.js
│   │       ├── receita.js
│   │       ...
│   └── img/
│       └── icons/
│           ├── icon-192.png
│           └── icon-512.png
│
├── backend/ (Google Apps Script)
├── pwa/
│   ├── manifest.json
│   └── service-worker.js
└── README.md
```

---

## 💻 Guia de Desenvolvimento

### ⭐ Requisitos:

* VSCode
* Extensão Live Server (ou outro servidor estático)
* Git instalado
* Navegador moderno
* Google Apps Script para backend

### ⭐ Rodar localmente:

1. Abra o VSCode na pasta do projeto
2. Execute o Live Server
3. Acesse:

```
http://localhost:5500/views/atendimento.html
```

### ⭐ Fluxo de commits:

Sempre trabalhar na branch `dev`:

```
git add .
git commit -m "descrição"
git push
```

Quando quiser publicar para produção:

```
git checkout main
git merge dev
git push
```

---

## 📲 PWA (Progressive Web App)

O PRONTIO funciona como app instalável no celular e desktop.

Elementos necessários:

* `/pwa/manifest.json`
* `/pwa/service-worker.js`
* `<meta name="theme-color">`
* `<link rel="manifest">`

Ambos já estão implementados.

---

## 🔗 Integração com Google Sheets

Toda persistência é feita via Apps Script (`/backend`).
O fluxo básico é:

* Frontend → fetch → WebApp do Apps Script
* Apps Script processa
* Google Sheets salva ou recupera dados

Cada módulo possui seu próprio arquivo `.gs`.

---

## 🧩 Fluxo Git Profissional

Branches principais:

```
main → produção
dev  → desenvolvimento
```

Trabalho diário sempre na `dev`.
Merge para produção apenas quando estável.

---

## 🚀 Deploy

Pode ser feito via:

* GitHub Pages
* Cloudflare Pages (recomendado)
* HostGator

Veja `docs/guia-deploy.md`.

---

## 📄 Licença

Projeto inicialmente privado e de uso interno do consultório médico.

---

Se precisar gerar **documentação avançada**, **guia de componentes**, **manual do médico** ou **manual do administrador**, posso criar automaticamente.
