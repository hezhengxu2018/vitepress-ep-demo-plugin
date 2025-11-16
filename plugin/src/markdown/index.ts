import type MarkdownIt from 'markdown-it'
import type MarkdownItContainer from 'markdown-it-container'
import type Renderer from 'markdown-it/lib/renderer'
import type Token from 'markdown-it/lib/token'
import type { VitepressDemoBoxConfig } from './preview'
import fs from 'node:fs'
import path from 'node:path'
import { transformPreview } from './preview'
import { demoReg } from './utils'

export function vitepressDemoPlugin(md: MarkdownIt & any, params?: VitepressDemoBoxConfig) {
  const defaultHtmlInlineRender = md.renderer.rules.html_inline!
  const defaultHtmlBlockRender = md.renderer.rules.html_block!
  md.renderer.rules.html_inline = (
    tokens: Token[],
    idx: number,
    options: MarkdownIt.Options,
    mdFile: any,
    self: Renderer,
  ) => {
    const token = tokens[idx]
    // 删除注释使注释的 demo 不生效
    token.content = token.content.replace(/<!--[\s\S]*?-->/g, '')
    if (demoReg.some(reg => reg.test(token.content))) {
      return transformPreview(md, token, mdFile, params)
    }
    return defaultHtmlInlineRender(tokens, idx, options, mdFile, self)
  }

  md.renderer.rules.html_block = (
    tokens: Token[],
    idx: number,
    options: MarkdownIt.Options,
    mdFile: any,
    self: Renderer,
  ) => {
    const token = tokens[idx]
    // 删除注释使注释的 demo 不生效
    token.content = token.content.replace(/<!--[\s\S]*?-->/g, '')
    if (demoReg.some(reg => reg.test(token.content))) {
      return transformPreview(md, token, mdFile, params)
    }
    return defaultHtmlBlockRender(tokens, idx, options, mdFile, self)
  }
}

export function createDemoContainer(md: MarkdownIt): MarkdownItContainer.ContainerOpts {
  return {
    validate(params) {
      return !!/^demo.*$/.test(params.trim())
    },
    render(tokens, idx) {
      const m = tokens[idx].info.trim().match(/^demo.*$/)
      if (tokens[idx].nesting === 1 /* means the tag is opening */) {
        const description = m && m.length > 1 ? m[1] : ''
        const sourceFileToken = tokens[idx + 2]
        let source = ''
        const sourceFile = sourceFileToken.children?.[0].content ?? ''
        if (sourceFileToken.type === 'inline') {
          source = fs.readFileSync(
            path.resolve('./docs/zh-CN/demos', `${sourceFile}.vue`),
            'utf8',
          )
        }
        if (!source)
          throw new Error(`Incorrect source file: ${sourceFile}`)

        return `<ClientOnly> <Demo source="${encodeURIComponent(
          md.render(`\`\`\` vue\n${source}\`\`\``),
        )}" path="${sourceFile}" raw-source="${encodeURIComponent(
          source,
        )}" description="${encodeURIComponent(md.render(description))}">
  <template #source><formily-ep-${sourceFile.replaceAll('/', '-')}/></template>`
      }
      else {
        return '</Demo>\n </ClientOnly>'
      }
    },

  }
}
