import { getLikelyType } from './util'

const LINE =
  /(?:^|^)\s*((?:\s*#.+\n)*)?(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?[^#\r\n]*(#.*)?(?:$|$)/gm

export type EnvAcornMap = {
  [name: string]: {
    annotation?: string
    value: string
    likelyType: 'string' | 'boolean' | 'number'
  }
}

/**
 * Converts a string into an array of env-dts-parser-line objects
 * @param src
 * @returns
 */
export default function parse(src: string): EnvAcornMap {
  const obj: EnvAcornMap = {}

  // Convert line breaks to same format
  const lines = src.replace(/\r\n?/gm, '\n')

  let match: RegExpExecArray | null
  while ((match = LINE.exec(lines)) != null) {
    const annotation = match[1] || match[4]

    const key = match[2]

    // Default undefined or null to empty string
    let value = match[3] || ''

    // Remove whitespace
    value = value.trim()

    // Check if double quoted
    const maybeQuote = value[0]

    // check if quotes
    const stringAssert = /^(['"`])([\s\S]*)\1$/gm.test(value)

    // Remove surrounding quotes
    value = value.replace(/^(['"`])([\s\S]*)\1$/gm, '$2')

    // Expand newlines if double quoted
    if (maybeQuote === '"') {
      value = value.replace(/\\n/g, '\n')
      value = value.replace(/\\r/g, '\r')
    }

    // Add to object
    obj[key] = {
      value,
      annotation,
      likelyType: stringAssert ? 'string' : getLikelyType(value),
    }
  }
  return obj
}
