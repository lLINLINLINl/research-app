import { useState } from 'react'
import { Header } from './components/Header'
import { SurvivalDataConverter } from './components/SurvivalDataConverter'
import type { Tab } from './types'

const TABS: Tab[] = [
  { id: 'survival-converter', label: '生存曲线数据转换' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS[0].id)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1">
        {activeTab === 'survival-converter' && <SurvivalDataConverter />}
      </main>
      <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-100">
        Research · 纯前端数据安全 · 生物科研工具集
      </footer>
    </div>
  )
}
