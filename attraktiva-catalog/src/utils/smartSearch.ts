const WHITESPACE_REGEX = /\s+/g
const NON_ALPHANUMERIC_REGEX = /[^\p{L}\p{N}\s]/gu
const DIACRITICS_REGEX = /\p{Diacritic}/gu

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .replace(NON_ALPHANUMERIC_REGEX, ' ')
    .toLowerCase()
    .replace(WHITESPACE_REGEX, ' ')
    .trim()
}

function getTokens(text: string): string[] {
  const normalized = normalizeText(text)
  return normalized.length > 0 ? normalized.split(' ') : []
}

function levenshteinDistance(source: string, target: string): number {
  if (source === target) {
    return 0
  }

  if (source.length === 0) {
    return target.length
  }

  if (target.length === 0) {
    return source.length
  }

  const previousRow: number[] = Array.from({ length: target.length + 1 }, (_, index) => index)
  const currentRow: number[] = new Array(target.length + 1)

  for (let rowIndex = 0; rowIndex < source.length; rowIndex += 1) {
    currentRow[0] = rowIndex + 1

    for (let columnIndex = 0; columnIndex < target.length; columnIndex += 1) {
      const cost = source[rowIndex] === target[columnIndex] ? 0 : 1

      const insertion = currentRow[columnIndex] + 1
      const deletion = previousRow[columnIndex + 1] + 1
      const substitution = previousRow[columnIndex] + cost

      currentRow[columnIndex + 1] = Math.min(insertion, deletion, substitution)
    }

    previousRow.splice(0, previousRow.length, ...currentRow)
  }

  return previousRow[target.length]
}

function getDistanceThreshold(termLength: number): number {
  if (termLength <= 2) {
    return 0
  }

  if (termLength <= 4) {
    return 1
  }

  return Math.max(2, Math.floor(termLength * 0.3))
}

function tokenMatches(term: string, textTokens: string[]): boolean {
  return textTokens.some((token) => {
    if (token === term) {
      return true
    }

    if (token.includes(term) || term.includes(token)) {
      return true
    }

    const distance = levenshteinDistance(term, token)
    const threshold = getDistanceThreshold(Math.max(term.length, token.length))

    return distance <= threshold
  })
}

export function smartSearchMatch(searchTerm: string, ...fields: string[]): boolean {
  const combinedText = fields.join(' ')
  const normalizedSearch = normalizeText(searchTerm)

  if (normalizedSearch.length === 0) {
    return true
  }

  const normalizedCombined = normalizeText(combinedText)

  if (normalizedCombined.includes(normalizedSearch)) {
    return true
  }

  const searchTokens = getTokens(searchTerm)
  const textTokens = getTokens(combinedText)

  if (searchTokens.length === 0 || textTokens.length === 0) {
    return false
  }

  return searchTokens.every((term) => tokenMatches(normalizeText(term), textTokens))
}

export function createSearchableText(...fields: string[]): string {
  return fields.join(' ')
}

