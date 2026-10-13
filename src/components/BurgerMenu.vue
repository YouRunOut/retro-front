<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onBeforeUnmount } from 'vue'
import { useLocale } from '../composables/useLocale'
import { useErrorModal } from '../composables/useErrorModal'
import { fetchTags, fetchTracksByTag } from '../api/tags.api'
import type { TagInfo } from '../api/tags.api'
import * as actions from '../core/actions'
import { setState, useState } from '../core/store'
import SettingsPage from './SettingsPage.vue'
import FilterSettings from './FilterSettings.vue'
import DownloadPage from './DownloadPage.vue'
import AboutPage from './AboutPage.vue'
import ContactPage from './ContactPage.vue'
import ChangelogPage from './ChangelogPage.vue'
import ToggleSwitch from './ToggleSwitch.vue'

const { t } = useLocale()

type Page = 'menu' | 'about' | 'contact' | 'download' | 'settings' | 'changelog' | 'player' | 'filters'

const isOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const activePage = ref<Page>('menu')
const tags = ref<TagInfo[]>([])
const selectedTags = ref<Set<number>>(new Set())
const savedTagIds = ref<number[]>([])

const selectedTagsChanged = computed(() => {
  const current = Array.from(selectedTags.value)
  if (savedTagIds.value.length !== current.length) return true
  return !savedTagIds.value.every(id => current.includes(id))
})

const showFloating = ref(false)
const isFloatingLeaving = ref(false)

const shouldShowFloating = computed(() =>
  isOpen.value && activePage.value === 'player' && useState.playerMode === 'classic' && !isTagActionsVisible.value && tags.value.length
)

watch(shouldShowFloating, (val) => {
  if (val) {
    isFloatingLeaving.value = false
    showFloating.value = true
  } else if (showFloating.value) {
    isFloatingLeaving.value = true
    setTimeout(() => {
      showFloating.value = false
      isFloatingLeaving.value = false
    }, 250)
  }
}, { immediate: true })

const sentinelRef = ref<HTMLElement | null>(null)
const isTagActionsVisible = ref(true)
let tagObserver: IntersectionObserver | null = null

function initTagObserver() {
  disconnectTagObserver()
  const el = sentinelRef.value
  if (!el) {
    isTagActionsVisible.value = true
    return
  }
  const root = el.closest('.page-content')
  tagObserver = new IntersectionObserver(
    ([entry]) => { isTagActionsVisible.value = entry.isIntersecting },
    { root, threshold: 0 }
  )
  tagObserver.observe(el)
}

function disconnectTagObserver() {
  if (tagObserver) {
    tagObserver.disconnect()
    tagObserver = null
  }
}

watch(sentinelRef, (el) => {
  if (el) {
    nextTick(initTagObserver)
  } else {
    disconnectTagObserver()
    isTagActionsVisible.value = true
  }
})

const modeOptions = computed(() => [
  { value: 'classic', label: t('settings.classic') },
  { value: 'flow', label: t('settings.flow'), badge: 'BETA' },
])

const focusableSelectors = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusable(): HTMLElement[] {
  const panel = menuRef.value?.querySelector('.menu-panel') as HTMLElement
  if (!panel) return []
  return Array.from(panel.querySelectorAll<HTMLElement>(focusableSelectors))
}

function focusFirst() {
  nextTick(() => {
    const items = getFocusable()
    items[0]?.focus()
  })
}

const STORAGE_KEY = 'selectedTagIds'

function loadSavedTags(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveTags(ids: number[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch { /* noop */ }
}

function clearSavedTags() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('selectedTagNames')
  } catch { /* noop */ }
}

const TAG_COLORS = [
  '#b87878', '#b89168', '#b0a658', '#9bb258', '#82b668',
  '#70b870', '#62b880', '#5ab59a', '#5aadad', '#5e9eb8',
  '#7280b8', '#9070b8', '#aa62b8', '#b85ca0', '#b85c82',
]

function pickTagColor(id: number): string {
  return TAG_COLORS[id % TAG_COLORS.length]
}

async function loadTags() {
  setState({ loading: true })
  try {
    const raw = await fetchTags()
    tags.value = raw.map(t => ({
      ...t,
      color: t.color || pickTagColor(t.id),
    }))
    savedTagIds.value = loadSavedTags()
    selectedTags.value = new Set(savedTagIds.value)
  } catch {
    tags.value = []
    useErrorModal().showError({
      title: useState.language === 'en' ? 'Tags Error' : 'Ошибка тегов',
      message: useState.language === 'en'
        ? 'Failed to load tags'
        : 'Не удалось загрузить теги',
      details: '',
    })
  } finally {
    setState({ loading: false })
  }
}

function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    focusFirst()
  } else {
    activePage.value = 'menu'
  }
}

function close() {
  isOpen.value = false
  activePage.value = 'menu'
}

async function openPage(page: Page) {
  if (page === 'player' && useState.playerMode === 'classic') {
    await loadTags()
  }
  activePage.value = page
  focusFirst()
}

function backToMenu() {
  activePage.value = 'menu'
}

function toggleTag(id: number) {
  const next = new Set(selectedTags.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  selectedTags.value = next
}

async function confirmTags() {
  const selected = tags.value.filter(t => selectedTags.value.has(t.id)).map(t => t.name)
  if (!selected.length) return
  savedTagIds.value = Array.from(selectedTags.value)
  saveTags(savedTagIds.value)
  localStorage.setItem('selectedTagNames', JSON.stringify(selected))
  setState({ isTagFiltered: true, tagNames: selected })
  actions.pausePlayback()
  setState({ loading: true })
  try {
    const tracks = await fetchTracksByTag(selected)
    setState({ loading: false })
    if (!tracks.length) return
    setState({ tracks, currentIndex: 0, isPlaying: false })
    actions.togglePlay()
  } catch {
    setState({ loading: false })
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' || e.key === 'Backspace') {
    if (!isOpen.value) return
    if (activePage.value === 'menu') {
      close()
    } else {
      backToMenu()
    }
    return
  }
  if (!isOpen.value) return

  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    const items = getFocusable()
    const current = document.activeElement
    const idx = items.indexOf(current as HTMLElement)
    let next: number
    if (e.key === 'ArrowDown') {
      next = (idx + 1) % items.length
    } else {
      next = (idx - 1 + items.length) % items.length
    }
    items[next]?.focus()
  }

  if (e.key === 'Tab') {
    const items = getFocusable()
    if (!items.length) return
    const current = document.activeElement
    const idx = items.indexOf(current as HTMLElement)
    if (e.shiftKey) {
      if (idx <= 0) {
        e.preventDefault()
        items[items.length - 1].focus()
      }
    } else {
      if (idx === items.length - 1 || idx === -1) {
        e.preventDefault()
        items[0].focus()
      }
    }
  }
}

function onClickOutside(e: MouseEvent) {
  if (isOpen.value && menuRef.value && !menuRef.value.contains(e.target as Node)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('mousedown', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('mousedown', onClickOutside)
  disconnectTagObserver()
})
</script>

<template>
  <div class="burger-menu" ref="menuRef">
    <button
      class="burger-btn unselectable"
      :class="{ open: isOpen }"
      @click="toggle"
      :aria-label="t('menu.openMenu')"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <Transition name="slide">
      <nav v-if="isOpen" class="menu-panel">
        <Transition name="fade" mode="out-in">
          <div v-if="activePage === 'menu'" key="menu" class="page">
            <div class="page-content unselectable">
              <ul>
                <li><a class="unselectable" href="#" @click.prevent="openPage('player')">{{ t('menu.player') }}<span v-if="useState.isTagFiltered" class="badge">{{ t('menu.tagActive') }}</span></a></li>
                <li><a class="unselectable" href="#" @click.prevent="openPage('settings')">{{ t('menu.settings') }}</a></li>
                <li><a class="unselectable" href="#" @click.prevent="openPage('download')">{{ t('menu.download') }}</a></li>
                <li><a class="unselectable" href="#" @click.prevent="openPage('changelog')">{{ t('menu.changelog') }}</a></li>
                <li><a class="unselectable" href="#" @click.prevent="openPage('contact')">{{ t('menu.contacts') }}</a></li>
                <li><a class="unselectable" href="#" @click.prevent="openPage('about')">{{ t('menu.about') }}</a></li>
              </ul>
            </div>
          </div>

          <div v-else-if="activePage === 'player'" key="player" class="page">
            <div class="page-content unselectable">
              <button class="back-btn unselectable" @click="backToMenu"><img class="back-arrow" src="/nav-back-arrow.svg" alt="" /> {{ t('common.back') }}</button>
              <h3>{{ t('menu.player') }}</h3>

              <div class="settings-group">
                <label class="settings-label">{{ t('settings.playerMode') }}</label>
                <ToggleSwitch
                  :model-value="useState.playerMode"
                  :options="modeOptions"
                  @update:model-value="async (val: string) => {
                    await actions.setPlayerMode(val as 'classic' | 'flow')
                    if (val === 'classic') loadTags()
                  }"
                />
              </div>

              <template v-if="useState.playerMode === 'classic'">
                <h4>{{ t('menu.playlist') }}</h4>

                <div ref="sentinelRef" class="tag-actions-sentinel"></div>
                <div v-if="tags.length" class="tag-actions">
                  <Transition name="fade-slide">
                    <button v-if="selectedTagsChanged" class="action-btn confirm-btn unselectable" @click="confirmTags">
                      {{ t('tag.play') }}
                      <svg viewBox="0 0 956.199 956.199" width="18" height="18" style="transform: scaleX(-1); fill: currentColor">
                        <path d="M859.649,385.6h-255.2L680.05,310c35.1-35.1,35.1-92.1,0-127.3c-35.101-35.1-92.101-35.1-127.3,0L323.449,412c-21.6,22.6-32.199,55.3-23.6,85.9c2.3,8.299,5.8,17.5,10.5,24.799c3.9,6,8.4,11.201,13.1,16.602l234.2,234.199c17.601,17.6,40.601,26.4,63.601,26.4s46.1-8.801,63.6-26.4c35.1-35.1,35.1-92.1,0-127.301l-80.6-80.6h255.1c49.7,0,90-40.299,90-90C949.35,425.9,909.35,385.6,859.649,385.6z"/>
                        <path d="M96.85,0c-49.7,0-90,40.3-90,90v776.199c0,49.701,40.3,90,90,90s90-40.299,90-90V90C186.85,40.3,146.55,0,96.85,0z"/>
                      </svg>
                    </button>
                  </Transition>
                  <Transition name="fade-slide">
                    <button
                      v-if="selectedTags.size || useState.isTagFiltered"
                      class="action-btn reset-tags-btn unselectable"
                      @click="savedTagIds = []; clearSavedTags(); selectedTags = new Set(); if (useState.isTagFiltered) { setState({ tagNames: [] }); actions.resetToShuffled() }"
                    >
                      {{ selectedTags.size ? t('tag.clear') : t('menu.reset') }}
                      <svg viewBox="0 0 956.199 956.199" width="18" height="18" fill="currentColor">
                        <path d="M859.649,385.6h-255.2L680.05,310c35.1-35.1,35.1-92.1,0-127.3c-35.101-35.1-92.101-35.1-127.3,0L323.449,412c-21.6,22.6-32.199,55.3-23.6,85.9c2.3,8.299,5.8,17.5,10.5,24.799c3.9,6,8.4,11.201,13.1,16.602l234.2,234.199c17.601,17.6,40.601,26.4,63.601,26.4s46.1-8.801,63.6-26.4c35.1-35.1,35.1-92.1,0-127.301l-80.6-80.6h255.1c49.7,0,90-40.299,90-90C949.35,425.9,909.35,385.6,859.649,385.6z"/>
                        <path d="M96.85,0c-49.7,0-90,40.3-90,90v776.199c0,49.701,40.3,90,90,90s90-40.299,90-90V90C186.85,40.3,146.55,0,96.85,0z"/>
                      </svg>
                    </button>
                  </Transition>
                </div>

                <div class="tag-divider"></div>

                <div class="tag-list" :style="{ '--font-block': useState.currentFont }">
                  <button
                    v-for="tagItem in tags"
                    :key="tagItem.id"
                    class="tag-btn unselectable"
                    :class="{ active: selectedTags.has(tagItem.id) }"
                    :style="tagItem.color ? { '--tag-color': tagItem.color } : undefined"
                    @click="toggleTag(tagItem.id)"
                  >
                    {{ tagItem.name }}
                    <span v-if="tagItem.trackCount != null" class="tag-count">{{ tagItem.trackCount }}</span>
                  </button>
                </div>
                <p v-if="!tags.length" class="tag-empty">{{ t('tag.noTags') }}</p>
              </template>
            </div>
          </div>

          <SettingsPage v-else-if="activePage === 'settings'" key="settings" @back="backToMenu" @navigate="(page: string) => openPage(page as Page)" />
          <FilterSettings v-else-if="activePage === 'filters'" key="filters" @back="() => activePage = 'settings'" />
          <DownloadPage v-else-if="activePage === 'download'" key="download" @back="backToMenu" />
          <AboutPage v-else-if="activePage === 'about'" key="about" @back="backToMenu" />
          <ContactPage v-else-if="activePage === 'contact'" key="contact" @back="backToMenu" />
          <ChangelogPage v-else-if="activePage === 'changelog'" key="changelog" @back="backToMenu" />
        </Transition>
      </nav>
    </Transition>

    <div class="floating-actions-wrapper">
      <div
        v-if="showFloating"
        class="floating-actions"
        :class="{ leaving: isFloatingLeaving }"
      >
        <Transition name="fade-slide" appear>
          <button v-if="selectedTagsChanged" class="action-btn confirm-btn unselectable" @click="confirmTags">
            <span class="btn-label">{{ t('tag.play') }}</span>
            <svg viewBox="0 0 956.199 956.199" width="22" height="22" style="transform: scaleX(-1); fill: currentColor">
              <path d="M859.649,385.6h-255.2L680.05,310c35.1-35.1,35.1-92.1,0-127.3c-35.101-35.1-92.101-35.1-127.3,0L323.449,412c-21.6,22.6-32.199,55.3-23.6,85.9c2.3,8.299,5.8,17.5,10.5,24.799c3.9,6,8.4,11.201,13.1,16.602l234.2,234.199c17.601,17.6,40.601,26.4,63.601,26.4s46.1-8.801,63.6-26.4c35.1-35.1,35.1-92.1,0-127.301l-80.6-80.6h255.1c49.7,0,90-40.299,90-90C949.35,425.9,909.35,385.6,859.649,385.6z"/>
              <path d="M96.85,0c-49.7,0-90,40.3-90,90v776.199c0,49.701,40.3,90,90,90s90-40.299,90-90V90C186.85,40.3,146.55,0,96.85,0z"/>
            </svg>
          </button>
        </Transition>
        <Transition name="fade-slide" appear>
          <button
            v-if="selectedTags.size || useState.isTagFiltered"
            class="action-btn reset-tags-btn unselectable"
            @click="savedTagIds = []; clearSavedTags(); selectedTags = new Set(); if (useState.isTagFiltered) { setState({ tagNames: [] }); actions.resetToShuffled() }"
          >
            <span class="btn-label">{{ selectedTags.size ? t('tag.clear') : t('menu.reset') }}</span>
            <svg viewBox="0 0 956.199 956.199" width="22" height="22" fill="currentColor">
              <path d="M859.649,385.6h-255.2L680.05,310c35.1-35.1,35.1-92.1,0-127.3c-35.101-35.1-92.101-35.1-127.3,0L323.449,412c-21.6,22.6-32.199,55.3-23.6,85.9c2.3,8.299,5.8,17.5,10.5,24.799c3.9,6,8.4,11.201,13.1,16.602l234.2,234.199c17.601,17.6,40.601,26.4,63.601,26.4s46.1-8.801,63.6-26.4c35.1-35.1,35.1-92.1,0-127.301l-80.6-80.6h255.1c49.7,0,90-40.299,90-90C949.35,425.9,909.35,385.6,859.649,385.6z"/>
              <path d="M96.85,0c-49.7,0-90,40.3-90,90v776.199c0,49.701,40.3,90,90,90s90-40.299,90-90V90C186.85,40.3,146.55,0,96.85,0z"/>
            </svg>
          </button>
        </Transition>
      </div>
    </div>
  </div>
</template>
