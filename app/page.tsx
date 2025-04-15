import { ConfigGenerator } from "@/components/config-generator"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-2">uni-api 配置生成器</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">图形化构建 uni-api 配置文件，支持所有语法特性</p>
        <ConfigGenerator />
      </div>
    </div>
  )
}
