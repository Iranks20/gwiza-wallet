const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://walletplus.qa.gwiza.co'

export type ApiResponse<T = unknown> = {
  success: boolean
  resp_code: number
  resp_msg: string
  data?: T
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext?: boolean
    hasPrev?: boolean
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public respCode?: number,
    public respMsg?: string,
    public data?: unknown,
    public errors?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function parseResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const text = await res.text()
  let body: ApiResponse<T>
  try {
    body = text ? JSON.parse(text) : {}
  } catch {
    throw new ApiError(
      res.ok ? 'Invalid JSON response' : `Request failed: ${res.status} ${res.statusText}`,
      res.status,
      undefined,
      text.slice(0, 200)
    )
  }
  if (!res.ok) {
    const b = body as ApiResponse & { errors?: unknown }
    const msg = b.resp_msg ?? `Request failed: ${res.status}`
    const detail = b.resp_code != null ? `${msg} (code ${b.resp_code})` : msg
    throw new ApiError(detail, res.status, b.resp_code, b.resp_msg, b.data, b.errors)
  }
  return body as ApiResponse<T>
}

function serializeQueryValue(v: string | number): string {
  if (typeof v === 'number') {
    const n = Number(v)
    return Number.isInteger(n) ? String(n) : String(Math.floor(n))
  }
  return String(v)
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(path.startsWith('http') ? path : `${BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') url.searchParams.set(k, serializeQueryValue(v))
    })
  }
  return url.toString()
}

export const apiClient = {
  async get<T = unknown>(
    path: string,
    params?: Record<string, string | number | undefined>
  ): Promise<ApiResponse<T>> {
    const res = await fetch(buildUrl(path, params), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    return parseResponse<T>(res)
  },

  async post<T = unknown>(path: string, body: unknown): Promise<ApiResponse<T>> {
    const res = await fetch(buildUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    })
    return parseResponse<T>(res)
  },

  async put<T = unknown>(path: string, body: unknown): Promise<ApiResponse<T>> {
    const res = await fetch(buildUrl(path), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    })
    return parseResponse<T>(res)
  },

  async delete(path: string): Promise<ApiResponse<unknown>> {
    const res = await fetch(buildUrl(path), {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    })
    return parseResponse(res)
  },
}
