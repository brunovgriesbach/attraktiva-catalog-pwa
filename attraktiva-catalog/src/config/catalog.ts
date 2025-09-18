const DEFAULT_PRODUCTS_SOURCE_URL =
  'https://docs.google.com/spreadsheets/d/1V_cRwCFGDK6DRwI7xVYlf6raYq3iQzB7cZcgQRIRIo4/gviz/tq?tqx=out:csv'

function normalizeUrl(value: string | undefined): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const envUrl = normalizeUrl(import.meta.env.VITE_PRODUCTS_SOURCE_URL)

export const PRODUCTS_SOURCE_URL = envUrl ?? DEFAULT_PRODUCTS_SOURCE_URL

