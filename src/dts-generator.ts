import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { dirname } from 'path'
import {
  checkPrefix,
  equalsMode,
  isBooleany,
  isNumbery,
  type EnvParsed,
} from './util'

/**
 * interface item info
 */
interface DeclareLine {
  name: string
  annotation?: string[]
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
  currentMode: string,
  prefix?: string | string[],
  skipMaybeNull = false
): void {
  const declareLines: Record<string, DeclareLine> = createDecalreInfo(
    envParsed,
    isConvertValue,
    currentMode,
    prefix,
    skipMaybeNull
  )

  if (!existsSync(dirname(filePath))) {
    mkdirSync(dirname(filePath), { recursive: true })
  }

  writeFileSync(
    filePath,
    renderInterface(Object.values(declareLines))
  )
}

function renderDeclareLine(data: DeclareLine): string {
  return `${renderAnnotation(data)}\n  readonly ${data.name}${
    data.required ? ':' : '?:'
  } ${data.type.join(' | ')}`
}

function renderInterface(lines: DeclareLine[]) {
  return `/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
// noinspection JSUnusedGlobalSymbols
// Auto-generated by vite-plugin-env
interface ImportMetaEnv {
  ${lines.map(renderDeclareLine).join('\n  ')}
}`
}

function renderAnnotation(data: DeclareLine): string {

  const comments = data.annotation?.length ? [
    '```text',
    ...data.annotation,
    '```',
  ] : []

  const valueHints = Object.entries(data.values).map(([mode,value]) => `- \`${mode}\` ${value}`)

  const annotationBody = [
    ...comments,
    ...valueHints
  ].map((e) => `   * ${e}`).join('\n')

  return `/**\n${annotationBody}\n   */`
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
  currentMode: string,
  prefix?: string | string[],
  skipMaybeNull = false
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
      }

      // mixin annotation
      if (
        (equalsMode(currentMode, meta.mode) && value.annotation) ||
        !declareLines[key].annotation
      ) {
        declareLines[key].annotation = value.annotation
      }

      // mixin value
      declareLines[key].values[meta.mode] = value.value

      // mixin type
      if (isConvertValue) {
        !declareLines[key].type.includes(value.likelyType) &&
          declareLines[key].type.push(value.likelyType)
      } else {
        declareLines[key].type = ['string']
      }
    })
  })

  // update required field
  Object.values(declareLines).forEach((e) => {
    e.required = skipMaybeNull ? true : Object.keys(e.values).length === Object.keys(envParsed).length
  })

  return declareLines
}
