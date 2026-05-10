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
      <div className="h-3" />
      <main className="flex-1 bg-gradient-to-b from-slate-50/50 to-white">
        {activeTab === 'survival-converter' && <SurvivalDataConverter />}
      </main>
      <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-100 bg-white/50">
        <div className="flex items-center justify-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
          <span>Research · 纯前端数据安全 · 生物科研工具集</span>
        </div>
      </footer>
    </div>
  )
}
