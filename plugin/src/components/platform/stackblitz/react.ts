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

export function openReactStackblitz(params: PlatformParams) {
  const { code, title, description } = params

  stackblitz.openProject(
    {
      title: title!,
      description: description!,
      template: 'node',
      files: {
        'src/Demo.tsx': code,
        'src/main.tsx': genMainTs(ComponentType.REACT),
        'index.html': genHtmlTemplate({ src: '/src/main.tsx' }),
        'package.json': genPackageJson({
          type: ComponentType.REACT,
          platform: PlatformType.STACKBLITZ,
          code,
        }),
        'vite.config.js': genViteConfig(ComponentType.REACT),
        '.stackblitzrc': genStackblitzRc(),
        'tsconfig.json': genTsConfig(ComponentType.REACT),
        ...params.customFiles,
      },
    },
    {
      openFile: 'src/Demo.tsx',
    },
  )
}
