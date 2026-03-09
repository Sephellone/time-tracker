import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueFire, VueFireAuth } from 'vuefire'
import App from './App.vue'
import router from './router'
import { firebaseApp } from "./firebaseConfig";
import "./assets/main.css";
import { registerSW } from 'virtual:pwa-register'

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    // Show a prompt to user to refresh the app
    if (confirm('New content available. Reload to update?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
})
app.use(router)

app.mount('#app')
