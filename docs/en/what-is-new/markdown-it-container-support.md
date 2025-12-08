# markdown-it-container Syntax Support

You can now use `vitepress-better-demo-plugin` through the markdown-it-container syntax. Install `markdown-it-container`, import `createDemoContainer`, and register it as a markdown-it plugin before using it.

```ts
import { defineConfig } from 'vitepress';
import mdContainer from 'markdown-it-container' // [!code ++]
import { createDemoContainer } from 'vitepress-better-demo-plugin'; // [!code ++]
import path from 'path';

export default defineConfig({
  // other configs...
  markdown: {
    config(md) {
      md.use(mdContainer, 'demo', createDemoContainer(md, { // [!code ++]
        // ...
        demoDir: path.resolve(
          dirname(fileURLToPath(import.meta.url)),
          '../demos',
        ),
      }))
    },
  },
});
```

After the registration you can switch from the old syntax to markdown-it-container blocks, for example:

```md
::: demo
vue="../demos/demo.vue"
:::
```

Rendered result:

::: demo
vue="../demos/demo.vue"
:::

All options can be separated with either `=` or a whitespace. Both forms are equivalent and quotes can be omitted when the value does not contain spaces.

```md
::: demo
vue ../demos/demo.vue
:::
```

::: demo
vue "../demos/demo.vue"
:::

The plugin aligns with the element-plus documentation. If the first line inside the container does not contain `=` or a whitespace separator, it is treated as the path to a Vue demo and the `.vue` suffix can be omitted. The snippet above can therefore be shortened to:

```md
::: demo
../demos/demo
:::
```

This simplification only applies to Vue demos. It matches the element-plus convention and optimizes for the most common use case of this plugin.
