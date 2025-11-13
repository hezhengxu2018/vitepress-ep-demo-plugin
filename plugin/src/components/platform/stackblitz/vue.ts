import type { PlatformParams } from '@/constant/type'
import stackblitz from '@stackblitz/sdk'
import { ComponentType, PlatformType } from '@/constant/type'
import {
  genHtmlTemplate,
  genMainTs,
  genPackageJson,
  genStackblitzRc,
  genTsConfig,
  genViteConfig,
} from '../templates'

export function openVueStackblitz(params: PlatformParams) {
  const { code, title, description } = params

  stackblitz.openProject(
    {
      title: title!,
      description: description!,
      template: 'node',
      files: {
        'src/Demo.vue': code,
        'src/main.ts': genMainTs(ComponentType.VUE),
        'index.html': genHtmlTemplate({ src: '/src/main.ts' }),
        'package.json': genPackageJson({
          type: ComponentType.VUE,
          platform: PlatformType.STACKBLITZ,
          code,
        }),
        'vite.config.js': genViteConfig(ComponentType.VUE),
        '.stackblitzrc': genStackblitzRc(),
        'tsconfig.json': genTsConfig(ComponentType.VUE),
        ...params.customFiles,
      },
    },
    {
      openFile: 'src/Demo.vue',
    },
  )
}
