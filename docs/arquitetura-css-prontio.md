# Arquitetura de CSS – PRONTIO  
Guia oficial de organização visual do sistema PRONTIO.

---

## 🎯 Objetivo

Manter um padrão de CSS:

- organizado  
- escalável  
- fácil de manter  
- com módulos independentes  
- com layout consistente  
- sem repetição  

Toda a interface do PRONTIO segue o modelo:

**Base → Layout → Componentes → Formulários → Módulos → Tema → Impressão**

---

# 1. 📁 Estrutura de pastas (atual, correta e final)



```text
assets/
  css/
    global.css
    layout.css
    variables.css
    utilities.css
    animations.css
    components.css
    menu.css
    index.css
    dark-mode.css
    print.css
    main.css

    modules/
      agenda.css
      evolucao.css
      pacientes.css
      receita.css
      exames.css
      laudo.css
      atestado.css
      comparecimento.css
      sadt.css
      consentimento.css
      prontuario.css
    */


---


❗ **Importante:**  
A pasta **fonts/** NÃO existe mais → PRONTIO usa **Google Fonts (Inter)** diretamente no HTML.

---

# 2. 🔹 Função exata de cada arquivo CSS

## 🌐 **global.css**  
Base global do sistema:
- reset moderno  
- fontes (Inter – via Google Fonts, declarada no HTML)  
- scrollbars  
- acessibilidade (focus-visible)  
- helpers genéricos  
- estilos universais  

👉 **Nunca colocar regras específicas de página aqui.**

---

## 🎛 **variables.css**  
Define todos os tokens do sistema em `:root`:

- cores (`--color-primary`, `--color-text`, etc.)  
- espaçamentos  
- tamanho de fontes  
- radius  
- sombras  

👉 **Nenhum estilo, apenas variáveis.**

---

## 🔧 **utilities.css**  
Classes utilitárias pequenas, ex.:

- `.flex`, `.grid`, `.inline-flex`  
- `.gap-sm`, `.mt-2`, `.px-3`  
- `.text-center`, `.nowrap`

👉 Apenas utilidades atômicas.

---

## ✨ **animations.css**  
Onde ficam:

- `@keyframes`  
- `.animate-fade`  
- `.animate-slide-up`

👉 Exclusivo para animações.

---

## 📐 **layout.css**  
Controle total da estrutura visual:

- `.app`  
- `.app-sidebar`, `.app-menu`, `.app-menu-item`  
- `.app-content`, `.app-content-inner`  
- `.page-title`, `.page-section`, `.page-grid`  
- responsividade geral  

👉 Não incluir componentes específicos aqui.  
👉 Este arquivo é a “espinha dorsal” visual do PRONTIO.

---

## 🧩 **components.css**  
Componentes reutilizáveis:

- botões (`.btn`, `.btn--primary`, `.btn--outline`)  
- cards  
- tabelas  
- badges  
- modais  
- chips  
- tags  

👉 Se um estilo se repete em mais de uma página, ele deve vir para este arquivo.

---

## 📝 **forms.css**  
Tudo relacionado a formulário:

- `.campo`  
- `<input>`, `<select>`, `<textarea>`  
- `.grid-2`, `.grid-3`  
- campos de erro  
- labels  

👉 Não incluir layout global ou componentes aqui.

---

## 🌙 **dark-mode.css**  
Overrides específicos quando a classe:

```html
<body class="theme-dark">
