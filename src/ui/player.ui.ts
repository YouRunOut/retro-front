import * as actions from '../core/actions'
import { subscribe } from '../core/store'

export function createPlayer(container: HTMLElement) {
  // создаём DOM для плеера
  container.innerHTML = `
    <div id="player">
      <img id="cover" src="" alt="Cover">
      
      <div class="controls">
        <button id="prev">⏮</button>
        <button id="play">▶</button>
        <button id="next">⏭</button>
      </div>
      <div id="time">00:00</div>
      <div id="title">No track</div>
    </div>
  `

  const playBtn = container.querySelector<HTMLButtonElement>('#play')!
  const nextBtn = container.querySelector<HTMLButtonElement>('#next')!
  const prevBtn = container.querySelector<HTMLButtonElement>('#prev')!
  const titleEl = container.querySelector<HTMLDivElement>('#title')!
  const coverEl = container.querySelector<HTMLImageElement>('#cover')!

  // события кнопок
  playBtn.onclick = actions.togglePlay
  nextBtn.onclick = actions.next
  prevBtn.onclick = actions.prev

  // подписка на state
  subscribe(state => {
    const track = state.tracks[state.currentIndex]
    if (track) {
      titleEl.textContent = track.title
      // обложку пока фиктивную, можно потом из track.cover
      coverEl.src = track.cover || '/tracks/default.jpg'
    }
    playBtn.textContent = state.isPlaying ? '⏸' : '▶'
  })
}
