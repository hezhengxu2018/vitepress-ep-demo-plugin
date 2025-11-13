import type { PlatformParams } from '@/constant/type'
import stackblitz from '@stackblitz/sdk'
import { genHtmlTemplate } from '../templates'

export function openHtmlStackblitz(params: PlatformParams) {
  const { code, title, description } = params

  stackblitz.openProject(
    {
      title: title!,
      description: description!,
      template: 'html',
      files: {
        'index.html': genHtmlTemplate({ code }),
        ...params.customFiles,
      },
    },
    {
      openFile: 'index.html',
    },
  )
}
