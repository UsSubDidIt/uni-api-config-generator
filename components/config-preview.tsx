"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { ConfigData } from "@/types/config"

interface ConfigPreviewProps {
  configData: ConfigData
}

export function ConfigPreview({ configData }: ConfigPreviewProps) {
  const { toast } = useToast()
  const [format, setFormat] = useState<"yaml" | "json">("yaml")

  const generateYaml = (data: ConfigData): string => {
    // This is a simplified version - in a real implementation,
    // we would use a proper YAML library to generate the config
    let yaml = "providers:\n"

    // Add providers
    data.providers.forEach((provider) => {
      yaml += `  - provider: ${provider.provider}\n`
      yaml += `    base_url: ${provider.base_url}\n`

      if (Array.isArray(provider.api)) {
        yaml += `    api:\n`
        provider.api.forEach((api) => {
          yaml += `      - ${api}\n`
        })
      } else if (provider.api) {
        yaml += `    api: ${provider.api}\n`
      }

      if (provider.model && provider.model.length > 0) {
        yaml += `    model:\n`
        provider.model.forEach((model) => {
          if (typeof model === "string") {
            yaml += `      - ${model}\n`
          } else {
            const key = Object.keys(model)[0]
            yaml += `      - ${key}: ${model[key]}\n`
          }
        })
      }

      if (provider.tools !== undefined) {
        yaml += `    tools: ${provider.tools}\n`
      }

      if (provider.preferences) {
        yaml += `    preferences:\n`
        if (provider.preferences.api_key_rate_limit) {
          yaml += `      api_key_rate_limit: ${provider.preferences.api_key_rate_limit}\n`
        }
        if (provider.preferences.api_key_cooldown_period) {
          yaml += `      api_key_cooldown_period: ${provider.preferences.api_key_cooldown_period}\n`
        }
        if (provider.preferences.api_key_schedule_algorithm) {
          yaml += `      api_key_schedule_algorithm: ${provider.preferences.api_key_schedule_algorithm}\n`
        }
        if (provider.preferences.model_timeout) {
          yaml += `      model_timeout:\n`
          Object.entries(provider.preferences.model_timeout).forEach(([model, timeout]) => {
            yaml += `        ${model}: ${timeout}\n`
          })
        }
        if (provider.preferences.keepalive_interval) {
          yaml += `      keepalive_interval:\n`
          Object.entries(provider.preferences.keepalive_interval).forEach(([model, interval]) => {
            yaml += `        ${model}: ${interval}\n`
          })
        }
        if (provider.preferences.proxy) {
          yaml += `      proxy: ${provider.preferences.proxy}\n`
        }
        if (provider.preferences.headers) {
          yaml += `      headers:\n`
          Object.entries(provider.preferences.headers).forEach(([key, value]) => {
            yaml += `        ${key}: ${value}\n`
          })
        }
      }
    })

    // Add API keys
    yaml += `\napi_keys:\n`
    // Add null check for apiKeys
    if (data.apiKeys && data.apiKeys.length > 0) {
      data.apiKeys.forEach((apiKey) => {
        yaml += `  - api: ${apiKey.api}\n`

        if (apiKey.model && apiKey.model.length > 0) {
          yaml += `    model:\n`
          apiKey.model.forEach((model) => {
            if (typeof model === "string") {
              yaml += `      - ${model}\n`
            } else {
              const key = Object.keys(model)[0]
              yaml += `      - ${key}: ${model[key]}\n`
            }
          })
        }

        if (apiKey.role) {
          yaml += `    role: ${apiKey.role}\n`
        }

        if (apiKey.preferences) {
          yaml += `    preferences:\n`
          if (apiKey.preferences.SCHEDULING_ALGORITHM) {
            yaml += `      SCHEDULING_ALGORITHM: ${apiKey.preferences.SCHEDULING_ALGORITHM}\n`
          }
          if (apiKey.preferences.AUTO_RETRY !== undefined) {
            yaml += `      AUTO_RETRY: ${apiKey.preferences.AUTO_RETRY}\n`
          }
          if (apiKey.preferences.rate_limit) {
            yaml += `      rate_limit: ${apiKey.preferences.rate_limit}\n`
          }
          if (apiKey.preferences.ENABLE_MODERATION !== undefined) {
            yaml += `      ENABLE_MODERATION: ${apiKey.preferences.ENABLE_MODERATION}\n`
          }
        }
      })
    }

    // Add global preferences
    yaml += `\npreferences:\n`
    if (data.preferences.model_timeout && Object.keys(data.preferences.model_timeout).length > 0) {
      yaml += `  model_timeout:\n`
      Object.entries(data.preferences.model_timeout).forEach(([model, timeout]) => {
        yaml += `    ${model}: ${timeout}\n`
      })
    }

    if (data.preferences.cooldown_period) {
      yaml += `  cooldown_period: ${data.preferences.cooldown_period}\n`
    }

    if (data.preferences.rate_limit) {
      yaml += `  rate_limit: ${data.preferences.rate_limit}\n`
    }

    if (data.preferences.keepalive_interval && Object.keys(data.preferences.keepalive_interval).length > 0) {
      yaml += `  keepalive_interval:\n`
      Object.entries(data.preferences.keepalive_interval).forEach(([model, interval]) => {
        yaml += `    ${model}: ${interval}\n`
      })
    }

    if (data.preferences.error_triggers && data.preferences.error_triggers.length > 0) {
      yaml += `  error_triggers:\n`
      data.preferences.error_triggers.forEach((trigger) => {
        yaml += `    - ${trigger}\n`
      })
    }

    if (data.preferences.proxy) {
      yaml += `  proxy: ${data.preferences.proxy}\n`
    }

    return yaml
  }

  const generateJson = (data: ConfigData): string => {
    // Create a copy of the data with the correct field name for the YAML output
    const yamlData = {
      providers: data.providers || [],
      api_keys: data.apiKeys || [], // Use api_keys for YAML format
      preferences: data.preferences || {},
    }
    return JSON.stringify(yamlData, null, 2)
  }

  const configText = format === "yaml" ? generateYaml(configData) : generateJson(configData)

  const handleCopy = () => {
    navigator.clipboard.writeText(configText)
    toast({
      title: "已复制到剪贴板",
      description: "配置文件已成功复制到剪贴板",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant={format === "yaml" ? "default" : "outline"} size="sm" onClick={() => setFormat("yaml")}>
            YAML
          </Button>
          <Button variant={format === "json" ? "default" : "outline"} size="sm" onClick={() => setFormat("json")}>
            JSON
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" />
          复制
        </Button>
      </div>

      <div className="relative">
        <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-auto max-h-[600px] text-sm">
          {configText}
        </pre>
      </div>
    </div>
  )
}
