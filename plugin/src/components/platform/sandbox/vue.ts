import type { PlatformParams } from '@/constant/type'
import { getParameters } from 'codesandbox/lib/api/define'
import { ComponentType, PlatformType } from '@/constant/type'
import {
  genHtmlTemplate,
  genMainTs,
  genPackageJson,
  genTsConfig,
} from '../templates'

export function getVueCodeSandboxParams(params: PlatformParams) {
  const { code } = params
  return (getParameters as any)({
    files: {
      'package.json': {
        content: genPackageJson({
          type: ComponentType.VUE,
          platform: PlatformType.CODESANDBOX,
          code,
        }),
      },
      'tsconfig.json': {
        content: genTsConfig(ComponentType.VUE),
      },
      'index.html': {
        content: genHtmlTemplate(),
      },
      'src/main.ts': {
        content: genMainTs(ComponentType.VUE),
      },
      'src/Demo.vue': {
        content: code,
      },
      ...params.customFiles,
    },
  })
}
