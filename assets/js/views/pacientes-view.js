// assets/js/views/pacientes-view.js
// Inicializador oficial do módulo de Pacientes para a view "/views/pacientes"

document.addEventListener("DOMContentLoaded", () => {
  try {
    if (window.PRONTIO?.Modules?.Pacientes?.init) {
      PRONTIO.Modules.Pacientes.init();
      console.log("PRONTIO :: Pacientes inicializado.");
    } else if (window.Pacientes?.init) {
      window.Pacientes.init();
      console.log("PRONTIO :: Pacientes inicializado (fallback).");
    } else {
      console.error("PRONTIO :: Módulo Pacientes não encontrado.");
    }
  } catch (err) {
    console.error("Erro ao inicializar módulo Pacientes:", err);
  }
});
