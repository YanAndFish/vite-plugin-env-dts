import { resolve } from 'path'
import type { Plugin } from 'vite'
import { generateDeclareFile } from './dts-generator'
import { convertValue, isTypeScriptProject, scanEnv } from './util'

/** plugin options */
export interface EnvDtsOptions {
  include?: (RegExp | string)[]
  exclude?: (RegExp | string)[]
  declareFile?: string
  convertValue?: boolean
  encoding?: BufferEncoding
}

/** plugin name */
const PLUGIN_NAME = 'vite:env-dts'

/**
 * Auto generate env file declare for typescript of Vite plugins
 *
 * For example:
 * ``` typescript
 * import { defineConfig } from 'vite'
 * import envDts from '@yanandfish/vite-plugin-env-dts'
 *
 * export default defineConfig({
 *   plugins: [
 *     envDts()
 *   ]
 * })
 * ```
 *
 * @param options plugin options
 * @returns
 */
export default function envDts(options: EnvDtsOptions = {}): Plugin {
  let root: string
  let envDir: string | undefined
  let envPrefix: string | string[] | undefined

  return {
    name: PLUGIN_NAME,
    async buildStart() {
      // plugin only support in typescript project
      if (!isTypeScriptProject()) {
        this.warn(
          'Can not found tsconfig.json or tsconfig.jsonc file,are you sure you are using typescript?'
        )
        return
      }

      // finds all env files
      const envParsed = await scanEnv(
        resolve(root, envDir || '.', '.env*'),
        options.encoding
      )

      // check and parse declareFile
      generateDeclareFile(
        resolve(root, options.declareFile || './src/env.d.ts'),
        envParsed,
        options.convertValue || false,
        envPrefix || 'VITE_'
      )
    },
    configResolved(config) {
      root = config.root
      envDir = config.envDir
      envPrefix = config.envPrefix

      console.log(config.env)

      if (options.convertValue) {
        convertValue(config.env)
      }
    },
  }
}
