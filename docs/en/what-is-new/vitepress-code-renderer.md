# Use VitePress' Built-in Code Highlighting

The plugin now relies on the Shiki instance that ships with VitePress, so demo snippets use the same highlighting style as the rest of your documentation with zero extra setup. You can also use every transformer that VitePress enables by default without registering Shiki transformers yourself.

For example:

<demo vue="../demos/demo-shiki.vue" />

If you need to extend Shiki (for example to enable `twoslash`), configure it directly in the VitePress options. Refer to the [official Shiki documentation](https://shiki.zhcndoc.com/packages/vitepress) for more details.
