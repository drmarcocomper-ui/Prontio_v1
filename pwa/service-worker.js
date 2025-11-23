// service-worker.js
// PRONTIO - Cache simples dos arquivos principais (App Shell)

const CACHE_NAME = "prontio-cache-v1";

// Liste aqui apenas o essencial para o app abrir (app shell).
// Você pode ir adicionando arquivos depois, se quiser.
const APP_SHELL = [
  "/",
  "/views/atendimento.html",
  "/assets/css/main.css",
  "/assets/js/core/script.js",
  "/assets/js/core/api.js",
  "/assets/js/core/utils.js",
  "/assets/js/core/layout.js",
  "/assets/js/core/sidebar-loader.js"
];

// Instalação: faz o pré-cache do "app shell"
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
});

// Ativação: limpeza de caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// Fetch: responde com cache primeiro, depois rede (fallback)
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Só trata GET
  if (request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Se não tiver no cache, busca na rede e (opcionalmente) salva no cache
      return fetch(request)
        .then((networkResponse) => {
          // Só cacheia respostas válidas
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // Aqui você pode retornar uma página offline customizada no futuro
          // return caches.match("/views/offline.html");
          return new Response(
            "Você está offline e este recurso ainda não foi cacheado.",
            {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" }
            }
          );
        });
    })
  );
});
