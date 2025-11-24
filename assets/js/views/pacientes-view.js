// assets/js/views/pacientes-view.js
// Inicializador oficial do módulo de Pacientes para a view "/views/pacientes"

document.addEventListener("DOMContentLoaded", () => {
  try {
    // Preferencial: namespace PRONTIO
    if (window.PRONTIO && PRONTIO.Modules && PRONTIO.Modules.Pacientes && typeof PRONTIO.Modules.Pacientes.init === "function") {
      PRONTIO.Modules.Pacientes.init();
      console.log("PRONTIO :: Pacientes inicializado (PRONTIO.Modules.Pacientes.init()).");
      return;
    }

    // Fallback: wrapper global
    if (window.Pacientes && typeof window.Pacientes.init === "function") {
      window.Pacientes.init();
      console.log("PRONTIO :: Pacientes inicializado (window.Pacientes.init()).");
      return;
    }

    console.error("PRONTIO :: Módulo Pacientes não encontrado para inicializar.");
  } catch (err) {
    console.error("PRONTIO :: Erro ao iniciar módulo de Pacientes:", err);
  }
});
