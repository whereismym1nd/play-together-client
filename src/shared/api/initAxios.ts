import axios, { type AxiosRequestConfig } from "axios"
import type { RequestOptions } from "./types"

export const _SITE_URL = import.meta.env.NEXT_PUBLIC_API_URL!
const API_KEY = import.meta.env.NEXT_PUBLIC_API_KEY

export const api = axios.create({
  baseURL: _SITE_URL,
  withCredentials: true,
})

function resolvePayload<T>(raw: any): T {
  if (!raw || typeof raw !== "object") return raw as T

  const { status, data, message } = raw

  if (status && status !== "success") {
    throw new Error(message ?? "Request failed")
  }

  return (status ? data : raw) as T
}

export async function request<T = any, TBody = any>(
  opts: RequestOptions<T, TBody>,
): Promise<T> {
  const {
    method,
    url,
    data,
    params,
    headers,
    needKey,
    onSuccess,
    onError,
    onFinally,
  } = opts

  const config: AxiosRequestConfig = {
    url,
    method,
    params,
    headers: {
      ...(headers || {}),
      ...(needKey && API_KEY ? { "X-API-KEY": API_KEY } : {}),
    },
    data:
      method === "POST"
        ? data instanceof URLSearchParams
          ? data
          : data ?? {}
        : undefined,
  }

  try {
    const res = await api.request(config)
    const payload = resolvePayload<T>(res.data)
    onSuccess?.(payload)
    return payload
  } catch (error) {
    onError?.(error)
    throw error
  } finally {
    onFinally?.()
  }
}

export default api
