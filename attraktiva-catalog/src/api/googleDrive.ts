const DRIVE_API_ENDPOINT = 'https://www.googleapis.com/drive/v3/files'
const DRIVE_VIEW_ENDPOINT = 'https://drive.google.com/uc'

type DriveConfig = {
  folderId: string
  apiKey: string
}

type DriveFilesResponse = {
  files?: Array<{ id?: string; name?: string }>
  nextPageToken?: string
  error?: { message?: string }
}

export type ImageUrlResolver = (value: string) => string

const resolverCache = new Map<string, Promise<ImageUrlResolver>>()

function normalizeName(value: string): string {
  return value.trim().toLowerCase()
}

function buildDriveViewUrl(id: string): string {
  const url = new URL(DRIVE_VIEW_ENDPOINT)
  url.searchParams.set('export', 'view')
  url.searchParams.set('id', id)
  return url.toString()
}

function buildCacheKey(config: DriveConfig): string {
  return `${config.folderId}::${config.apiKey}`
}

function createDefaultResolver(): ImageUrlResolver {
  return (value) => value
}

async function fetchDriveFiles(
  config: DriveConfig,
  pageToken?: string,
): Promise<DriveFilesResponse> {
  const url = new URL(DRIVE_API_ENDPOINT)
  url.searchParams.set('q', `'${config.folderId}' in parents and trashed = false`)
  url.searchParams.set('fields', 'nextPageToken, files(id, name)')
  url.searchParams.set('pageSize', '1000')
  url.searchParams.set('key', config.apiKey)
  url.searchParams.set('includeItemsFromAllDrives', 'false')
  url.searchParams.set('supportsAllDrives', 'false')

  if (pageToken) {
    url.searchParams.set('pageToken', pageToken)
  }

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Google Drive files: ${response.status} ${response.statusText}`,
    )
  }

  const body = (await response.json()) as DriveFilesResponse

  if (body.error?.message) {
    throw new Error(body.error.message)
  }

  return body
}

async function buildDriveResolver(config: DriveConfig): Promise<ImageUrlResolver> {
  const nameToId = new Map<string, string>()

  let pageToken: string | undefined

  do {
    const { files = [], nextPageToken } = await fetchDriveFiles(config, pageToken)

    for (const file of files) {
      const id = typeof file.id === 'string' ? file.id.trim() : ''
      const name = typeof file.name === 'string' ? file.name.trim() : ''

      if (id.length === 0 || name.length === 0) {
        continue
      }

      const normalized = normalizeName(name)

      if (!nameToId.has(normalized)) {
        nameToId.set(normalized, id)
      }

      const lastDotIndex = normalized.lastIndexOf('.')
      if (lastDotIndex > 0) {
        const withoutExtension = normalized.slice(0, lastDotIndex)
        if (!nameToId.has(withoutExtension)) {
          nameToId.set(withoutExtension, id)
        }
      }
    }

    pageToken = nextPageToken
  } while (pageToken)

  if (nameToId.size === 0) {
    console.warn(
      `[GoogleDrive] No files found in folder "${config.folderId}" or the folder is empty.`,
    )
  }

  return (value) => {
    const trimmed = value.trim()
    if (trimmed.length === 0) {
      return ''
    }

    const normalized = normalizeName(trimmed)
    const mappedId = nameToId.get(normalized)

    if (!mappedId) {
      console.warn(
        `[GoogleDrive] No file named "${trimmed}" was found in folder "${config.folderId}".`,
      )
      return trimmed
    }

    return buildDriveViewUrl(mappedId)
  }
}

export async function createGoogleDriveImageResolver(
  config?: Partial<DriveConfig> | null,
): Promise<ImageUrlResolver> {
  if (!config?.folderId || !config?.apiKey) {
    return createDefaultResolver()
  }

  const cacheKey = buildCacheKey({
    folderId: config.folderId,
    apiKey: config.apiKey,
  })

  let resolverPromise = resolverCache.get(cacheKey)

  if (!resolverPromise) {
    resolverPromise = buildDriveResolver({
      folderId: config.folderId,
      apiKey: config.apiKey,
    }).catch((error) => {
      console.error(
        `[GoogleDrive] Failed to load folder "${config.folderId}":`,
        error,
      )
      resolverCache.delete(cacheKey)
      return createDefaultResolver()
    })

    resolverCache.set(cacheKey, resolverPromise)
  }

  return resolverPromise
}
