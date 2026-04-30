export interface Meta {
  [key: string]: unknown
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  meta?: Meta
}
