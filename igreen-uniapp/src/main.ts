import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import '@/uni.scss'
import { setupComponents } from '@/components'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
setupComponents(app)
app.mount('#app')
