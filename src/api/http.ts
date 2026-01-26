import { useErrorModal } from '../composables/useErrorModal'


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
      ...headers,
    },
  }

  // добавляем body только если метод не GET
  if (method !== 'GET' && body !== undefined) {
    fetchOptions.body = JSON.stringify(body)
  }

  const res = await fetch(url, fetchOptions)
  // console.log(`HTTP ${method} ${url} - Status: ${res.status}`)

  if (!res.ok) {
    const text = await res.text()
    const msg = `${res.status} ${res.statusText}: ${text}`

    const { showError } = useErrorModal()
    showError({
      title: `HTTP ${res.status}`,
      message: 'Произошла ошибка при запросе данных',
      details: msg,
    })

    throw new Error(msg)
  }

  if (res.status === 204) {
    return null as TResponse
  }

  return res.json() as Promise<TResponse>
}
