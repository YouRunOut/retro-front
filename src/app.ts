import { initApp } from './core/actions'
import { createPlayer } from './ui/player.ui'
import './styles/main.css'
import './styles/player.css'

// 1. инициализируем state и треки
initApp()

// 2. получаем контейнер на странице
const appContainer = document.querySelector<HTMLDivElement>('#app')
if (appContainer) {
  createPlayer(appContainer)
}
