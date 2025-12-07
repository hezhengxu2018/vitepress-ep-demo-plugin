# Typescript 类型提示

插件目前提供了完整的类型提示，当标注了类型之后即使深层的配置项也可以获取完整的类型提示。

```ts
import type MarkdownIt from 'markdown-it'
import type { VitepressDemoBoxConfig } from 'vitepress-better-demo-plugin' // [!code focus]
import { vitepressDemoPlugin } from 'vitepress-better-demo-plugin'
import { defineConfig } from 'vitepress'

export default defineConfig({
  // ...
  markdown: {
    config(md: MarkdownIt) {
      md.use<VitepressDemoBoxConfig>(vitepressDemoPlugin, { // [!code focus]
        // ...
      })
    },
  },
})
```

在标注了`VitepressDemoBoxConfig`类型后即可获取配置项的提示：

![img](/typescript-hint.png)
