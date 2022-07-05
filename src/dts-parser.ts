/**
 * dts file parse result
 */
export interface DtsNode {
  hasTypeDeclaration: boolean
  start?: number
  end?: number
}

/**
 * parse dts file
 * @param source code
 */
export function dtsParse(source: string):DtsNode {
  const declareBlock = /\s*interface\s+ImportMetaEnv\s*{((?:.|\n|\r)*)?}/m

  // Convert line breaks to same format
  const lines = source.replace(/\r\n?/m, '\n')

  const match = declareBlock.exec(lines)

  const hasTypeDeclaration = checkTypeDeclaration(lines)

  return { 
    hasTypeDeclaration,
    start: match ? match.index : undefined,
    end: match ? match.index + match[1].length : undefined
  }
}

/**
 * check if vite type declaration in dts file
 * @param source code
 * @returns 
 */
function checkTypeDeclaration(source: string): boolean{
  return false
}