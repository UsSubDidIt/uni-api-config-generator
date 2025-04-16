"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProvidersForm } from "@/components/providers-form"
import { ApiKeysForm } from "@/components/api-keys-form"
import { PreferencesForm } from "@/components/preferences-form"
import { ConfigPreview } from "@/components/config-preview"
import { Download, Copy, PanelRightClose, PanelRightOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Provider, ApiKey, Preferences, ConfigData } from "@/types/config"

export function ConfigGenerator() {
  const { toast } = useToast()
  const [providers, setProviders] = useState<Provider[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [showPreview, setShowPreview] = useState(true)
  const [preferences, setPreferences] = useState<Preferences>({
    model_timeout: {},
    cooldown_period: 300,
    rate_limit: "999999/min",
    keepalive_interval: {},
    error_triggers: [],
    proxy: "",
  })

  const configData: ConfigData = {
    providers,
    apiKeys,
    preferences,
  }

  const handleConfigUpdate = (newConfig: ConfigData) => {
    setProviders(newConfig.providers)
    setApiKeys(newConfig.apiKeys)
    setPreferences(newConfig.preferences)
  }

  const handleCopyConfig = () => {
    const yamlConfig = generateYaml(configData)
    navigator.clipboard.writeText(yamlConfig)
    toast({
      title: "已复制到剪贴板",
      description: "配置文件已成功复制到剪贴板",
    })
  }

  const handleDownloadConfig = () => {
    const yamlConfig = generateYaml(configData)
    const blob = new Blob([yamlConfig], { type: "text/yaml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "api.yaml"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({
      title: "下载成功",
      description: "配置文件已成功下载",
    })
  }

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

  return (
    <div className="flex gap-4 h-full">
      <div className="flex-1">
        <Tabs defaultValue="providers" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="providers">服务提供商</TabsTrigger>
            <TabsTrigger value="api-keys">API 密钥</TabsTrigger>
            <TabsTrigger value="preferences">全局配置</TabsTrigger>
          </TabsList>
          <TabsContent value="providers" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <ProvidersForm providers={providers} setProviders={setProviders} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="api-keys" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <ApiKeysForm apiKeys={apiKeys} setApiKeys={setApiKeys} providers={providers} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="preferences" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <PreferencesForm preferences={preferences} setPreferences={setPreferences} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className={`border-l transition-all duration-200 ${showPreview ? 'w-[600px]' : 'w-[40px]'}`}>
        <div className="sticky top-0 h-screen flex">
          <Button
            variant="ghost"
            size="icon"
            className="absolute -left-3 top-1/2 transform -translate-y-1/2 z-10"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </Button>
          
          <div className={`flex-1 overflow-auto transition-all duration-200 ${showPreview ? 'opacity-100 p-4' : 'opacity-0 p-0 w-0'}`}>
            <ConfigPreview 
              configData={configData} 
              onConfigUpdate={handleConfigUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
