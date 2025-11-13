import ElementPlus from 'element-plus'
import { VitepressEpDemoBox } from 'vitepress-demo-plugin/theme-ep'
// https://vitepress.dev/guide/custom-theme
import Theme from 'vitepress/theme'
import './style.scss'
import 'vitepress-demo-plugin/theme-ep/style.css'
import 'element-plus/dist/index.css'

export default {
  ...Theme,
  enhanceApp({ app }) {
    app.use(ElementPlus)
    app.component('vitepress-ep-demo-box', VitepressEpDemoBox)
  },
}
