import './polyfills'
import { startServiceMain } from './service-main'
import { startFrontendMain } from './frontend-main'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

const stopServiceMain = startServiceMain()
startFrontendMain(rootElement)

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    stopServiceMain()
  })
}
