import { useErrorModal } from '../composables/useErrorModal'
import { useState } from '../core/store'


export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface RequestOptions<TBody> {
  method?: HttpMethod
  body?: TBody
  headers?: Record<string, string>
}

export async function request<TResponse, TBody = unknown>(
  url: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const { method = 'GET', body, headers = {} } = options

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': useState.language === 'en' ? 'en' : 'ru',
      ...headers,
    },
  }

  if (method !== 'GET' && body !== undefined) {
    fetchOptions.body = JSON.stringify(body)
  }

  let res: Response
  try {
    res = await fetch(url, fetchOptions)
  } catch (e) {
    const { showError } = useErrorModal()
    showError({
      title: useState.language === 'en' ? 'Connection Error' : 'Ошибка соединения',
      message: useState.language === 'en'
        ? 'Failed to connect to the server. Check your internet connection.'
        : 'Не удалось подключиться к серверу. Проверьте подключение к интернету.',
      details: e instanceof Error ? e.message : String(e),
    })
    throw e
  }

  if (!res.ok) {
    let text = ''
    try {
      text = await res.text()
    } catch {
      text = '(failed to read response body)'
    }

    let title: string
    let message: string
    let details: string

    const isHtml = /^\s*</.test(text.trim())

    if (isHtml) {
      const titleMatch = text.match(/<title>\s*(.+?)\s*<\/title>/i)
      title = titleMatch?.[1] || `HTTP ${res.status}`

      const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      const bodyRaw = bodyMatch?.[1] || ''
      message = bodyRaw
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
        .replace(/\n{3,}/g, '\n\n')
        .trim() || title

      details = text
        .replace(/<head>[\s\S]*?<\/head>/gi, '')
        .replace(/<body[^>]*>[\s\S]*?<\/body>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    } else {
      title = `HTTP ${res.status}`
      message = useState.language === 'en'
        ? 'An error occurred while requesting data'
        : 'Произошла ошибка при запросе данных'
      details = `${res.status} ${res.statusText}: ${text}`
    }

    const { showError } = useErrorModal()
    showError({ title, message, details })

    throw new Error(details || message)
  }

  if (res.status === 204) {
    return null as TResponse
  }

  try {
    return (await res.json()) as TResponse
  } catch (e) {
    const { showError } = useErrorModal()
    showError({
      title: useState.language === 'en' ? 'Parse Error' : 'Ошибка данных',
      message: useState.language === 'en'
        ? 'Failed to parse server response'
        : 'Не удалось обработать ответ сервера',
      details: e instanceof Error ? e.message : String(e),
    })
    throw e
  }
}
