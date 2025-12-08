# TypeScript Intellisense

The plugin ships with full TypeScript typings. Once you annotate the plugin usage, every nested configuration option exposes autocomplete and type checking.

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

After annotating with `VitepressDemoBoxConfig`, the IDE surfaces all configuration hints:

![img](/typescript-hint.png)
