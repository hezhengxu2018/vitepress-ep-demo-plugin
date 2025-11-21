import type { ComponentType, PlatformType } from '@/types'
import { COMPONENT_TYPE, PLATFORM_TYPE } from '@/shared/constant'
import { getDeps } from '@/shared/utils'

interface PackageJsonParams {
  type: ComponentType
  platform: PlatformType
  code: string
  title?: string
  description?: string
}

export function getDepsByType(type: ComponentType, platform: PlatformType) {
  const deps = {
    dependencies: {} as Record<string, string>,
    devDependencies: {
      typescript: 'latest',
    } as Record<string, string>,
  }

  if (type === COMPONENT_TYPE.VUE) {
    deps.dependencies.vue = 'latest'
    if (platform === PLATFORM_TYPE.STACKBLITZ) {
      deps.devDependencies.vite = 'latest'
      deps.devDependencies['@vitejs/plugin-vue'] = 'latest'
      deps.devDependencies['@vitejs/plugin-vue-jsx'] = 'latest'
    }
    else if (platform === PLATFORM_TYPE.CODESANDBOX) {
      deps.devDependencies['@vue/cli-plugin-babel'] = 'latest'
    }
  }
  else if (type === COMPONENT_TYPE.REACT) {
    deps.dependencies.react = 'latest'
    deps.dependencies['react-dom'] = 'latest'
    deps.dependencies['@emotion/react'] = 'latest'
    deps.dependencies['@emotion/styled'] = 'latest'
    deps.devDependencies['@types/react'] = 'latest'
    deps.devDependencies['@types/react-dom'] = 'latest'
    if (platform === PLATFORM_TYPE.STACKBLITZ) {
      deps.devDependencies.vite = 'latest'
      deps.devDependencies['@vitejs/plugin-react'] = 'latest'
    }
  }
  return deps
}

export function genPackageJson(params: PackageJsonParams): string {
  const { type, platform, code, title, description } = params

  const scripts
    = platform === PLATFORM_TYPE.STACKBLITZ
      ? {
          scripts: {
            dev: 'vite',
            build: 'vite build',
            serve: 'vite preview',
          },
        }
      : {}

  const { dependencies, devDependencies } = getDepsByType(type, platform)

  const packageJson = {
    name: title,
    description,
    version: '0.0.0',
    private: true,
    ...scripts,
    dependencies: {
      ...getDeps(code),
      ...dependencies,
    },
    devDependencies: {
      ...devDependencies,
    },
  }

  return JSON.stringify(packageJson, null, 2)
}
