# Attraktiva Catálogo (PWA)

> **Atenção:** Este repositório não aceita arquivos binários em PRs. Ícones e imagens serão adicionados manualmente depois.

O frontend está localizado na pasta [`attraktiva-catalog`](./attraktiva-catalog). Consulte o README dessa pasta para instruções de desenvolvimento.

## Imagens de produtos e execução local

1. **Obter link público do OneDrive:** carregue a imagem no OneDrive, clique em *Compartilhar* e escolha a opção "Qualquer pessoa com o link". Use *Copiar link* para gerar uma URL pública.
2. **Atualizar `products.csv`:** edite o arquivo [`attraktiva-catalog/server/products.csv`](./attraktiva-catalog/server/products.csv) e cole a URL na coluna `image` correspondente a cada produto.
3. **Rodar servidor e Vite:** dentro da pasta [`attraktiva-catalog`](./attraktiva-catalog), execute `npm run server` para iniciar a API Express disponível em `http://localhost:3000`. Em outro terminal, rode `npm run dev` para subir o Vite.
4. **Configurar a URL da API no frontend:** ainda na pasta [`attraktiva-catalog`](./attraktiva-catalog), crie um arquivo `.env` contendo `VITE_API_URL=http://localhost:3000` para que o PWA consuma a API local.

> Sem executar o servidor local ou sem definir a variável `VITE_API_URL`, o PWA exibirá a mensagem **"Erro ao buscar produtos"**.

## Roadmap

- [x] Configuração básica do repositório.
- [x] Setup do Vite + React e estrutura inicial do projeto.
- [ ] Configuração de linting, formatação e testes.
- [ ] Implementação das principais funcionalidades do catálogo.
- [ ] Inclusão de assets do PWA e ajustes finais.

## Deploy

A publicação do PWA é feita automaticamente via GitHub Actions. Para habilitar o processo, defina as seguintes variáveis de ambiente secretas no repositório:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

As variáveis podem ser configuradas em *Settings > Secrets and variables > Actions* no GitHub.
