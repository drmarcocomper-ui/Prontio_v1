/* ==========================================================
   LAYOUT.JS - COMPORTAMENTOS GERAIS DO PRONTIO
   - Sidebar desktop (colapsável)
   - Sidebar mobile (drawer deslizante)
   - Backdrop do menu mobile
   - Lembrar estado no localStorage (desktop)
   - Sombra da topbar ao rolar
   - Menu do usuário (avatar)
   - Helper de busca global
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initSidebarStateDesktop();
    initSidebarMobileToggle();
    initSidebarBackdrop();
    initTopbarScrollEffect();
    initUserDropdown();
    initTopbarSearchHelper();
});

/* ----------------------------------------------------------
   1) SIDEBAR – ESTADO DESKTOP (COLLAPSED)
   ---------------------------------------------------------- */

function initSidebarStateDesktop() {
    const body = document.body;
    const STORAGE_KEY = "prontio_sidebar_state";

    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === "collapsed") {
            body.classList.add("sidebar-collapsed");
        }
    } catch (e) {
        console.warn("LocalStorage não disponível:", e);
    }

    // Botão de colapsar no desktop
    const btn = document.getElementById("btnToggleSidebar");
    if (!btn) return;

    btn.addEventListener("click", () => {
        body.classList.toggle("sidebar-collapsed");

        try {
            const collapsed = body.classList.contains("sidebar-collapsed");
            localStorage.setItem(STORAGE_KEY, collapsed ? "collapsed" : "expanded");
        } catch (e) {
            console.warn("Não foi possível salvar estado no localStorage.", e);
        }
    });
}

/* ----------------------------------------------------------
   2) SIDEBAR – MOBILE (DRAWER)
   ---------------------------------------------------------- */

function initSidebarMobileToggle() {
    const toggleButtons = document.querySelectorAll(".app-sidebar-toggle");
    const body = document.body;
    const mq = window.matchMedia("(max-width: 768px)");

    function closeOnDesktop() {
        if (!mq.matches) {
            body.classList.remove("sidebar-open");
        }
    }

    mq.addEventListener("change", closeOnDesktop);
    closeOnDesktop();

    toggleButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            if (!mq.matches) return;  // só funciona no mobile
            body.classList.toggle("sidebar-open");
        });
    });

    // Fecha ao clicar em um link da sidebar
    document.addEventListener("click", (ev) => {
        if (!mq.matches) return;
        if (ev.target.closest("#sidebar a")) {
            body.classList.remove("sidebar-open");
        }
    });
}

/* ----------------------------------------------------------
   3) BACKDROP DO SIDEBAR MOBILE
   ---------------------------------------------------------- */

function initSidebarBackdrop() {
    const backdrop = document.getElementById("sidebarBackdrop");
    if (!backdrop) return;

    const body = document.body;
    const mq = window.matchMedia("(max-width: 768px)");

    backdrop.addEventListener("click", () => {
        if (!mq.matches) return;
        body.classList.remove("sidebar-open");
    });
}

/* ----------------------------------------------------------
   4) TOPBAR – SOMBRA AO ROLAR
   ---------------------------------------------------------- */

function initTopbarScrollEffect() {
    const topbar = document.querySelector(".topbar");
    if (!topbar) return;

    function applyShadow() {
        if (window.scrollY > 2) topbar.classList.add("topbar-scrolled");
        else topbar.classList.remove("topbar-scrolled");
    }

    applyShadow();
    window.addEventListener("scroll", applyShadow);
}

/* ----------------------------------------------------------
   5) DROPDOWN DO USUÁRIO (AVATAR)
   ---------------------------------------------------------- */

function initUserDropdown() {
    const btnUserMenu = document.getElementById("btnUserMenu");
    const dropdown = document.getElementById("userDropdown");

    if (!btnUserMenu || !dropdown) return;

    btnUserMenu.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target) && e.target !== btnUserMenu) {
            dropdown.classList.remove("open");
        }
    });

    dropdown.addEventListener("click", (ev) => {
        const item = ev.target.closest(".dropdown-item");
        if (!item) return;
        handleUserMenuAction(item.dataset.action);
    });
}

function handleUserMenuAction(action) {
    switch (action) {
        case "perfil":
            alert("Navegar para o Perfil (implementar rota)");
            break;
        case "config":
            alert("Navegar para Configurações (implementar rota)");
            break;
        case "sair":
            if (confirm("Deseja realmente sair do PRONTIO?")) {
                alert("Logout ainda não implementado.");
            }
            break;
        default:
            console.warn("Ação desconhecida:", action);
    }
}

/* ----------------------------------------------------------
   6) HELPER DE BUSCA NA TOPBAR
   ---------------------------------------------------------- */

function initTopbarSearchHelper() {
    const input = document.getElementById("topbarSearchInput");
    if (!input) return;

    input.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();

        const term = input.value.trim();
        if (!term) return;

        alert(
            "Busca global: \"" + term + "\".\n" +
            "A lógica real deve ser implementada pelo módulo atual (agenda, pacientes etc.)."
        );
    });
}
