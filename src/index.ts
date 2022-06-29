import { readFileSync } from 'fs'
import { resolve } from 'path'
import type { Plugin, ResolvedConfig } from 'vite'
import parse from './env-parser'
import { convertValue, isTypeScriptProject } from './util'

/** 插件配置 */
export interface EnvDtsOptions {
  include?: (RegExp | string)[]
  exclude?: (RegExp | string)[]
  declareFilePath?: string
  convertValue?: boolean
}

/** 插件名称 */
const PLUGIN_NAME = 'vite:env-dts'

export default function envDts(options: EnvDtsOptions = {}): Plugin {
  let root: string
  let envDir: string | undefined
  let envPrefix: string | string[] | undefined

  return {
    name: PLUGIN_NAME,
    async buildStart() {
      if (!isTypeScriptProject()) {
        this.warn(
          'Can not found tsconfig.json or tsconfig.jsonc file,are you sure you are using typescript?'
        )
      }
      const envCode = readFileSync(resolve(root, envDir || '.', '.env'), 'utf8')
    },
    configResolved(config) {
      root = config.root
      envDir = config.envDir
      envPrefix = config.envPrefix

      // 启用格式转换
      if (options.convertValue) {
        convertValue(config.env)
      }
      console.log('configResolved', config.env)
    },
  }
}
