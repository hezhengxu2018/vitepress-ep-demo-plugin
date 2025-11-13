import { DEFAULT_NAMESPACE, EP_NAMESPACE } from '@/constant/style-prefix'

/**
 * 钩子函数使用
 * const ns = useNameSpace();
 * ns.b() => block
 * ns.e(element) => block__element
 * ns.m(modifier) => block--modifier
 * ns.bem(element,modifier) => block__element--modifier
 */
export interface UseNameSpaceReturn {
  b: () => string
  e: (element: string) => string
  m: (modifier: string) => string
  bem: (_block?: string, element?: string, modifier?: string) => string
}

function generateName(prefix: string, block?: string, element?: string, modifier?: string) {
  let defaultName = block === '' ? `${prefix}` : `${prefix}-${block}`
  if (element)
    defaultName += `__${element}`
  if (modifier)
    defaultName += `--${modifier}`
  return defaultName
}

function createUseNameSpace(prefix: string) {
  return (block: string = ''): UseNameSpaceReturn => {
    const b = () => generateName(prefix, block)
    const e = (element: string = '') => generateName(prefix, block, element)
    const m = (modifier: string = '') =>
      generateName(prefix, block, '', modifier)
    const bem = (_block?: string, element?: string, modifier?: string) =>
      generateName(prefix, _block, element, modifier)

    return {
      b,
      e,
      m,
      bem,
    }
  }
}

export function createNameSpace(prefix: string) {
  return createUseNameSpace(prefix)
}

export const useEpNameSpace = createNameSpace(EP_NAMESPACE)

export const useDefaultNameSpace = createNameSpace(DEFAULT_NAMESPACE)
