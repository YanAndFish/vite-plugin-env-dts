import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import fastGlob from 'fast-glob'
import parse, { type EnvAcornMap } from './env-parser'

interface EnvInfo {
  mode: string
  modifications: string[]
}

interface EnvParsed {
  meta: EnvInfo
  parsed:EnvAcornMap
} 

/**
 * check if the project use Typescript
 */
export function isTypeScriptProject(): boolean {
  return !!(
    existsSync(join(process.cwd(), 'tsconfig.json')) ||
    existsSync(join(process.cwd(), 'tsconfig.jsonc'))
  )
}

function isNumbery(value?: string): boolean {
  return !isNaN(+value!)
}

function isBooleany(value?: string): boolean {
  return value === 'true' || value === 'false'
}

export function convertValue(value: Record<string, any>): void {
  if (typeof value === 'object') {
    for (const key in value) {
      if (isNumbery(value[key])) {
        value[key] = Number(value[key])
      } else if (isBooleany(value[key])) {
        value[key] = value[key] === 'true'
      }
    }
  }
}

/**
 * scan .env files in the project
 * @param glob glob pattern
 * @param encoding file encoding
 */
export async function scanEnv(
  glob: string,
  encoding: BufferEncoding = 'utf-8'
):Promise<EnvParsed[]> {
  const matchPaths = await fastGlob(glob, {
    onlyFiles: true,
    dot: true,
  })

  return matchPaths.map((path) => {
    const envInfo = parseEnvInfo(path) 
    const content = readFileSync(path, encoding)
    const parsed = parse(content)

    return {
      meta: envInfo,
      parsed,
    }
  })
}

function parseEnvInfo(envPath: string): EnvInfo {
  const fileName = envPath.replace(/^.*\.env/, '')?.split('.')

  return {
    mode: fileName?.[1] || 'default',
    modifications: fileName?.slice(2, fileName.length) || [],
  }
}
