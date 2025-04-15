"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Trash } from "lucide-react"
import type { Preferences } from "@/types/config"

interface PreferencesFormProps {
  preferences: Preferences
  setPreferences: (preferences: Preferences) => void
}

export function PreferencesForm({ preferences, setPreferences }: PreferencesFormProps) {
  const [newModelTimeout, setNewModelTimeout] = useState({ model: "", timeout: "" })
  const [newKeepaliveInterval, setNewKeepaliveInterval] = useState({ model: "", interval: "" })
  const [newErrorTrigger, setNewErrorTrigger] = useState("")

  const updatePreference = <K extends keyof Preferences>(field: K, value: Preferences[K]) => {
    setPreferences({ ...preferences, [field]: value })
  }

  const addModelTimeout = () => {
    if (!newModelTimeout.model || !newModelTimeout.timeout) return

    const newTimeouts = { ...preferences.model_timeout }
    newTimeouts[newModelTimeout.model] = Number.parseInt(newModelTimeout.timeout)
    updatePreference("model_timeout", newTimeouts)

    setNewModelTimeout({ model: "", timeout: "" })
  }

  const removeModelTimeout = (model: string) => {
    const newTimeouts = { ...preferences.model_timeout }
    delete newTimeouts[model]
    updatePreference("model_timeout", newTimeouts)
  }

  const addKeepaliveInterval = () => {
    if (!newKeepaliveInterval.model || !newKeepaliveInterval.interval) return

    const newIntervals = { ...preferences.keepalive_interval }
    newIntervals[newKeepaliveInterval.model] = Number.parseInt(newKeepaliveInterval.interval)
    updatePreference("keepalive_interval", newIntervals)

    setNewKeepaliveInterval({ model: "", interval: "" })
  }

  const removeKeepaliveInterval = (model: string) => {
    const newIntervals = { ...preferences.keepalive_interval }
    delete newIntervals[model]
    updatePreference("keepalive_interval", newIntervals)
  }

  const addErrorTrigger = () => {
    if (!newErrorTrigger) return

    const newTriggers = [...(preferences.error_triggers || [])]
    newTriggers.push(newErrorTrigger)
    updatePreference("error_triggers", newTriggers)

    setNewErrorTrigger("")
  }

  const removeErrorTrigger = (index: number) => {
    const newTriggers = [...(preferences.error_triggers || [])]
    newTriggers.splice(index, 1)
    updatePreference("error_triggers", newTriggers)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">全局配置</h2>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="cooldown-period">
            通道冷却时间 (秒)
            <span className="block text-xs text-gray-500">cooldown_period</span>
          </Label>
          <Input
            id="cooldown-period"
            type="number"
            value={preferences.cooldown_period || ""}
            onChange={(e) => updatePreference("cooldown_period", Number.parseInt(e.target.value))}
            placeholder="例如: 300"
          />
          <p className="text-xs text-gray-500">
            当模型请求失败时，通道将被自动排除并冷却一段时间。设置为 0 时不启用冷却机制。
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rate-limit">
            全局请求频率限制
            <span className="block text-xs text-gray-500">rate_limit</span>
          </Label>
          <Input
            id="rate-limit"
            value={preferences.rate_limit || ""}
            onChange={(e) => updatePreference("rate_limit", e.target.value)}
            placeholder="例如: 999999/min"
          />
          <p className="text-xs text-gray-500">支持多种频率限制，例如: 15/min,10/day</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="proxy">
            全局代理设置
            <span className="block text-xs text-gray-500">proxy</span>
          </Label>
          <Input
            id="proxy"
            value={preferences.proxy || ""}
            onChange={(e) => updatePreference("proxy", e.target.value)}
            placeholder="例如: socks5://username:password@ip:port"
          />
        </div>

        <Accordion type="single" collapsible>
          <AccordionItem value="model-timeouts">
            <AccordionTrigger>模型超时设置</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  {Object.entries(preferences.model_timeout || {}).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(preferences.model_timeout || {}).map(([model, timeout], index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                            <span className="font-medium">{model}:</span> {timeout} 秒
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeModelTimeout(model)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 border-2 border-dashed rounded-lg">
                      <p className="text-gray-500">暂无模型超时设置</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new-model-timeout-name">模型名称</Label>
                    <Input
                      id="new-model-timeout-name"
                      value={newModelTimeout.model}
                      onChange={(e) => setNewModelTimeout({ ...newModelTimeout, model: e.target.value })}
                      placeholder="例如: gpt-4o 或 default"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-model-timeout-value">超时时间 (秒)</Label>
                    <Input
                      id="new-model-timeout-value"
                      type="number"
                      value={newModelTimeout.timeout}
                      onChange={(e) => setNewModelTimeout({ ...newModelTimeout, timeout: e.target.value })}
                      placeholder="例如: 10"
                    />
                  </div>
                </div>
                <Button onClick={addModelTimeout}>添加模型超时设置</Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="keepalive-intervals">
            <AccordionTrigger>心跳间隔设置</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  {Object.entries(preferences.keepalive_interval || {}).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(preferences.keepalive_interval || {}).map(([model, interval], index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                            <span className="font-medium">{model}:</span> {interval} 秒
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeKeepaliveInterval(model)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 border-2 border-dashed rounded-lg">
                      <p className="text-gray-500">暂无心跳间隔设置</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new-keepalive-model">模型名称</Label>
                    <Input
                      id="new-keepalive-model"
                      value={newKeepaliveInterval.model}
                      onChange={(e) => setNewKeepaliveInterval({ ...newKeepaliveInterval, model: e.target.value })}
                      placeholder="例如: gemini-2.5-pro"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-keepalive-interval">间隔时间 (秒)</Label>
                    <Input
                      id="new-keepalive-interval"
                      type="number"
                      value={newKeepaliveInterval.interval}
                      onChange={(e) => setNewKeepaliveInterval({ ...newKeepaliveInterval, interval: e.target.value })}
                      placeholder="例如: 50"
                    />
                  </div>
                </div>
                <Button onClick={addKeepaliveInterval}>添加心跳间隔设置</Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="error-triggers">
            <AccordionTrigger>错误触发器</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  {(preferences.error_triggers || []).length > 0 ? (
                    <div className="space-y-2">
                      {(preferences.error_triggers || []).map((trigger, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 rounded border">{trigger}</div>
                          <Button variant="ghost" size="icon" onClick={() => removeErrorTrigger(index)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 border-2 border-dashed rounded-lg">
                      <p className="text-gray-500">暂无错误触发器</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newErrorTrigger}
                    onChange={(e) => setNewErrorTrigger(e.target.value)}
                    placeholder="例如: The bot's usage is covered by the developer"
                  />
                  <Button onClick={addErrorTrigger}>添加</Button>
                </div>
                <p className="text-xs text-gray-500">
                  当模型返回的消息包含错误触发器中的任何字符串时，通道将返回错误。
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
