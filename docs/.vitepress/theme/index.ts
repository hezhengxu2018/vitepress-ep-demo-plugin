import ElementPlus from 'element-plus'
// https://vitepress.dev/guide/custom-theme
import Theme from 'vitepress/theme'
import './style.scss'
import 'element-plus/dist/index.css'

export default {
  ...Theme,
  enhanceApp({ app }) {
    app.use(ElementPlus)
  },
} as typeof Theme
