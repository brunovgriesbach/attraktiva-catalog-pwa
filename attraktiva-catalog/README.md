# Attraktiva Catalog Frontend

This project uses React with Vite and React Router. The application starts in `src/main.tsx`, which provides global context and renders the routes defined in `src/routes.tsx`.

## Product catalog

The product data comes from a shared Google Sheets document
([link](https://docs.google.com/spreadsheets/d/1V_cRwCFGDK6DRwI7xVYlf6raYq3iQzB7cZcgQRIRIo4/edit?usp=sharing)). The application
fetches the sheet as CSV and parses it at runtime to build the list of available products. You can override the default sheet URL
by setting the `VITE_PRODUCTS_SOURCE_URL` environment variable before running Vite.

To resolve images stored in Google Drive, create a `.env` file with:

- `VITE_GOOGLE_DRIVE_FOLDER_ID`: the shared folder identifier (the middle portion of the sharing URL).
- `VITE_GOOGLE_DRIVE_API_KEY`: an API key from Google Cloud with the Drive API enabled.

With both values set, you may write only the file name (for example, `catalog-image.png`) in the `image`, `image2`, etc. columns
of the spreadsheet. The application will look up the file inside the folder and transform it into a public viewing link. Direct
URLs continue to work regardless of this configuration.

## Linting, formatting, and tests

- `npm run lint` / `npm run lint:fix`
- `npm run format` / `npm run format:fix`
- `npm test`

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Push Notifications

Generate VAPID keys and set the values in a `.env` file:

```bash
npm run generate-vapid
```

Start the backend server to handle subscriptions and send push messages:

```bash
npm run server
```

Use the `/api/push` endpoint to dispatch notifications to subscribed clients.
