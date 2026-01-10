import { createApp } from 'vue'
import { createPinia } from 'pinia'
import mdiVue from "mdi-vue/v3";
import * as mdijs from "@mdi/js";
import { VueFire, VueFireAuth } from 'vuefire'
import App from './App.vue'
import router from './router'
import { firebaseApp } from "./firebaseConfig";
import "./assets/main.css";

const app = createApp(App)

app.use(createPinia())
app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
})
app.use(mdiVue, {
  icons: mdijs,
});
app.use(router)

app.mount('#app')
