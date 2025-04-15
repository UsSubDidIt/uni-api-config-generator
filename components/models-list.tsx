"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash } from "lucide-react"
import type { ModelConfig } from "@/types/config"

interface ModelsListProps {
  models: ModelConfig[]
  onChange: (models: ModelConfig[]) => void
}

export function ModelsList({ models, onChange }: ModelsListProps) {
  const [newModelName, setNewModelName] = useState("")
  const [newModelAlias, setNewModelAlias] = useState("")
  const [showAliasInput, setShowAliasInput] = useState(false)

  const addModel = () => {
    if (!newModelName) return

    let newModel: ModelConfig
    if (showAliasInput && newModelAlias) {
      // Add model with alias
      const modelObj: Record<string, string> = {}
      modelObj[newModelName] = newModelAlias
      newModel = modelObj
    } else {
      // Add model without alias
      newModel = newModelName
    }

    onChange([...models, newModel])
    setNewModelName("")
    setNewModelAlias("")
    setShowAliasInput(false)
  }

  const removeModel = (index: number) => {
    const newModels = [...models]
    newModels.splice(index, 1)
    onChange(newModels)
  }

  const getModelDisplayName = (model: ModelConfig): string => {
    if (typeof model === "string") {
      return model
    } else {
      const key = Object.keys(model)[0]
      return `${key} → ${model[key]}`
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {models.length > 0 ? (
          <div className="space-y-2">
            {models.map((model, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                  {getModelDisplayName(model)}
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeModel(index)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 border-2 border-dashed rounded-lg">
            <p className="text-gray-500">暂无模型配置</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input
            value={newModelName}
            onChange={(e) => setNewModelName(e.target.value)}
            placeholder="模型名称 (例如: gpt-4o, claude-3-5-sonnet)"
          />
          <Button variant="outline" size="icon" onClick={() => setShowAliasInput(!showAliasInput)}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button onClick={addModel}>添加</Button>
        </div>

        {showAliasInput && (
          <div className="pt-2">
            <Label className="text-sm mb-1 block">
              模型别名
              <span className="block text-xs text-gray-500">可选，用于重命名模型</span>
            </Label>
            <Input
              value={newModelAlias}
              onChange={(e) => setNewModelAlias(e.target.value)}
              placeholder="模型别名 (例如: gpt4)"
            />
          </div>
        )}
      </div>
    </div>
  )
}
