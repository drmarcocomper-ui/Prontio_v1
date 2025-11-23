/******************************************************
 * PRONTIO – sidebar-loader.js
 * Carrega automaticamente a sidebar.html em todas as views
 ******************************************************/

window.PRONTIO = window.PRONTIO || {};

(function () {

  function carregarSidebar() {
    const sidebarDiv = document.getElementById("sidebar");

    if (!sidebarDiv) return; // página sem sidebar

    // Detecta caminho correto automaticamente
    const basePath = window.location.pathname.includes("/views/")
      ? "partials/sidebar.html"
      : "views/partials/sidebar.html";

    fetch(basePath)
      .then(res => res.text())
      .then(html => {
        sidebarDiv.innerHTML = html;

        // Inicializar comportamento do menu
        if (window.PRONTIO && PRONTIO.Menu && PRONTIO.Menu.init) {
          PRONTIO.Menu.init();
        }
      })
      .catch(err => console.error("Erro ao carregar sidebar:", err));
  }

  document.addEventListener("DOMContentLoaded", carregarSidebar);

})();
