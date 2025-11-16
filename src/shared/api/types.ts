export type Method = "GET" | "POST"

export interface RequestOptions<TResponse = any, TBody = any> {
  method: Method
  url: string
  data?: TBody
  params?: Record<string, any>
  headers?: Record<string, string>
  needKey?: boolean

  onSuccess?: (data: TResponse) => void
  onError?: (error: unknown) => void
  onFinally?: () => void
}