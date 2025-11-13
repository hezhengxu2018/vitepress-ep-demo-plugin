import type { PlatformParams } from '@/constant/type'
// @ts-ignore
import { getParameters } from 'codesandbox/lib/api/define'
import { genHtmlTemplate } from '../templates'

export function getHtmlCodeSandboxParams(params: PlatformParams) {
  const { code } = params
  return (getParameters as any)({
    files: {
      'index.html': {
        content: genHtmlTemplate({ code }),
      },
      ...params.customFiles,
    },
    template: 'static',
  })
}
