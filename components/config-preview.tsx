"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { ConfigData } from "@/types/config"
import yaml from 'js-yaml'

interface ConfigPreviewProps {
  configData: ConfigData
  onConfigUpdate: (newConfig: ConfigData) => void
}

export function ConfigPreview({ configData, onConfigUpdate }: ConfigPreviewProps) {
  const { toast } = useToast()
  const [format, setFormat] = useState<"yaml" | "json">("yaml")
  const [editableText, setEditableText] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const generateYaml = (data: ConfigData): string => {
    return yaml.dump({
      providers: data.providers || [],
      api_keys: data.apiKeys || [],
      preferences: data.preferences || {},
    })
  }

  const generateJson = (data: ConfigData): string => {
    const yamlData = {
      providers: data.providers || [],
      api_keys: data.apiKeys || [],
      preferences: data.preferences || {},
    }
    return JSON.stringify(yamlData, null, 2)
  }

  useEffect(() => {
    const newText = format === "yaml" ? generateYaml(configData) : generateJson(configData)
    setEditableText(newText)
  }, [configData, format])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableText(e.target.value)
  }

  const handleBlur = () => {
    try {
      let parsedData: any
      if (format === "yaml") {
        parsedData = yaml.load(editableText)
      } else {
        parsedData = JSON.parse(editableText)
      }

      // Convert the parsed data back to our ConfigData structure
      const newConfigData: ConfigData = {
        providers: parsedData.providers || [],
        apiKeys: parsedData.api_keys || [], // Note the conversion from api_keys to apiKeys
        preferences: parsedData.preferences || {},
      }

      onConfigUpdate(newConfigData)
    } catch (error) {
      toast({
        title: "解析错误",
        description: "配置格式无效，请检查语法",
        variant: "destructive",
      })
      // Reset to the original content
      setEditableText(format === "yaml" ? generateYaml(configData) : generateJson(configData))
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(editableText)
    toast({
      title: "已复制到剪贴板",
      description: "配置文件已成功复制到剪贴板",
    })
  }

  const handleFormatChange = (newFormat: "yaml" | "json") => {
    try {
      // First parse the current content to ensure it's valid
      let parsedData: any
      if (format === "yaml") {
        parsedData = yaml.load(editableText)
      } else {
        parsedData = JSON.parse(editableText)
      }

      // Then convert to the new format
      setFormat(newFormat)
      const newText = newFormat === "yaml" ? generateYaml(configData) : generateJson(configData)
      setEditableText(newText)
    } catch (error) {
      toast({
        title: "格式转换错误",
        description: "当前配置格式无效，无法转换",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant={format === "yaml" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFormatChange("yaml")}
          >
            YAML
          </Button>
          <Button
            variant={format === "json" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFormatChange("json")}
          >
            JSON
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" />
          复制
        </Button>
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          className="w-full h-[600px] font-mono text-sm p-4 bg-gray-50 dark:bg-gray-800 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={editableText}
          onChange={handleTextChange}
          onBlur={handleBlur}
          spellCheck="false"
        />
      </div>
    </div>
  )
}
