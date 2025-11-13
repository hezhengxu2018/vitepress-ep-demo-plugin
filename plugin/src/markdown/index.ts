import type MarkdownIt from 'markdown-it'
import type Renderer from 'markdown-it/lib/renderer'
import type Token from 'markdown-it/lib/token'
import type { VitepressDemoBoxConfig } from './preview'
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
