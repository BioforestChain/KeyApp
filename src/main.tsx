import './polyfills'
import { startServiceMain } from './service-main'
import { startFrontendMain } from './frontend-main'

// 禁用右键菜单（移动端 App 体验）
document.addEventListener('contextmenu', (e) => e.preventDefault())

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

const stopServiceMain = startServiceMain()
startFrontendMain(rootElement)

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    stopServiceMain()
  })
}
