/* eslint-env node */
import express from 'express'

const router = express.Router()

const MAX_REDIRECTS = 10

function isShortOneDriveHostname(hostname) {
  const lowerCase = hostname.toLowerCase()
  return lowerCase === '1drv.ms' || lowerCase.endsWith('.1drv.ms')
}

function isOneDriveHostname(hostname) {
  const lowerCase = hostname.toLowerCase()
  return lowerCase === 'onedrive.live.com' || lowerCase.endsWith('.onedrive.live.com')
}

async function resolveShortOneDriveUrl(initialUrl) {
  let currentUrl = initialUrl
  const visited = new Set()

  for (let attempt = 0; attempt < MAX_REDIRECTS; attempt += 1) {
    if (visited.has(currentUrl)) {
      break
    }

    visited.add(currentUrl)

    const response = await fetch(currentUrl, { redirect: 'manual' })

    if (typeof response.body?.cancel === 'function') {
      try {
        response.body.cancel()
      } catch {
        // Ignore cancellation errors
      }
    }

    if (response.status >= 300 && response.status < 400) {
      const locationHeader = response.headers?.get('location')?.trim()

      if (!locationHeader) {
        break
      }

      let nextUrl
      try {
        nextUrl = new URL(locationHeader, currentUrl)
      } catch {
        break
      }

      const nextHostname = nextUrl.hostname.toLowerCase()

      if (isOneDriveHostname(nextHostname)) {
        return nextUrl.toString()
      }

      if (!isShortOneDriveHostname(nextHostname)) {
        break
      }

      currentUrl = nextUrl.toString()
      continue
    }

    try {
      const finalUrl = response.url || currentUrl
      const parsedFinal = new URL(finalUrl)
      if (isOneDriveHostname(parsedFinal.hostname)) {
        return parsedFinal.toString()
      }
    } catch {
      // Ignore parsing errors and abort
    }

    break
  }

  return null
}

router.post('/api/onedrive/resolve', async (req, res) => {
  const { url } = req.body ?? {}

  if (typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing "url" parameter' })
  }

  const normalizedUrl = url.trim()

  if (normalizedUrl.length === 0) {
    return res.status(400).json({ error: 'Missing "url" parameter' })
  }

  let parsedUrl
  try {
    parsedUrl = new URL(normalizedUrl)
  } catch {
    return res.status(400).json({ error: 'Invalid URL' })
  }

  if (!isShortOneDriveHostname(parsedUrl.hostname)) {
    return res.status(400).json({ error: 'URL must use a 1drv.ms host' })
  }

  try {
    const resolvedUrl = await resolveShortOneDriveUrl(parsedUrl.toString())

    if (!resolvedUrl) {
      return res.status(502).json({ error: 'Failed to resolve OneDrive URL' })
    }

    return res.json({ url: resolvedUrl })
  } catch (error) {
    console.error('[onedrive-resolver] Failed to resolve URL', error)
    return res.status(502).json({ error: 'Failed to resolve OneDrive URL' })
  }
})

export default router
