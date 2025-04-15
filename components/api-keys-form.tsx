"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Plus, Trash, ChevronDown, ChevronUp } from "lucide-react"
import type { ApiKey, ApiKeyPreferences, Provider } from "@/types/config"
import { ModelsList } from "@/components/models-list"
import { Badge } from "@/components/ui/badge"

interface ApiKeysFormProps {
  apiKeys: ApiKey[]
  setApiKeys: (apiKeys: ApiKey[]) => void
  providers: Provider[]
}

export function ApiKeysForm({ apiKeys, setApiKeys, providers }: ApiKeysFormProps) {
  const [expandedApiKey, setExpandedApiKey] = useState<number | null>(null)

  const addApiKey = () => {
    setApiKeys([
      ...apiKeys,
      {
        api: "",
        model: [],
      },
    ])
    setExpandedApiKey(apiKeys.length)
  }

  const removeApiKey = (index: number) => {
    const newApiKeys = [...apiKeys]
    newApiKeys.splice(index, 1)
    setApiKeys(newApiKeys)
  }

  const updateApiKey = (index: number, field: keyof ApiKey, value: any) => {
    const newApiKeys = [...apiKeys]
    newApiKeys[index] = { ...newApiKeys[index], [field]: value }
    setApiKeys(newApiKeys)
  }

  const updateApiKeyPreferences = (index: number, field: keyof ApiKeyPreferences, value: any) => {
    const newApiKeys = [...apiKeys]
    if (!newApiKeys[index].preferences) {
      newApiKeys[index].preferences = {}
    }
    newApiKeys[index].preferences = {
      ...newApiKeys[index].preferences,
      [field]: value,
    }
    setApiKeys(newApiKeys)
  }

  const moveApiKey = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === apiKeys.length - 1)) {
      return
    }

    const newApiKeys = [...apiKeys]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    ;[newApiKeys[index], newApiKeys[targetIndex]] = [newApiKeys[targetIndex], newApiKeys[index]]

    setApiKeys(newApiKeys)
    setExpandedApiKey(targetIndex)
  }

  const getProviderModels = () => {
    const allModels: string[] = []

    providers.forEach((provider) => {
      // Add provider name as prefix for wildcards
      allModels.push(`${provider.provider}/*`)

      // Add individual models
      if (provider.model && provider.model.length > 0) {
        provider.model.forEach((model) => {
          if (typeof model === "string") {
            allModels.push(model)
            // Also add with provider prefix
            allModels.push(`${provider.provider}/${model}`)
          } else {
            const key = Object.keys(model)[0]
            const value = model[key]
            allModels.push(key)
            allModels.push(`${provider.provider}/${key}`)
            // Also add the alias
            allModels.push(value)
            allModels.push(`${provider.provider}/${value}`)
          }
        })
      }
    })

    return [...new Set(allModels)] // Remove duplicates
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">API 密钥配置</h2>
        <Button onClick={addApiKey}>
          <Plus className="mr-2 h-4 w-4" />
          添加 API 密钥
        </Button>
      </div>

      {apiKeys.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-gray-500">点击"添加 API 密钥"按钮开始配置</p>
        </div>
      ) : (
        <Accordion
          type="single"
          collapsible
          value={expandedApiKey !== null ? expandedApiKey.toString() : undefined}
          onValueChange={(value) => setExpandedApiKey(value ? Number.parseInt(value) : null)}
        >
          {apiKeys.map((apiKey, index) => (
            <AccordionItem key={index} value={index.toString()} className="border rounded-lg mb-4 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  <Badge variant={apiKey.api ? "default" : "outline"}>
                    {apiKey.api ? apiKey.api.substring(0, 12) + "..." : "未设置"}
                  </Badge>
                  {apiKey.role && <Badge variant="secondary">{apiKey.role}</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      moveApiKey(index, "up")
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
                      moveApiKey(index, "down")
                    }}
                    disabled={index === apiKeys.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeApiKey(index)
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                  <AccordionTrigger className="py-0" />
                </div>
              </div>
              <AccordionContent className="pt-4">
                <div className="space-y-6 px-4 pb-4">
                  <div className="space-y-2">
                    <Label htmlFor={`api-key-${index}`}>
                      API 密钥
                      <span className="block text-xs text-gray-500">api</span>
                    </Label>
                    <Input
                      id={`api-key-${index}`}
                      value={apiKey.api}
                      onChange={(e) => updateApiKey(index, "api", e.target.value)}
                      placeholder="例如: sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`role-${index}`}>
                      角色
                      <span className="block text-xs text-gray-500">role</span>
                    </Label>
                    <Select value={apiKey.role || ""} onValueChange={(value) => updateApiKey(index, "role", value)}>
                      <SelectTrigger id={`role-${index}`}>
                        <SelectValue placeholder="选择角色 (可选)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">无角色</SelectItem>
                        <SelectItem value="admin">管理员 (admin)</SelectItem>
                        <SelectItem value="user">普通用户 (user)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      可用模型
                      <span className="block text-xs text-gray-500">model</span>
                    </Label>
                    <ModelsList
                      models={apiKey.model || []}
                      onChange={(models) => updateApiKey(index, "model", models)}
                    />

                    {providers.length > 0 && (
                      <div className="mt-4">
                        <Label className="mb-2 block">快速添加模型</Label>
                        <div className="flex flex-wrap gap-2">
                          {getProviderModels().map((model, mIndex) => (
                            <Button
                              key={mIndex}
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newModels = [...(apiKey.model || [])]
                                if (
                                  !newModels.some(
                                    (m) =>
                                      (typeof m === "string" && m === model) ||
                                      (typeof m !== "string" && Object.keys(m)[0] === model),
                                  )
                                ) {
                                  newModels.push(model)
                                  updateApiKey(index, "model", newModels)
                                }
                              }}
                            >
                              {model}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <Accordion type="single" collapsible>
                      <AccordionItem value="preferences">
                        <AccordionTrigger>API 密钥高级配置</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-6 pt-4">
                            <div className="space-y-2">
                              <Label htmlFor={`scheduling-algorithm-${index}`}>
                                调度算法
                                <span className="block text-xs text-gray-500">SCHEDULING_ALGORITHM</span>
                              </Label>
                              <Select
                                value={apiKey.preferences?.SCHEDULING_ALGORITHM || "fixed_priority"}
                                onValueChange={(value) => updateApiKeyPreferences(index, "SCHEDULING_ALGORITHM", value)}
                              >
                                <SelectTrigger id={`scheduling-algorithm-${index}`}>
                                  <SelectValue placeholder="选择调度算法" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="fixed_priority">固定优先级 (fixed_priority)</SelectItem>
                                  <SelectItem value="round_robin">轮询 (round_robin)</SelectItem>
                                  <SelectItem value="weighted_round_robin">加权轮询 (weighted_round_robin)</SelectItem>
                                  <SelectItem value="lottery">彩票 (lottery)</SelectItem>
                                  <SelectItem value="random">随机 (random)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor={`auto-retry-${index}`}>
                                  自动重试
                                  <span className="block text-xs text-gray-500">AUTO_RETRY</span>
                                </Label>
                                <Switch
                                  id={`auto-retry-${index}`}
                                  checked={apiKey.preferences?.AUTO_RETRY !== false}
                                  onCheckedChange={(checked) => updateApiKeyPreferences(index, "AUTO_RETRY", checked)}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`rate-limit-${index}`}>
                                请求频率限制
                                <span className="block text-xs text-gray-500">rate_limit</span>
                              </Label>
                              <Input
                                id={`rate-limit-${index}`}
                                value={apiKey.preferences?.rate_limit || ""}
                                onChange={(e) => updateApiKeyPreferences(index, "rate_limit", e.target.value)}
                                placeholder="例如: 15/min,10/day"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor={`enable-moderation-${index}`}>
                                  启用内容审核
                                  <span className="block text-xs text-gray-500">ENABLE_MODERATION</span>
                                </Label>
                                <Switch
                                  id={`enable-moderation-${index}`}
                                  checked={apiKey.preferences?.ENABLE_MODERATION === true}
                                  onCheckedChange={(checked) =>
                                    updateApiKeyPreferences(index, "ENABLE_MODERATION", checked)
                                  }
                                />
                              </div>
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
