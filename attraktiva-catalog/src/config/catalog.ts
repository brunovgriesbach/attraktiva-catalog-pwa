const DEFAULT_PRODUCTS_SOURCE_URL =
  'https://docs.google.com/spreadsheets/d/1V_cRwCFGDK6DRwI7xVYlf6raYq3iQzB7cZcgQRIRIo4/gviz/tq?tqx=out:csv'

function normalizeString(value: string | undefined): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function normalizeUrl(value: string | undefined): string | undefined {
  return normalizeString(value)
}

const envUrl = normalizeUrl(import.meta.env.VITE_PRODUCTS_SOURCE_URL)

export const PRODUCTS_SOURCE_URL = envUrl ?? DEFAULT_PRODUCTS_SOURCE_URL

export const MAX_PRODUCT_IMAGES = 10

export const GOOGLE_DRIVE_FOLDER_ID = normalizeString(
  import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID,
)

export const GOOGLE_DRIVE_API_KEY = normalizeString(
  import.meta.env.VITE_GOOGLE_DRIVE_API_KEY,
)

