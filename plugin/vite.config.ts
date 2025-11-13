import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { DEFAULT_NAMESPACE, EP_NAMESPACE } from './src/constant/style-prefix'

export default defineConfig(({ mode }) => {
  const isWatchMode = process.argv.includes('--watch')
  const isEpBuild = mode === 'theme-ep'
  const libEntry = resolve(
    __dirname,
    isEpBuild ? './src/theme-ep.ts' : './src/index.ts',
  )
  const libName = isEpBuild ? 'demoBoxEp' : 'demoBox'
  const fileName = isEpBuild ? 'theme-ep' : 'index'

  return {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `$defaultPrefix: '${DEFAULT_NAMESPACE}'; $epPrefix: '${EP_NAMESPACE}';`,
        },
      },
    },
    build: {
      lib: {
        entry: libEntry,
        name: libName,
        fileName,
        formats: isEpBuild ? ['es'] : ['es', 'umd'],
      },
      rollupOptions: {
        external: [
          'vue',
          'markdown-it',
          'fs',
          'path',
          'react',
          'react-dom',
          'sass',
          'shiki',
          'element-plus',
        ],
        output: {
          globals: {
            vue: 'Vue',
            fs: 'fs',
            path: 'path',
            shiki: 'shiki',
          },
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'style.css') {
              return isEpBuild ? 'theme-ep.css' : 'style.css'
            }
            return 'assets/[name][extname]'
          },
        },
      },
      emptyOutDir: !isWatchMode && !isEpBuild,
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    plugins: [
      vue(),
      dts({
        entryRoot: 'src/markdown',
        rollupTypes: true,
        strictOutput: true,
      }),
    ],
  }
})
