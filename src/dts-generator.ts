import { existsSync, writeFileSync } from 'fs'
import { checkPrefix, isBooleany, isNumbery, type EnvParsed } from './util'

/**
 * interface item info
 */
interface DeclareLine {
  name: string
  annotation?: string
  type: ('string' | 'boolean' | 'number')[]
  required: boolean
  values: Record<string, string>
}

/**
 * generate env file declare for typescript
 * @param filePath file path
 * @param envParsed env parsed
 * @param isConvertValue set if convert value to number or boolean
 * @param prefix allow env prefix
 */
export function generateDeclareFile(
  filePath: string,
  envParsed: EnvParsed[],
  isConvertValue: boolean,
  prefix?: string | string[]
): void {
  const declareLines: Record<string, DeclareLine> = createDecalreInfo(
    envParsed,
    isConvertValue,
    prefix
  )

  console.log(declareLines)
}

/**
 * create declare info
 * @param envParsed env parsed
 * @param isConvertValue set if convert value to number or boolean
 * @param prefix allow env prefix
 * @returns
 */
function createDecalreInfo(
  envParsed: EnvParsed[],
  isConvertValue: boolean,
  prefix?: string | string[]
): Record<string, DeclareLine> {
  const declareLines: Record<string, DeclareLine> = {}

  envParsed.forEach((env) => {
    const { meta, parsed } = env
    Object.entries(parsed).forEach(([key, value]) => {
      // Filter out keys that do not match the prefix
      if (prefix && !checkPrefix(key, prefix)) {
        return
      }

      // Ensure that the object corresponding to the key exists
      declareLines[key] = declareLines[key] ?? {
        name: key,
        type: [],
        required: true,
        values: {},
        annotation: value.annotation,
      }

      // mixin value
      declareLines[key].values[meta.mode] = value.value

      // mixin type
      if (
        isConvertValue &&
        isNumbery(value.value) &&
        !declareLines[key].type.includes('number')
      ) {
        declareLines[key].type.push('number')
      } else if (
        isConvertValue &&
        isBooleany(value.value) &&
        !declareLines[key].type.includes('boolean')
      ) {
        declareLines[key].type.push('boolean')
      } else if (!declareLines[key].type.includes('string')) {
        declareLines[key].type.push('string')
      }
    })
  })

  // update required field
  declareLines

  return declareLines
}
