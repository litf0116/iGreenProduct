import { createApp } from 'vue'
import App from './App.vue'
import { setupComponents } from '@/components'
import { setupUni } from '@dcloudio/uni-h5'

// 初始化 uni-app H5 环境
setupUni()

const app = createApp(App)
setupComponents(app)
app.mount('#app')
