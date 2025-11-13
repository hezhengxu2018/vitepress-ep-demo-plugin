import type { PlatformParams } from '@/constant/type'
// @ts-ignore
import { getParameters } from 'codesandbox/lib/api/define'
import { ComponentType, PlatformType } from '@/constant/type'
import {
  genHtmlTemplate,
  genMainTs,
  genPackageJson,
  genTsConfig,
} from '../templates'

export function getReactCodeSandboxParams(params: PlatformParams) {
  const { code } = params
  return (getParameters as any)({
    files: {
      'package.json': {
        content: genPackageJson({
          type: ComponentType.REACT,
          platform: PlatformType.CODESANDBOX,
          code,
        }),
      },
      'tsconfig.json': {
        content: genTsConfig(ComponentType.REACT),
      },
      'index.html': {
        content: genHtmlTemplate(),
      },
      'src/main.tsx': {
        content: genMainTs(ComponentType.REACT),
      },
      'src/Demo.tsx': {
        content: code,
      },
      ...params.customFiles,
    },
  })
}
