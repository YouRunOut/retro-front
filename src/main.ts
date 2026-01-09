import './styles/main.css'
import './styles/player.css'

import { initApp } from './core/actions'
import { createPlayer } from './ui/player.ui'

// контейнер для плеера
const appContainer = document.querySelector<HTMLDivElement>('#app')!

// создаём плеер
createPlayer(appContainer)

// инициализация состояния
initApp()
