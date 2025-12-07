import ElementPlus from 'element-plus'
import { VitepressEpDemoBox, VitepressEpDemoPlaceholder } from 'vitepress-better-demo-plugin/theme/element-plus'
import Theme from 'vitepress/theme'
import './style.scss'
import 'element-plus/dist/index.css'

export default {
  ...Theme,
  enhanceApp({ app }) {
    app.use(ElementPlus)
    app.component('VitepressEpDemoBox', VitepressEpDemoBox)
    app.component('VitepressEpDemoPlaceholder', VitepressEpDemoPlaceholder)
  },
} as typeof Theme
