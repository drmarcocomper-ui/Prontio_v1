// ===============================
// PRONTIO DEV - CORE DE API
// ===============================

// ⚠️ Coloque aqui a URL do seu WebApp DEV (a URL que termina em /exec)
const API_URL = "https://script.google.com/macros/s/AKfycbyqoIJ10ufgRej2K1INGw-s7o_8xwYwj68pkwHPnkxMVNn4x0Fc7xQJK3pv-xyfUx6TBA/exec";

// Função padrão para chamar a API do PRONTIO DEV
// Uso: callApi({ action: 'pacientes-listar', payload: { ... } })
async function callApi({ action, payload = {} }) {
  const requestBody = JSON.stringify({ action, payload });

  console.log('PRONTIO DEV :: calling API action =', action, 'payload =', payload);

  let response;
  try {
    response = await fetch(PRONTIO_DEV_API_URL, {
      method: 'POST',
      // IMPORTANTE PARA EVITAR CORS:
      // usar um "simple request" → sem preflight OPTIONS
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: requestBody
      // não precisa setar mode: 'cors' (é o default), mas se quiser, não atrapalha
      // mode: 'cors'
    });
  } catch (err) {
    console.error('PRONTIO DEV :: erro de rede ao chamar API DEV', err);
    throw new Error('Não foi possível conectar à API DEV do PRONTIO. Verifique sua conexão.');
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error(
      'PRONTIO DEV :: resposta HTTP não OK da API DEV',
      response.status,
      text
    );
    throw new Error(`Erro HTTP ao chamar API DEV (${response.status}).`);
  }

  let json;
  try {
    json = await response.json();
  } catch (err) {
    const text = await response.text().catch(() => '');
    console.error('PRONTIO DEV :: falha ao fazer parse do JSON da API', err, text);
    throw new Error('Resposta da API DEV em formato inesperado (não é JSON válido).');
  }

  if (!json || json.success === false) {
    console.error('PRONTIO DEV :: API retornou erro lógico', json);
    const msg =
      (json && Array.isArray(json.errors) && json.errors[0]) ||
      'Erro ao executar ação na API DEV.';
    throw new Error(msg);
  }

  console.log('PRONTIO DEV :: ação concluída com sucesso', action, json);
  // O front trabalha apenas com json.data
  return json.data;
}
