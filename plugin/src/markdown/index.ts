import type Token from 'markdown-it/lib/token'
import type { MarkdownRenderer } from 'vitepress'
import type {
  MarkdownRule,
  VitepressDemoBoxConfig,
} from '@/types'
import fs from 'node:fs'
import path from 'node:path'
import { transformPreview } from './preview'
import { demoReg } from './utils'

export function vitepressDemoPlugin(md: MarkdownRenderer, params?: VitepressDemoBoxConfig) {
  const defaultHtmlInlineRender = md.renderer.rules.html_inline!
  const defaultHtmlBlockRender = md.renderer.rules.html_block!

  const htmlInlineRule: MarkdownRule = (tokens, idx, options, mdFile, self) => {
    const token = tokens[idx]
    // 删除注释使注释的 demo 不生�?
    token.content = token.content.replace(/<!--[\s\S]*?-->/g, '')
    if (demoReg.some(reg => reg.test(token.content))) {
      return transformPreview(md, token, mdFile, params)
    }
    return defaultHtmlInlineRender(tokens, idx, options, mdFile, self)
  }

  md.renderer.rules.html_inline = htmlInlineRule

  const htmlBlockRule: MarkdownRule = (tokens, idx, options, mdFile, self) => {
    const token = tokens[idx]
    // 删除注释使注释的 demo 不生效
    token.content = token.content.replace(/<!--[\s\S]*?-->/g, '')
    if (demoReg.some(reg => reg.test(token.content))) {
      return transformPreview(md, token, mdFile, params)
    }
    return defaultHtmlBlockRender(tokens, idx, options, mdFile, self)
  }

  md.renderer.rules.html_block = htmlBlockRule
}

interface ContainerOptions {
  marker?: string | undefined
  validate?: (params: string) => boolean
  render?: (
    tokens: Token[],
    index: number,
    options: any,
    env: any,
    self: MarkdownRenderer,
  ) => string
}

export function createDemoContainer(md: MarkdownRenderer, params?: VitepressDemoBoxConfig): ContainerOptions {
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
        console.log('sourceFile', sourceFile)
        console.log('sourceFileToken', sourceFileToken)
        // if (sourceFileToken.type === 'inline') {
        //   source = fs.readFileSync(
        //     path.resolve('./docs/zh-CN/demos', `${sourceFile}.vue`),
        //     'utf8',
        //   )
        // }
        // if (!source)
        //   throw new Error(`Incorrect source file: ${sourceFile}`)

        return `<div class="demo-box"> demo-box`
      }
      else {
        return '</div>'
      }
    },

  }
}
