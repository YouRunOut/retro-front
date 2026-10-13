import { computed } from 'vue'
import { useState, setState } from '../core/store'
import type { Language } from '../types/state'
import ru from '../locales/ru'
import en from '../locales/en'

const locales = { ru, en }
type Messages = typeof ru

function resolve(path: string, messages: Messages): string {
  let obj: any = messages
  for (const key of path.split('.')) {
    if (obj == null) return path
    obj = obj[key]
  }
  return typeof obj === 'string' ? obj : path
}

export function useLocale() {
  const language = computed(() => useState.language)

  function t(path: string): string {
    return resolve(path, locales[language.value])
  }

  function setLanguage(lang: Language) {
    setState({ language: lang })
    localStorage.setItem('language', lang)
  }

  return { t, language, setLanguage }
}

export function tRaw(path: string): string {
  const lang = useState.language
  return resolve(path, locales[lang])
}
