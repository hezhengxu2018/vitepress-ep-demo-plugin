import type { PlatformParams } from '@/constant/type'
import { ComponentType } from '@/constant/type'
import { getHtmlCodeSandboxParams } from './html'
import { getReactCodeSandboxParams } from './react'
import { getVueCodeSandboxParams } from './vue'

export function getCodeSandboxParams(params: PlatformParams) {
  const globalFiles = (params.templates || []).find(
    item => item.scope === 'global',
  )?.files
  const typeFiles = (params.templates || []).find(
    item => item.scope === params.type,
  )?.files
  const scopeFiles = (params.templates || []).find(
    item => item.scope === params.scope,
  )?.files
  params.customFiles = {
    ...globalFiles,
    ...typeFiles,
    ...scopeFiles,
  }
  for (const file in params.customFiles) {
    (params.customFiles[file] as unknown as { content: string }) = {
      content: (params.customFiles[file] as string) || '',
    }
  }

  if (params.type === ComponentType.VUE) {
    return getVueCodeSandboxParams(params)
  }
  if (params.type === ComponentType.REACT) {
    return getReactCodeSandboxParams(params)
  }
  if (params.type === ComponentType.HTML) {
    return getHtmlCodeSandboxParams(params)
  }
}
