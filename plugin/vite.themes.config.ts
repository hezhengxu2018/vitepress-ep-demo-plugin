import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { DEFAULT_NAMESPACE, EP_NAMESPACE } from './src/shared/constant/style-prefix'

const themes = ['element-plus']

const entries = {
  index: resolve(__dirname, 'src/index.ts'),
  ...Object.fromEntries(
    themes.map(name => [name, resolve(__dirname, `src/components/${name}/index.ts`)]),
  ),
}

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `$defaultPrefix: '${DEFAULT_NAMESPACE}';$epPrefix: '${EP_NAMESPACE}';`,
      },
    },
  },
  plugins: [vue()],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: entries,
      formats: ['es'],
      // 入口 JS 路径按名字映射
      fileName: (_fmt, name) => (name === 'index'
        ? 'index.js'
        : `theme/${name}/index.js`),
    },
    rollupOptions: {
      external: ['vue', 'vitepress', /^vitepress\/.*/, 'element-plus', 'node:fs', 'node:path'],
      output: {
        exports: 'named',
        chunkFileNames: (chunkInfo) => {
          console.log(chunkInfo)
          return 'shared/[name]-[hash].js'
        },
        assetFileNames: (asset) => {
          const name = asset.name || ''
          if (name.includes('element-plus'))
            return 'theme/element-plus/[name][extname]'
          return 'theme/element-plus/style[extname]' // 默认+核心 CSS
        },
      },
    },
  },
})
