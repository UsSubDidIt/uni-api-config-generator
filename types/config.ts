export type ModelConfig = string | Record<string, string>

export interface ProviderPreferences {
  api_key_rate_limit?: string
  api_key_cooldown_period?: number
  api_key_schedule_algorithm?: string
  model_timeout?: Record<string, number>
  keepalive_interval?: Record<string, number>
  proxy?: string
  headers?: Record<string, string>
}

export interface Provider {
  provider: string
  base_url: string
  api: string | string[]
  model?: ModelConfig[]
  tools?: boolean
  preferences?: ProviderPreferences
  project_id?: string
  private_key?: string
  client_email?: string
  cf_account_id?: string
  notes?: string
  engine?: string
}

export interface ApiKeyPreferences {
  SCHEDULING_ALGORITHM?: string
  AUTO_RETRY?: boolean | number
  rate_limit?: string
  ENABLE_MODERATION?: boolean
}

export interface ApiKey {
  api: string
  model?: ModelConfig[]
  role?: string
  preferences?: ApiKeyPreferences
}

export interface Preferences {
  model_timeout: Record<string, number>
  cooldown_period: number
  rate_limit: string
  keepalive_interval: Record<string, number>
  error_triggers: string[]
  proxy: string
}

// Update the ConfigData interface to use apiKeys instead of api_keys
export interface ConfigData {
  providers: Provider[]
  apiKeys: ApiKey[] // Changed from api_keys to apiKeys to match usage in components
  preferences: Preferences
}
