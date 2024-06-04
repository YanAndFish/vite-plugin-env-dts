import { getLikelyType } from './util'

const LINE =
  /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(#.*)?(?:$|$)/

export type EnvAcornMap = {
  [name: string]: {
    annotation?: string[]
    value: string
    likelyType: 'string' | 'boolean' | 'number'
  }
}

function normalizeCommnet(str: string): string {
  return str
    .replace(/^\s*#\s*(.*)/, '$1')
    .replace('*/', '*\u200b/')
    .trim()
}

/**
 * Converts a string into an array of env-dts-parser-line objects
 * @param src
 * @returns
 */
export function parse(src: string): EnvAcornMap {
  const envEntries: EnvAcornMap = {}

  const lines = src.split(/\r?\n/)
  let currentCommentLines: string[] = []
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (trimmedLine.startsWith('#')) {
      // If the line is a comment, add it to the current comment lines
      currentCommentLines.push(normalizeCommnet(trimmedLine))
    } else if (LINE.test(trimmedLine)) {
      const [, key, value, comment] = LINE.exec(line) || []

      // check if quotes
      const stringAssert = /^(['"`])([\s\S]*)\1$/gm.test(value)
      envEntries[key] = {
        value: value?.replace(/^(['"`])([\s\S]*)\1$/gm, '$2') || '',
        likelyType: stringAssert ? 'string' : getLikelyType(value),
        annotation: [...currentCommentLines, comment && normalizeCommnet(comment)].filter(Boolean)
      }

      currentCommentLines = []
    } else if (trimmedLine === '') {
      // If the line is empty, reset the current comment lines
      currentCommentLines = []
    }
  }

  return envEntries
}
