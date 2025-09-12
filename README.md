# Attraktiva Catálogo PWA

## PWA

Este projeto está preparado para funcionar como uma PWA. O arquivo `public/manifest.webmanifest` define as metadados do aplicativo e o `src/sw.ts` implementa um service worker simples com cache.

### Testar o service worker

1. Instale as dependências e gere o build:

   ```bash
   npm install
   npm run build
   npm run preview
   ```

2. Abra `http://localhost:4173` em um navegador e navegue pelo app.
3. Ative o modo offline e recarregue para ver a página `/offline`.

> Instalabilidade completa só após eu adicionar os ícones PNG manualmente.
