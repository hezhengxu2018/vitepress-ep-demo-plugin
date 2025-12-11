import type Token from 'markdown-it/lib/token'
import type { MarkdownRenderer } from 'vitepress'
import type { CodeFiles, DefaultProps, VitepressDemoBoxConfig } from '@/types'
import fs from 'node:fs'
import path from 'node:path'
import {
  applyPlatformValue,
  composeComponentName,
  injectComponentImportScript,
  isPlainObject,
  parseDemoAttributes,
  parseFilesAttribute,
  toBoolean,
  toPathAttr,
  toStringAttr,
} from './utils'

/**
 * 编译预览组件
 * @param md
 * @param token
 * @param mdFile
 * @param config
 * @return string
 */
export function transformPreview(md: MarkdownRenderer, token: Token, mdFile: any, config?: VitepressDemoBoxConfig) {
  const demoIndexKey = '__vp_demo_index__'
  const demoIndex = (mdFile[demoIndexKey] = (mdFile[demoIndexKey] || 0) + 1)
  const {
    demoDir,
    tab = {},
    stackblitz = { show: false },
    codesandbox = { show: false },
    codeplayer = { show: false },
    wrapperComponentName = 'vitepress-demo-box',
    placeholderComponentName = 'vitepress-demo-placeholder',
    autoImportWrapper = true,
  } = config || {}
  let {
    order = 'vue,react,html',
    visible = true,
    select = (tab.order || 'vue,react,html').split(',')[0] || 'vue',
  } = tab

  const componentProps: DefaultProps = {
    vue: '',
    title: '',
    description: '',
    html: '',
    react: '',
  }

  const attributes = parseDemoAttributes(token.content)
  const {
    title: titleAttr,
    description: descriptionAttr,
    vue: vueAttr,
    html: htmlAttr,
    react: reactAttr,
    order: orderAttr,
    select: selectAttr,
    visible: visibleAttr,
    github: githubAttr,
    gitlab: gitlabAttr,
    stackblitz: stackblitzAttr,
    codesandbox: codesandboxAttr,
    codeplayer: codeplayerAttr,
    vueFiles: vueFilesAttr,
    reactFiles: reactFilesAttr,
    htmlFiles: htmlFilesAttr,
    wrapperComponentName: wrapperComponentNameAttr,
    placeholderComponentName: placeholderComponentNameAttr,
    scope: scopeAttr,
    ssg: ssgAttr,
    htmlWriteWay: htmlWriteWayAttr,
    background: backgroundAttr,
  } = attributes

  const titleValue = toStringAttr(titleAttr)
  const descriptionValue = toStringAttr(descriptionAttr)
  const vuePathValue = toPathAttr(vueAttr)
  const htmlPathValue = toPathAttr(htmlAttr)
  const reactPathValue = toPathAttr(reactAttr)
  const orderValue = toStringAttr(orderAttr)
  const selectValue = toStringAttr(selectAttr)
  const githubValue = toStringAttr(githubAttr)
  const gitlabValue = toStringAttr(gitlabAttr)
  const wrapperComponentNameValue = toStringAttr(wrapperComponentNameAttr)
  const placeholderComponentNameValue = toStringAttr(placeholderComponentNameAttr)
  const scopeValue = toStringAttr(scopeAttr)
  const ssgValue = toBoolean(ssgAttr)
  const htmlWriteWayValue = toStringAttr(htmlWriteWayAttr, 'write') || 'write'
  const backgroundValue = toStringAttr(backgroundAttr)
  const wrapperName = wrapperComponentNameValue || wrapperComponentName
  const placeholderName = placeholderComponentNameValue || placeholderComponentName
  const mdFilePath = mdFile.realPath ?? mdFile.path
  const dirPath = demoDir || path.dirname(mdFilePath)

  if (orderValue)
    order = orderValue
  if (selectValue)
    select = selectValue
  if ('visible' in attributes)
    visible = toBoolean(visibleAttr, visible)
  const github = githubValue || ''
  const gitlab = gitlabValue || ''
  applyPlatformValue(stackblitz, stackblitzAttr)
  applyPlatformValue(codesandbox, codesandboxAttr)
  applyPlatformValue(codeplayer, codeplayerAttr)

  if (vuePathValue) {
    componentProps.vue = path
      .join(dirPath, vuePathValue)
      .replace(/\\/g, '/')
  }

  if (htmlPathValue) {
    componentProps.html = path
      .join(dirPath, htmlPathValue)
      .replace(/\\/g, '/')
  }
  if (reactPathValue) {
    componentProps.react = path
      .join(dirPath, reactPathValue)
      .replace(/\\/g, '/')
  }

  componentProps.title = titleValue || ''
  componentProps.description = descriptionValue || ''

  const componentVuePath = componentProps.vue
    ? path
        .resolve(
          demoDir || path.dirname(mdFilePath),
          vuePathValue || '.',
        )
        .replace(/\\/g, '/')
    : ''
  const componentHtmlPath = componentProps.html
    ? path
        .resolve(
          demoDir || path.dirname(mdFilePath),
          htmlPathValue || '.',
        )
        .replace(/\\/g, '/')
    : ''
  const componentReactPath = componentProps.react
    ? path
        .resolve(
          demoDir || path.dirname(mdFilePath),
          reactPathValue || '.',
        )
        .replace(/\\/g, '/')
    : ''

  // 组件名

  const absolutePath = path
    .resolve(
      dirPath,
      componentProps.vue || componentProps.react || componentProps.html || '.',
    )
    .replace(/\\/g, '/')

  const componentName = composeComponentName(absolutePath)
  const reactComponentName = `react${componentName}`

  // 启用自动导入包装组件
  if (autoImportWrapper) {
    injectComponentImportScript(
      mdFile,
      'vitepress-better-demo-plugin/theme/default',
      `{ VitepressDemoPlaceholder, VitepressDemoBox }`,
    )
    injectComponentImportScript(mdFile, 'vitepress-better-demo-plugin/theme/default/style')
  }

  injectComponentImportScript(mdFile, 'vue', '{ ref, shallowRef, onMounted }')

  // 注入组件导入语句
  if (componentProps.vue) {
    injectComponentImportScript(
      mdFile,
      componentVuePath,
      componentName,
      ssgValue ? undefined : 'dynamicImport',
    )
  }
  if (componentProps.react) {
    injectComponentImportScript(
      mdFile,
      'react',
      '{ createElement as reactCreateElement, useLayoutEffect as reactUseLayoutEffect }',
    )
    injectComponentImportScript(
      mdFile,
      'react-dom/client',
      '{ createRoot as reactCreateRoot }',
    )
    injectComponentImportScript(
      mdFile,
      componentReactPath,
      reactComponentName,
      'dynamicImport',
    )
  }

  const placeholderVisibleKey = `__placeholder_visible_${componentName}_${demoIndex}__`

  // 控制 placeholder 的显示
  injectComponentImportScript(
    mdFile,
    placeholderVisibleKey,
    `const ${placeholderVisibleKey} = ref(true);`,
    'inject',
  )

  // 组件代码，动态引入以便实时更新
  const htmlCodeTempVariable = componentProps.html
    ? `TempCodeHtml${componentName}`
    : `''`
  const reactCodeTempVariable = componentProps.react
    ? `TempCodeReact${componentName}`
    : `''`
  const vueCodeTempVariable = componentProps.vue
    ? `TempCodeVue${componentName}`
    : `''`
  if (componentProps.html) {
    injectComponentImportScript(
      mdFile,
      `${componentHtmlPath}?raw`,
      htmlCodeTempVariable,
    )
  }
  if (componentProps.react) {
    injectComponentImportScript(
      mdFile,
      `${componentReactPath}?raw`,
      reactCodeTempVariable,
    )
  }
  if (componentProps.vue) {
    injectComponentImportScript(
      mdFile,
      `${componentVuePath}?raw`,
      vueCodeTempVariable,
    )
  }

  // 多文件展示
  const files = {
    vue: {} as Record<string, { code: string, filename: string, html?: string }>,
    react: {} as Record<string, { code: string, filename: string, html?: string }>,
    html: {} as Record<string, { code: string, filename: string, html?: string }>,
  }

  const highlightedCode: Record<'vue' | 'react' | 'html', string> = {
    vue: '',
    react: '',
    html: '',
  }

  const fallbackLangMap: Record<'vue' | 'react' | 'html', string> = {
    vue: 'vue',
    react: 'tsx',
    html: 'html',
  }

  const resolveLangByFile = (filePath: string, fallback: string) => {
    const ext = path.extname(filePath || '').replace('.', '').toLowerCase()
    if (!ext)
      return fallback
    const alias: Record<string, string> = {
      htm: 'html',
      mjs: 'js',
      cjs: 'js',
    }
    return alias[ext] || ext || fallback
  }

  const renderHighlightedCode = (code: string, lang: string) => {
    if (!code)
      return ''
    try {
      const fencedCode = `\`\`\` ${lang}\n${code}\n\`\`\``
      return md.render(fencedCode)
    }
    catch (_error) {
      return ''
    }
  }

  const collectHighlightedCode = (
    type: 'vue' | 'react' | 'html',
    absPath: string,
  ) => {
    if (!absPath)
      return
    try {
      if (!fs.existsSync(absPath))
        return
      let source = ''
      try {
        source = fs.readFileSync(absPath, 'utf-8')
      }
      catch (_e) {
        source = ''
      }
      if (!source) {
        highlightedCode[type] = ''
        return
      }
      highlightedCode[type] = renderHighlightedCode(
        source,
        resolveLangByFile(absPath, fallbackLangMap[type]),
      )
    }
    catch (_error) {
      highlightedCode[type] = ''
    }
  }

  const inputFiles: Record<'vue' | 'react' | 'html', CodeFiles | undefined> = {
    vue: parseFilesAttribute(vueFilesAttr),
    react: parseFilesAttribute(reactFilesAttr),
    html: parseFilesAttribute(htmlFilesAttr),
  }

  for (const key of Object.keys(inputFiles) as Array<'vue' | 'react' | 'html'>) {
    const value = inputFiles[key]
    if (!value)
      continue
    if (Array.isArray(value)) {
      value.forEach((file) => {
        const fileName = path.basename(file)
        files[key][fileName] = {
          filename: file,
          code: '',
        }
      })
    }
    else if (isPlainObject(value)) {
      for (const file in value) {
        files[key][file] = {
          filename: value[file],
          code: '',
        }
      }
    }
    for (const file in files[key]) {
      const filePath = files[key][file].filename
      if (filePath) {
        const absPath = path
          .resolve(demoDir || path.dirname(mdFilePath), filePath || '.')
          .replace(/\\/g, '/')
        if (fs.existsSync(absPath)) {
          let code = ''
          try {
            code = fs.readFileSync(absPath, 'utf-8')
          }
          catch (_e) {
            code = ''
          }
          if (!code) {
            delete files[key][file]
          }
          else {
            files[key][file].code = code
            files[key][file].html = renderHighlightedCode(
              code,
              resolveLangByFile(
                filePath,
                fallbackLangMap[key],
              ),
            )
          }
        }
        else {
          delete files[key][file]
        }
      }
      else {
        delete files[key][file]
      }
    }
  }

  // 国际化
  let locale = ''
  if (config?.locale && typeof config.locale === 'object') {
    locale = encodeURIComponent(JSON.stringify(config.locale))
  }

  if (componentVuePath) {
    collectHighlightedCode('vue', componentVuePath)
  }
  if (componentReactPath) {
    collectHighlightedCode('react', componentReactPath)
  }
  if (componentHtmlPath) {
    collectHighlightedCode('html', componentHtmlPath)
  }

  const encodedCodeHighlights = encodeURIComponent(
    JSON.stringify(highlightedCode),
  )

  const sourceCode = `
  ${
    ssgValue
      ? ''
      : `<${placeholderName} v-show="${placeholderVisibleKey}" />`
  }
  ${ssgValue ? '' : '<ClientOnly>'}
    <${wrapperName}
      v-show="!${placeholderVisibleKey}"
      title="${componentProps.title}"
      description="${componentProps.description}"
      locale="${locale}"
      select="${select}"
      order="${order}"
      github="${github}"
      gitlab="${gitlab}"
      theme="${config?.theme || ''}"
      lightTheme="${config?.lightTheme || ''}"
      darkTheme="${config?.darkTheme || ''}"
      stackblitz="${encodeURIComponent(JSON.stringify(stackblitz))}"
      codesandbox="${encodeURIComponent(JSON.stringify(codesandbox))}"
      codeplayer="${encodeURIComponent(JSON.stringify(codeplayer))}"
      files="${encodeURIComponent(JSON.stringify(files))}"
      codeHighlights="${encodedCodeHighlights}"
      scope="${scopeValue || ''}"
      htmlWriteWay="${htmlWriteWayValue}"
      background="${backgroundValue}"
      :visible="!!${visible}"
      @mount="() => { ${placeholderVisibleKey} = false; }"
      ${
        componentProps.html
          ? `
            :htmlCode="${htmlCodeTempVariable}"
            `
          : ''
      }
      ${
        componentProps.vue
          ? `
            :vueCode="${vueCodeTempVariable}"
            `
          : ''
      }
      ${
        componentProps.react
          ? `
            :reactCode="${reactCodeTempVariable}"
            :reactComponent="${reactComponentName}"
            :reactCreateRoot="reactCreateRoot"
            :reactCreateElement="reactCreateElement"
            :reactUseLayoutEffect="reactUseLayoutEffect"
            `
          : ''
      }
      >
      ${
        componentProps.vue
          ? `
            <template v-if="${componentName}" #vue>
              <${componentName} @vue:mounted="() => { ${placeholderVisibleKey} = false; }"></${componentName}>
            </template>
            `
          : ''
      }
    </${wrapperName}>
  ${ssgValue ? '' : '</ClientOnly>'}`.trim()

  return sourceCode
}
