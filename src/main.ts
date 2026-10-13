import { createApp } from 'vue'
import { createHead } from '@unhead/vue/client'
import App from './App.vue'

import './styles/main.css'
import './styles/fonts.css'
import './styles/player.css'
import './styles/errorMOdal.css'
import './styles/dropdown.css'
import './styles/burgerMenu.css'
import './styles/tagPage.css'

const app = createApp(App)
const head = createHead()
app.use(head)
app.mount('#app')
