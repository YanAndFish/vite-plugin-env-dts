import { existsSync } from 'fs'
import { join } from 'path'

/**
 * 检查项目是否支持typescript
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
  console.log('convertValue', value);
  
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
