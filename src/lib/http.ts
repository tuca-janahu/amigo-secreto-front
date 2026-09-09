import { config } from './config'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type RequestOptions = Omit<RequestInit, 'body' | 'credentials'> & {
  body?: unknown
}

type ApiErrorBody = {
  message?: string | string[]
}

function getErrorMessage(body: unknown, fallback: string) {
  if (typeof body !== 'object' || body === null || !('message' in body)) {
    return fallback
  }

  const { message } = body as ApiErrorBody

  if (Array.isArray(message)) {
    return message.join(', ')
  }

  return message ?? fallback
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

export async function http<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...requestOptions } = options
  const response = await fetch(`${config.apiUrl}${path}`, {
    ...requestOptions,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'include',
  })
  const data = await parseResponse(response)

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data, 'Não foi possível concluir a solicitação.'), response.status)
  }

  return data as T
}
