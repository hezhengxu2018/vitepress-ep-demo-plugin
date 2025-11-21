import type MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token'
import type { DefaultProps, VitepressDemoBoxConfig } from '../types/index'
import fs from 'node:fs'
import path from 'node:path'
import { composeComponentName, injectComponentImportScript } from './utils'

// 支持两种写法: key="value" 或 key value，使用单一命名捕获组 `value`（可能包含引号）
const titleRegex = /title(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const vuePathRegex = /vue(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const htmlPathRegex = /html(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const reactPathRegex = /react(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const descriptionRegex = /description(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const orderRegex = /order(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const selectRegex = /select(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const githubRegex = /github(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const gitlabRegex = /gitlab(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const stackblitzRegex = /stackblitz(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const codesandboxRegex = /codesandbox(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const codeplayerRegex = /codeplayer(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const scopeRegex = /scope(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
// 保持 files 的正则组结构，仅允许 = 或 空格 分割；把整体值放到命名捕获组 value 中（包含两侧引号）
const vueFilesRegex = /vueFiles(?:=|\s+)(?<value>"(?:\{(?:.|\n)*?\}|\[(?:.|\n)*?\])")/
const reactFilesRegex = /reactFiles(?:=|\s+)(?<value>"(?:\{(?:.|\n)*?\}|\[(?:.|\n)*?\])")/
const htmlFilesRegex = /htmlFiles(?:=|\s+)(?<value>"(?:\{(?:.|\n)*?\}|\[(?:.|\n)*?\])")/
const ssgRegex = /ssg(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const htmlWriteWayRegex = /htmlWriteWay(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/
const backgroundRegex = /background(?:=|\s+)(?<value>"[^"]*"|'[^']*'|[^\s"'>]+)/

function getGroupValue(m: RegExpMatchArray | null) {
  const raw = m?.groups?.value ?? ''
  if (!raw)
    return ''
  const first = raw[0]
  const last = raw[raw.length - 1]
  if ((first === '"' && last === '"') || (first === '\'' && last === '\''))
    return raw.slice(1, -1)
  return raw
}

/**
 * 编译预览组件
 * @param md
 * @param token
 * @param mdFile
 * @param config
 * @return string
 */
export function transformPreview(md: MarkdownIt, token: Token, mdFile: any, config?: VitepressDemoBoxConfig) {
  const {
    demoDir,
    tab = {},
    stackblitz = { show: false },
    codesandbox = { show: false },
    codeplayer = { show: false },
    wrapperComponentName = 'vitepress-ep-demo-box',
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

  // 获取Props相关参数（先匹配再提取值，兼容 key="value" 与 key value）
  const titleMatch = token.content.match(titleRegex)
  const vuePathMatch = token.content.match(vuePathRegex)
  const htmlPathMatch = token.content.match(htmlPathRegex)
  const reactPathMatch = token.content.match(reactPathRegex)
  const descriptionMatch = token.content.match(descriptionRegex)
  const orderMatch = token.content.match(orderRegex)
  const selectMatch = token.content.match(selectRegex)
  const githubMatch = token.content.match(githubRegex)
  const gitlabMatch = token.content.match(gitlabRegex)
  const stackblitzMatch = token.content.match(stackblitzRegex)
  const codesandboxMatch = token.content.match(codesandboxRegex)
  const codeplayerMatch = token.content.match(codeplayerRegex)
  const scopeValue = getGroupValue(token.content.match(scopeRegex)) || ''
  const vueFilesMatch = token.content.match(vueFilesRegex)
  const reactFilesMatch = token.content.match(reactFilesRegex)
  const htmlFilesMatch = token.content.match(htmlFilesRegex)
  const ssgValue = !!getGroupValue(token.content.match(ssgRegex))
  const htmlWriteWayValue = getGroupValue(token.content.match(htmlWriteWayRegex)) || 'write'
  const backgroundValue = getGroupValue(token.content.match(backgroundRegex))

  const titleValue = getGroupValue(titleMatch)
  const vuePathValue = getGroupValue(vuePathMatch)
  const htmlPathValue = getGroupValue(htmlPathMatch)
  const reactPathValue = getGroupValue(reactPathMatch)
  const descriptionValue = getGroupValue(descriptionMatch)
  const orderValue = getGroupValue(orderMatch)
  const selectValue = getGroupValue(selectMatch)
  const githubValue = getGroupValue(githubMatch)
  const gitlabValue = getGroupValue(gitlabMatch)
  const stackblitzValue = getGroupValue(stackblitzMatch)
  const codesandboxValue = getGroupValue(codesandboxMatch)
  const codeplayerValue = getGroupValue(codeplayerMatch)
  const vueFilesValue = getGroupValue(vueFilesMatch)
  const reactFilesValue = getGroupValue(reactFilesMatch)
  const htmlFilesValue = getGroupValue(htmlFilesMatch)
  const mdFilePath = mdFile.realPath ?? mdFile.path
  const dirPath = demoDir || path.dirname(mdFilePath)

  if (orderValue) {
    order = orderValue
  }
  if (selectValue) {
    select = selectValue
  }
  let github = ''
  let gitlab = ''
  if (githubValue) {
    github = githubValue
  }
  if (gitlabValue) {
    gitlab = gitlabValue
  }
  if (stackblitzValue) {
    stackblitz.show = stackblitzValue === 'true'
  }
  if (codesandboxValue) {
    codesandbox.show = codesandboxValue === 'true'
  }
  if (codeplayerValue) {
    codeplayer.show = codeplayerValue === 'true'
  }

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

  // 注入 vitepress-demo-plugin 组件和样式
  injectComponentImportScript(
    mdFile,
    'vitepress-ep-demo-plugin/theme',
    `{ VitepressDemoPlaceholder, VitepressEpDemoBox }`,
  )
  injectComponentImportScript(mdFile, 'vitepress-ep-demo-plugin/theme/styles')
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
      '{ createElement as reactCreateElement }',
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

  const placeholderVisibleKey = `__placeholder_visible_key__`

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

  function formatString(value: string) {
    return value
      .replace(/'/g, '"')
      .replace(/\\n/g, '')
      .trim()
      .replace(/^"/, '')
      .replace(/"$/, '')
      .replace(/,(\s)*\}$/, '}')
      .replace(/,(\s)*\]$/, ']')
  }

  const inputFiles = {
    vue: formatString(vueFilesValue || ''),
    react: formatString(reactFilesValue || ''),
    html: formatString(htmlFilesValue || ''),
  }

  for (const key in inputFiles) {
    const value = inputFiles[key as keyof typeof inputFiles]
    if (value) {
      try {
        const codeFiles = JSON.parse(value)
        if (Array.isArray(codeFiles)) {
          (codeFiles as string[]).forEach((file) => {
            const fileName = path.basename(file)
            files[key as keyof typeof files][fileName] = {
              filename: file,
              code: '',
            }
          })
        }
        else if (typeof codeFiles === 'object') {
          for (const file in codeFiles) {
            files[key as keyof typeof files][file] = {
              filename: codeFiles[file],
              code: '',
            }
          }
        }
        for (const file in files[key as keyof typeof files]) {
          const filePath = files[key as keyof typeof files][file].filename
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
                delete files[key as keyof typeof files][file]
              }
              else {
                files[key as keyof typeof files][file].code = code
                files[key as keyof typeof files][file].html = renderHighlightedCode(
                  code,
                  resolveLangByFile(
                    filePath,
                    fallbackLangMap[key as keyof typeof fallbackLangMap],
                  ),
                )
              }
            }
            else {
              delete files[key as keyof typeof files][file]
            }
          }
          else {
            delete files[key as keyof typeof files][file]
          }
        }
      }
      catch (_error) {
        // 格式错误，则不展示该文件
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
      : `<vitepress-demo-placeholder v-show="${placeholderVisibleKey}" />`
  }
  ${ssgValue ? '' : '<ClientOnly>'}
    <${wrapperComponentName}
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
            `
          : ''
      }
      >
      ${
        componentProps.vue
          ? `
            <template v-if="${componentName}" #vue>
              <${componentName}></${componentName}>
            </template>
            `
          : ''
      }
    </${wrapperComponentName}>
  ${ssgValue ? '' : '</ClientOnly>'}`.trim()

  return sourceCode
}
