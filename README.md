# Attraktiva Catálogo (PWA)

> **Atenção:** Este repositório não aceita arquivos binários em PRs. Ícones e imagens serão adicionados manualmente depois.

O frontend está localizado na pasta [`attraktiva-catalog`](./attraktiva-catalog). Consulte o README dessa pasta para instruções de desenvolvimento.

## Imagens de produtos e execução local

1. **Obter uma URL direta da imagem:** hospede o arquivo em um serviço que forneça um link público direto (CDN, armazenamento de objetos, etc.). Certifique-se de que a URL seja acessível sem autenticação.
2. **Atualizar `products.csv`:** edite o arquivo [`attraktiva-catalog/public/products.csv`](./attraktiva-catalog/public/products.csv) e cole a URL na coluna `image` correspondente a cada produto.
3. **Rodar o Vite:** dentro da pasta [`attraktiva-catalog`](./attraktiva-catalog), execute `npm run dev` para iniciar o ambiente de desenvolvimento.
4. *(Opcional)* **Executar o servidor Express:** rode `npm run server` para habilitar os endpoints utilizados nas notificações push.

## Roadmap

- [x] Configuração básica do repositório.
- [x] Setup do Vite + React e estrutura inicial do projeto.
- [x] Configuração de linting, formatação e testes.
- [ ] Implementação das principais funcionalidades do catálogo.
- [ ] Inclusão de assets do PWA e ajustes finais.

## Comandos de linting, formatação e testes

- `npm run lint` / `npm run lint:fix`
- `npm run format` / `npm run format:fix`
- `npm test`

## Deploy

A publicação do PWA é feita automaticamente via GitHub Actions. Para habilitar o processo, defina as seguintes variáveis de ambiente secretas no repositório:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

As variáveis podem ser configuradas em *Settings > Secrets and variables > Actions* no GitHub.
