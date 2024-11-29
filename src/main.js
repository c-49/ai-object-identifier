import { createApp } from 'vue'
import { Quasar } from 'quasar'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/dist/quasar.css'

// Assumes your root component is App.vue
import App from './App.vue'

const app = createApp(App)

app.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
})

app.mount('#app')