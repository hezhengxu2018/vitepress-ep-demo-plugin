# 使用Vitepress内置的代码染色

现在插件使用了Vitepress内置的shiki进行代码染色，即组件demo的代码渲染效果会和文档的代码渲染保持一致，不需要进行额外的配置。
这也意味着可以直接在代码中使用Vitepress已经默认启用的转换器，不需要额外配置shiki的[transformers](https://shiki.zhcndoc.com/packages/transformers)
例如：

<demo vue="../demos/demo-shiki.vue" />

同样的，如果需要扩展shiki（如`twoslash`）则需要在vitepress的配置项中进行配置。可以参考[shiki的官方文档](https://shiki.zhcndoc.com/packages/vitepress)
