import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import fastGlob from 'fast-glob'
import parse, { type EnvAcornMap } from './env-parser'



export interface EnvInfo {
  mode: string
  isLocal: boolean
}

export interface EnvParsed {
  meta: EnvInfo
  parsed: EnvAcornMap
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

export function isNumbery(value?: string): boolean {
  return !isNaN(+value!)
}

export function isBooleany(value?: string): boolean {
  return value === 'true' || value === 'false'
}

export function getLikelyType(value: string): 'string' | 'boolean' | 'number' {
  if (isNumbery(value)) {
    return 'number'
  }

  if (isBooleany(value)) {
    return 'boolean'
  }

  return 'string'
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
): Promise<EnvParsed[]> {
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
    isLocal: fileName?.[2] === 'local',
  }
}

export class MagicString {
  private overwrites: { loc: [number, number]; content: string }[] = []
  private starts = ''
  private ends = ''

  constructor(public str: string) {}

  public append(content: string) {
    this.ends += content
    return this
  }

  public prepend(content: string) {
    this.starts = content + this.starts
    return this
  }

  public overwrite(start: number, end: number, content: string) {
    if (end < start) {
      throw new Error(`"end" con't be less than "start".`)
    }
    if (!this.overwrites) {
      this.overwrites = []
    }
    this.overwrites.push({ loc: [start, end], content })
    return this
  }

  public toString() {
    let str = this.str
    if (this.overwrites) {
      const arr = [...this.overwrites].sort((a, b) => b.loc[0] - a.loc[0])
      for (const {
        loc: [start, end],
        content,
      } of arr) {
        // TODO: check start or end overlap
        str = str.slice(0, start) + content + str.slice(end)
      }
    }
    return this.starts + str + this.ends
  }
}

/**
 * check prefix of the string
 * @param target target string
 * @param prefix prefix
 * @returns
 */
export function checkPrefix(
  target: string,
  prefix: string | string[]
): boolean {
  if (typeof prefix === 'string') {
    return target.startsWith(prefix)
  }
  for (const p of prefix) {
    if (target.startsWith(p)) {
      return true
    }
  }
  return false
}

/**
 * check env mode is equal
 * @param a mode a
 * @param b mode b
 */
export function equalsMode(a: string, b: string): boolean {
  const _target = a.toLowerCase().trim()
  const _source = b.toLowerCase().trim()

  if (_source === 'dev' || _source === 'development') {
    return _target === 'dev' || _target === 'development'
  } else if (_source === 'prod' || _source === 'production') {
    return _target === 'prod' || _target === 'production'
  } else {
    return _target === _source
  }
}

/**
 * assign env map
 * @param target target env map
 * @param source source env map
 * @returns
 */
export function assignEnv(
  target: EnvAcornMap,
  source: EnvAcornMap
): EnvAcornMap {
  const targetKey = Object.keys(target)
  for (const key in source) {
    if (targetKey.includes(key)) {
      target[key] = source[key]
    }
  }
  return target
}

export function arrayRemove<T>(
  target: T[],
  predicate: (item: T, index: number, array: T[]) => boolean
): T[] {
  const index = target.findIndex(predicate)
  if (index >= 0) {
    target.splice(index, 1)
  }
  return target
}

export function assignLocalEnv(envParsed: EnvParsed[]): EnvParsed[] {
  envParsed
    .filter((e) => e.meta.isLocal)
    .forEach((e) => {
      // try assign to normal
      const normal = envParsed.find(
        (env) => env.meta.mode === e.meta.mode && !env.meta.isLocal
      )
      const local = envParsed.find(
        (env) => env.meta.mode === e.meta.mode && env.meta.isLocal
      )
      if (normal && local) {
        normal.parsed = assignEnv(normal.parsed, local.parsed)
        arrayRemove(
          envParsed,
          (env) => env.meta.mode === e.meta.mode && env.meta.isLocal
        )
      }
    })

  return envParsed
}