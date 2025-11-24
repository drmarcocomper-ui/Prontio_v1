/******************************************************
 * PRONTIO – Styleguide / Design Tokens (Frontend)
 * Caminho: /assets/js/modulares/styleguide.js
 *
 * Objetivos:
 *  - Centralizar tokens de design (cores, fontes, espaçamentos)
 *  - Expor utilitários em PRONTIO.STYLEGUIDE
 *  - Opcionalmente montar um painel flutuante
 *    de visualização do style guide em ambiente de DEV.
 *
 * Como usar:
 *  - Acesso aos tokens:
 *      const tokens = PRONTIO.STYLEGUIDE.getTokens();
 *  - Log rápido no console:
 *      PRONTIO.STYLEGUIDE.logTokens();
 *  - Forçar exibição do painel:
 *      PRONTIO.STYLEGUIDE.createDebugPanel();
 *
 * Ativação automática do painel:
 *  - Query string:  ?styleguide=1
 *  - Ou no HTML:    <body data-styleguide="1">
 ******************************************************/

(function () {
  "use strict";

  // Garante namespace global PRONTIO
  window.PRONTIO = window.PRONTIO || {};
  PRONTIO.STYLEGUIDE = PRONTIO.STYLEGUIDE || {};

  /**
   * Lê uma CSS custom property do :root.
   * Ex.: var(--cor-primaria)
   */
  function getCssVarValue(name, fallback) {
    try {
      const root = document.documentElement;
      const val = getComputedStyle(root).getPropertyValue(name).trim();
      return val || fallback;
    } catch (e) {
      return fallback;
    }
  }

  /**
   * Retorna o objeto de tokens de design padronizado
   * para o PRONTIO.
   */
  function getTokens() {
    // Cores principais (tenta ler variáveis do CSS, senão usa defaults)
    const colors = {
      primary: getCssVarValue("--color-primary", "#4b6fff"),
      primaryHover: getCssVarValue("--color-primary-hover", "#3b5ae6"),
      primarySoft: getCssVarValue("--color-primary-soft", "#e0e7ff"),

      background: getCssVarValue("--color-background", "#f4f4f8"),
      surface: getCssVarValue("--color-surface", "#ffffff"),

      text: getCssVarValue("--color-text", "#111827"),
      textSecondary: getCssVarValue("--color-text-secondary", "#4b5563"),
      textMuted: getCssVarValue("--color-text-muted", "#9ca3af"),

      border: getCssVarValue("--color-border", "#e5e7eb"),

      success: getCssVarValue("--color-success", "#16a34a"),
      warning: getCssVarValue("--color-warning", "#f59e0b"),
      danger: getCssVarValue("--color-danger", "#dc2626"),
      info: getCssVarValue("--color-info", "#0ea5e9")
    };

    // Tipografia
    const typography = {
      fontFamilyBase:
        getCssVarValue("--font-family-base", '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'),
      fontSizeBase: getCssVarValue("--font-size-base", "14px"),
      lineHeightBase: getCssVarValue("--line-height-base", "1.5"),

      // Escala sugerida
      scale: {
        xs: "12px",
        sm: "13px",
        base: "14px",
        md: "15px",
        lg: "16px",
        xl: "18px",
        "2xl": "20px",
        "3xl": "24px"
      }
    };

    // Espaçamentos
    const spacing = {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      "2xl": 32
    };

    // Border radius
    const radius = {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      pill: 9999
    };

    // Elevation
    const elevation = {
      none: "none",
      sm: "0 1px 2px rgba(0,0,0,0.06)",
      md: "0 2px 8px rgba(15,23,42,0.08)",
      lg: "0 8px 20px rgba(15,23,42,0.12)"
    };

    return {
      colors,
      typography,
      spacing,
      radius,
      elevation
    };
  }

  /**
   * Log rápido de tokens no console para debug.
   */
  function logTokens() {
    const tokens = getTokens();
    // Agrupamento bonito no console
    if (console && console.groupCollapsed) {
      console.groupCollapsed("🎨 PRONTIO – Design Tokens");
      console.log("Colors:", tokens.colors);
      console.log("Typography:", tokens.typography);
      console.log("Spacing:", tokens.spacing);
      console.log("Radius:", tokens.radius);
      console.log("Elevation:", tokens.elevation);
      console.groupEnd();
    } else {
      console.log("PRONTIO – Design Tokens:", tokens);
    }
  }

  /**
   * Cria um painel flutuante de style guide
   * (somente para ambiente de desenvolvimento).
   */
  function createDebugPanel() {
    // Evita duplicar
    if (document.getElementById("prontio-styleguide-panel")) {
      return;
    }

    const tokens = getTokens();

    const panel = document.createElement("div");
    panel.id = "prontio-styleguide-panel";
    panel.setAttribute("aria-label", "PRONTIO Styleguide Panel");
    panel.style.position = "fixed";
    panel.style.right = "16px";
    panel.style.bottom = "16px";
    panel.style.width = "320px";
    panel.style.maxHeight = "70vh";
    panel.style.zIndex = "9999";
    panel.style.background = tokens.colors.surface;
    panel.style.borderRadius = tokens.radius.lg + "px";
    panel.style.boxShadow = tokens.elevation.lg;
    panel.style.fontFamily = tokens.typography.fontFamilyBase;
    panel.style.fontSize = tokens.typography.fontSizeBase;
    panel.style.color = tokens.colors.text;
    panel.style.display = "flex";
    panel.style.flexDirection = "column";
    panel.style.overflow = "hidden";

    // Cabeçalho
    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.justifyContent = "space-between";
    header.style.padding = "8px 12px";
    header.style.background = tokens.colors.primary;
    header.style.color = "#ffffff";

    const title = document.createElement("div");
    title.textContent = "PRONTIO – Styleguide";
    title.style.fontWeight = "600";
    title.style.fontSize = "13px";

    const headerButtons = document.createElement("div");
    headerButtons.style.display = "flex";
    headerButtons.style.gap = "4px";

    const btnLog = document.createElement("button");
    btnLog.textContent = "{}";
    btnLog.title = "Log tokens no console";
    btnLog.style.border = "none";
    btnLog.style.background = "rgba(15,23,42,0.2)";
    btnLog.style.color = "#fff";
    btnLog.style.borderRadius = "999px";
    btnLog.style.width = "22px";
    btnLog.style.height = "22px";
    btnLog.style.cursor = "pointer";
    btnLog.style.fontSize = "11px";
    btnLog.addEventListener("click", logTokens);

    const btnClose = document.createElement("button");
    btnClose.textContent = "✕";
    btnClose.title = "Fechar painel";
    btnClose.style.border = "none";
    btnClose.style.background = "transparent";
    btnClose.style.color = "#fff";
    btnClose.style.borderRadius = "999px";
    btnClose.style.width = "22px";
    btnClose.style.height = "22px";
    btnClose.style.cursor = "pointer";
    btnClose.style.fontSize = "12px";
    btnClose.addEventListener("click", () => {
      panel.remove();
    });

    headerButtons.appendChild(btnLog);
    headerButtons.appendChild(btnClose);
    header.appendChild(title);
    header.appendChild(headerButtons);

    // Conteúdo
    const content = document.createElement("div");
    content.style.padding = "10px 12px 12px";
    content.style.overflowY = "auto";

    // Secção de cores
    const colorsSection = document.createElement("div");
    const colorsTitle = document.createElement("h3");
    colorsTitle.textContent = "Cores";
    colorsTitle.style.fontSize = "12px";
    colorsTitle.style.textTransform = "uppercase";
    colorsTitle.style.letterSpacing = "0.06em";
    colorsTitle.style.color = tokens.colors.textSecondary;
    colorsTitle.style.margin = "0 0 6px";

    const colorsGrid = document.createElement("div");
    colorsGrid.style.display = "grid";
    colorsGrid.style.gridTemplateColumns = "repeat(3, minmax(0, 1fr))";
    colorsGrid.style.gap = "6px";

    Object.entries(tokens.colors).forEach(([key, value]) => {
      const item = document.createElement("div");
      item.style.display = "flex";
      item.style.flexDirection = "column";
      item.style.gap = "3px";

      const swatch = document.createElement("div");
      swatch.style.height = "26px";
      swatch.style.borderRadius = "8px";
      swatch.style.border = "1px solid rgba(15,23,42,0.08)";
      swatch.style.background = value;

      const label = document.createElement("div");
      label.textContent = key;
      label.style.fontSize = "11px";
      label.style.color = tokens.colors.textSecondary;
      label.style.whiteSpace = "nowrap";
      label.style.overflow = "hidden";
      label.style.textOverflow = "ellipsis";

      item.appendChild(swatch);
      item.appendChild(label);
      colorsGrid.appendChild(item);
    });

    colorsSection.appendChild(colorsTitle);
    colorsSection.appendChild(colorsGrid);

    // Secção tipografia
    const typoSection = document.createElement("div");
    typoSection.style.marginTop = "10px";

    const typoTitle = document.createElement("h3");
    typoTitle.textContent = "Tipografia";
    typoTitle.style.fontSize = "12px";
    typoTitle.style.textTransform = "uppercase";
    typoTitle.style.letterSpacing = "0.06em";
    typoTitle.style.color = tokens.colors.textSecondary;
    typoTitle.style.margin = "0 0 6px";

    const typoBody = document.createElement("div");
    typoBody.style.fontSize = tokens.typography.fontSizeBase;
    typoBody.style.lineHeight = tokens.typography.lineHeightBase;
    typoBody.style.fontFamily = tokens.typography.fontFamilyBase;
    typoBody.style.color = tokens.colors.textSecondary;

    typoBody.innerHTML =
      "<div style='font-size:13px;margin-bottom:4px;'>Fonte base: <strong>" +
      tokens.typography.fontFamilyBase +
      "</strong></div>" +
      "<div style='font-size:12px;'>Tamanho base: " +
      tokens.typography.fontSizeBase +
      " • Line-height: " +
      tokens.typography.lineHeightBase +
      "</div>";

    typoSection.appendChild(typoTitle);
    typoSection.appendChild(typoBody);

    // Pequena legenda de espaçamentos
    const spacingSection = document.createElement("div");
    spacingSection.style.marginTop = "10px";

    const spacingTitle = document.createElement("h3");
    spacingTitle.textContent = "Spacing (px)";
    spacingTitle.style.fontSize = "12px";
    spacingTitle.style.textTransform = "uppercase";
    spacingTitle.style.letterSpacing = "0.06em";
    spacingTitle.style.color = tokens.colors.textSecondary;
    spacingTitle.style.margin = "0 0 6px";

    const spacingBody = document.createElement("div");
    spacingBody.style.display = "flex";
    spacingBody.style.flexWrap = "wrap";
    spacingBody.style.gap = "6px";

    Object.entries(tokens.spacing).forEach(([key, val]) => {
      const chip = document.createElement("div");
      chip.textContent = `${key}: ${val}`;
      chip.style.fontSize = "11px";
      chip.style.padding = "2px 6px";
      chip.style.borderRadius = "999px";
      chip.style.border = "1px solid " + tokens.colors.border;
      chip.style.background = tokens.colors.background;
      chip.style.color = tokens.colors.textSecondary;
      spacingBody.appendChild(chip);
    });

    spacingSection.appendChild(spacingTitle);
    spacingSection.appendChild(spacingBody);

    content.appendChild(colorsSection);
    content.appendChild(typoSection);
    content.appendChild(spacingSection);

    panel.appendChild(header);
    panel.appendChild(content);

    document.body.appendChild(panel);
  }

  /**
   * Detecta se o styleguide deve ser exibido automaticamente:
   * - URL contém ?styleguide=1
   * - OU body tem data-styleguide="1"
   */
  function shouldAutoInit() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("styleguide") === "1") return true;
    } catch (e) {
      // ignora
    }

    const body = document.body;
    if (!body) return false;
    const attr = body.getAttribute("data-styleguide");
    return attr === "1" || attr === "true";
  }

  /**
   * Inicialização automática após DOM pronto
   * (apenas se o modo DEV estiver ativado).
   */
  function autoInit() {
    if (!shouldAutoInit()) return;
    createDebugPanel();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
  } else {
    autoInit();
  }

  // Expõe API pública no namespace PRONTIO.STYLEGUIDE
  PRONTIO.STYLEGUIDE.getTokens = getTokens;
  PRONTIO.STYLEGUIDE.logTokens = logTokens;
  PRONTIO.STYLEGUIDE.createDebugPanel = createDebugPanel;
})();
