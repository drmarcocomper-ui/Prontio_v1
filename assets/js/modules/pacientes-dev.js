// assets/js/modules/pacientes-dev.js
// Lógica da tela de Pacientes (DEV)

document.addEventListener("DOMContentLoaded", () => {
  // DEBUG: ver se a função global existe
  console.log("DEBUG pacientes-dev: typeof window.callApi =", typeof window.callApi);

  const form = document.getElementById("form-cadastro-paciente");
  const btnSalvar = document.getElementById("btnSalvar");
  const btnLimpar = document.getElementById("btnLimpar");
  const statusBox = document.getElementById("statusBox");

  function setStatus(type, message, extra) {
    statusBox.className = "status";
    statusBox.style.display = "block";

    if (type === "ok") {
      statusBox.classList.add("ok");
    } else if (type === "error") {
      statusBox.classList.add("error");
    } else if (type === "loading") {
      statusBox.classList.add("loading");
    }

    statusBox.textContent = message;

    if (extra) {
      const small = document.createElement("small");
      small.textContent = extra;
      statusBox.appendChild(small);
    }
  }

  function limparStatus() {
    statusBox.style.display = "none";
    statusBox.textContent = "";
    statusBox.className = "status";
  }

  btnLimpar.addEventListener("click", () => {
    form.reset();
    limparStatus();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    limparStatus();

    btnSalvar.disabled = true;

    const pacientePayload = {
      nomeCompleto: document.getElementById("nomeCompleto").value.trim(),
      dataNascimento: document.getElementById("dataNascimento").value || null,
      cpf: document.getElementById("cpf").value.trim() || null,
      telefone: document.getElementById("telefone").value.trim() || null,
      email: document.getElementById("email").value.trim() || null,
      observacoes: document.getElementById("observacoes").value.trim() || null,
    };

    if (!pacientePayload.nomeCompleto) {
      setStatus("error", "O nome do paciente é obrigatório.");
      btnSalvar.disabled = false;
      return;
    }

    try {
      setStatus("loading", "Enviando dados para o servidor...");

      // chamando via window.callApi (garante que usamos a função global)
      const response = await window.callApi({
        action: "Pacientes.Criar",
        payload: pacientePayload,
      });

      if (response && response.success) {
        const id =
          response.data && response.data.idPaciente
            ? response.data.idPaciente
            : "(ID desconhecido)";

        setStatus("ok", "Paciente salvo com sucesso!", `ID gerado: ${id}`);
      } else {
        const errors = (response && response.errors) || [];
        const firstError = errors.length
          ? errors[0]
          : "Erro desconhecido ao salvar.";
        setStatus("error", "Falha ao salvar paciente.", firstError);
      }
    } catch (err) {
      console.error("Erro ao chamar API:", err);
      setStatus("error", "Erro de conexão com o servidor.", String(err));
    } finally {
      btnSalvar.disabled = false;
    }
  });
});
