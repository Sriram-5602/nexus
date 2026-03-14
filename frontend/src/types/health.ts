export type NetworkTrust = 'LOCALHOST' | 'HOME' | 'REMOTE'

export interface ServiceStatus {
  postgres: string
  redis: string
  minio: string
  ollama: string
}

export interface HealthResponse {
  status: string
  services: ServiceStatus
  networkTrust: NetworkTrust
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  timestamp: string
}
