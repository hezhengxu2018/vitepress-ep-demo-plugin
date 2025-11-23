import type { MarkdownRenderer as VitepressMarkdownRenderer } from 'vitepress'

type MarkdownRenderRule = NonNullable<VitepressMarkdownRenderer['renderer']['rules']['html_inline']>

export type MarkdownRenderer = VitepressMarkdownRenderer
export type MarkdownRule = MarkdownRenderRule
export type MarkdownTokens = Parameters<MarkdownRenderRule>[0]
export type MarkdownToken = MarkdownTokens[number]
export type MarkdownRuleOptions = Parameters<MarkdownRenderRule>[2]
export type MarkdownEnv = Parameters<MarkdownRenderRule>[3]
export type MarkdownRuleRenderer = Parameters<MarkdownRenderRule>[4]
