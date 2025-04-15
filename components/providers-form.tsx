"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash, ChevronDown, ChevronUp } from "lucide-react"
import type { Provider, ProviderPreferences } from "@/types/config"
import { ModelsList } from "@/components/models-list"
import { Badge } from "@/components/ui/badge"

interface ProvidersFormProps {
  providers: Provider[]
  setProviders: (providers: Provider[]) => void
}

export function ProvidersForm({ providers, setProviders }: ProvidersFormProps) {
  const [expandedProvider, setExpandedProvider] = useState<number | null>(null)

  const addProvider = () => {
    setProviders([
      ...providers,
      {
        provider: "",
        base_url: "",
        api: "",
        model: [],
        tools: true,
      },
    ])
    setExpandedProvider(providers.length)
  }

  const removeProvider = (index: number) => {
    const newProviders = [...providers]
    newProviders.splice(index, 1)
    setProviders(newProviders)
  }

  const updateProvider = (index: number, field: keyof Provider, value: any) => {
    const newProviders = [...providers]
    newProviders[index] = { ...newProviders[index], [field]: value }
    setProviders(newProviders)
  }

  const updateProviderPreferences = (index: number, field: keyof ProviderPreferences, value: any) => {
    const newProviders = [...providers]
    if (!newProviders[index].preferences) {
      newProviders[index].preferences = {}
    }
    newProviders[index].preferences = {
      ...newProviders[index].preferences,
      [field]: value,
    }
    setProviders(newProviders)
  }

  const toggleApiArray = (index: number) => {
    const newProviders = [...providers]
    const provider = newProviders[index]

    if (Array.isArray(provider.api)) {
      // Convert array to string (use first item or empty string)
      newProviders[index].api = provider.api.length > 0 ? provider.api[0] : ""
    } else {
      // Convert string to array
      newProviders[index].api = provider.api ? [provider.api] : []
    }

    setProviders(newProviders)
  }

  const addApiKey = (index: number) => {
    const newProviders = [...providers]
    const provider = newProviders[index]

    if (!Array.isArray(provider.api)) {
      // Convert string to array first
      newProviders[index].api = provider.api ? [provider.api] : []
    } else {
      // Add empty string to array
      ;(newProviders[index].api as string[]).push("")
    }

    setProviders(newProviders)
  }

  const updateApiKey = (providerIndex: number, keyIndex: number, value: string) => {
    const newProviders = [...providers]
    if (Array.isArray(newProviders[providerIndex].api)) {
      ;(newProviders[providerIndex].api as string[])[keyIndex] = value
      setProviders(newProviders)
    }
  }

  const removeApiKey = (providerIndex: number, keyIndex: number) => {
    const newProviders = [...providers]
    if (Array.isArray(newProviders[providerIndex].api)) {
      ;(newProviders[providerIndex].api as string[]).splice(keyIndex, 1)
      setProviders(newProviders)
    }
  }

  const moveProvider = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === providers.length - 1)) {
      return
    }

    const newProviders = [...providers]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    ;[newProviders[index], newProviders[targetIndex]] = [newProviders[targetIndex], newProviders[index]]

    setProviders(newProviders)
    setExpandedProvider(targetIndex)
  }

  const providerTypes = [
    { value: "openai", label: "OpenAI" },
    { value: "anthropic", label: "Anthropic" },
    { value: "gemini", label: "Gemini" },
    { value: "vertex", label: "Vertex AI" },
    { value: "azure", label: "Azure" },
    { value: "xai", label: "xAI" },
    { value: "cohere", label: "Cohere" },
    { value: "groq", label: "Groq" },
    { value: "cloudflare", label: "Cloudflare" },
    { value: "openrouter", label: "OpenRouter" },
    { value: "custom", label: "自定义" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">服务提供商配置</h2>
        <Button onClick={addProvider}>
          <Plus className="mr-2 h-4 w-4" />
          添加提供商
        </Button>
      </div>

      {providers.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-gray-500">点击"添加提供商"按钮开始配置</p>
        </div>
      ) : (
        <Accordion
          type="single"
          collapsible
          value={expandedProvider !== null ? expandedProvider.toString() : undefined}
          onValueChange={(value) => setExpandedProvider(value ? Number.parseInt(value) : null)}
        >
          {providers.map((provider, index) => (
            <AccordionItem key={index} value={index.toString()} className="border rounded-lg mb-4 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  <Badge variant={provider.provider ? "default" : "outline"}>{provider.provider || "未命名"}</Badge>
                  {provider.base_url && (
                    <span className="text-xs text-gray-500 truncate max-w-[300px]">{provider.base_url}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      moveProvider(index, "up")
                    }}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      moveProvider(index, "down")
                    }}
                    disabled={index === providers.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeProvider(index)
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                  <AccordionTrigger className="py-0" />
                </div>
              </div>
              <AccordionContent className="pt-4">
                <div className="space-y-6 px-4 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor={`provider-${index}`}>
                        服务提供商名称
                        <span className="block text-xs text-gray-500">provider</span>
                      </Label>
                      <Select
                        value={providerTypes.some((p) => p.value === provider.provider) ? provider.provider : "custom"}
                        onValueChange={(value) => {
                          if (value === "custom") {
                            updateProvider(index, "provider", "")
                          } else {
                            updateProvider(index, "provider", value)
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择服务提供商" />
                        </SelectTrigger>
                        <SelectContent>
                          {providerTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {(providerTypes.every((p) => p.value !== provider.provider) ||
                        provider.provider === "custom") && (
                        <Input
                          id={`provider-${index}`}
                          value={provider.provider}
                          onChange={(e) => updateProvider(index, "provider", e.target.value)}
                          placeholder="例如: openai, anthropic, gemini"
                          className="mt-2"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`base-url-${index}`}>
                        API 基础 URL
                        <span className="block text-xs text-gray-500">base_url</span>
                      </Label>
                      <Input
                        id={`base-url-${index}`}
                        value={provider.base_url}
                        onChange={(e) => updateProvider(index, "base_url", e.target.value)}
                        placeholder="例如: https://api.openai.com/v1/chat/completions"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>
                        API 密钥
                        <span className="block text-xs text-gray-500">api</span>
                      </Label>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`multi-api-${index}`} className="text-sm">
                          多个 API 密钥
                        </Label>
                        <Switch
                          id={`multi-api-${index}`}
                          checked={Array.isArray(provider.api)}
                          onCheckedChange={() => toggleApiArray(index)}
                        />
                      </div>
                    </div>

                    {Array.isArray(provider.api) ? (
                      <div className="space-y-2">
                        {(provider.api as string[]).map((apiKey, keyIndex) => (
                          <div key={keyIndex} className="flex gap-2">
                            <Input
                              value={apiKey}
                              onChange={(e) => updateApiKey(index, keyIndex, e.target.value)}
                              placeholder="API 密钥"
                            />
                            <Button variant="ghost" size="icon" onClick={() => removeApiKey(index, keyIndex)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => addApiKey(index)}>
                          <Plus className="mr-2 h-4 w-4" />
                          添加 API 密钥
                        </Button>
                      </div>
                    ) : (
                      <Input
                        value={provider.api as string}
                        onChange={(e) => updateProvider(index, "api", e.target.value)}
                        placeholder="API 密钥"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      模型配置
                      <span className="block text-xs text-gray-500">model</span>
                    </Label>
                    <ModelsList
                      models={provider.model || []}
                      onChange={(models) => updateProvider(index, "model", models)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`tools-${index}`}
                      checked={provider.tools}
                      onCheckedChange={(checked) => updateProvider(index, "tools", checked)}
                    />
                    <Label htmlFor={`tools-${index}`}>
                      启用工具调用
                      <span className="block text-xs text-gray-500">tools</span>
                    </Label>
                  </div>

                  <div className="pt-4">
                    <Accordion type="single" collapsible>
                      <AccordionItem value="preferences">
                        <AccordionTrigger>提供商高级配置</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-6 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor={`rate-limit-${index}`}>
                                  API 密钥请求频率限制
                                  <span className="block text-xs text-gray-500">api_key_rate_limit</span>
                                </Label>
                                <Input
                                  id={`rate-limit-${index}`}
                                  value={provider.preferences?.api_key_rate_limit || ""}
                                  onChange={(e) =>
                                    updateProviderPreferences(index, "api_key_rate_limit", e.target.value)
                                  }
                                  placeholder="例如: 15/min,10/day"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`cooldown-${index}`}>
                                  API 密钥冷却时间 (秒)
                                  <span className="block text-xs text-gray-500">api_key_cooldown_period</span>
                                </Label>
                                <Input
                                  id={`cooldown-${index}`}
                                  type="number"
                                  value={provider.preferences?.api_key_cooldown_period || ""}
                                  onChange={(e) =>
                                    updateProviderPreferences(
                                      index,
                                      "api_key_cooldown_period",
                                      Number.parseInt(e.target.value),
                                    )
                                  }
                                  placeholder="例如: 60"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`schedule-algorithm-${index}`}>
                                API 密钥调度算法
                                <span className="block text-xs text-gray-500">api_key_schedule_algorithm</span>
                              </Label>
                              <Select
                                value={provider.preferences?.api_key_schedule_algorithm || "round_robin"}
                                onValueChange={(value) =>
                                  updateProviderPreferences(index, "api_key_schedule_algorithm", value)
                                }
                              >
                                <SelectTrigger id={`schedule-algorithm-${index}`}>
                                  <SelectValue placeholder="选择调度算法" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="round_robin">轮询 (round_robin)</SelectItem>
                                  <SelectItem value="random">随机 (random)</SelectItem>
                                  <SelectItem value="fixed_priority">固定优先级 (fixed_priority)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`proxy-${index}`}>
                                代理设置
                                <span className="block text-xs text-gray-500">proxy</span>
                              </Label>
                              <Input
                                id={`proxy-${index}`}
                                value={provider.preferences?.proxy || ""}
                                onChange={(e) => updateProviderPreferences(index, "proxy", e.target.value)}
                                placeholder="例如: socks5://username:password@ip:port"
                              />
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}
