import type { Tab } from '../types'

interface HeaderProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function Header({ tabs, activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="bg-slate-900">
      <div className="flex items-center justify-between px-4 sm:px-6 h-14">
        <span className="text-white font-bold text-lg tracking-tight">
          Research
        </span>
        <span className="text-slate-500 text-xs">v0.1</span>
      </div>
      <nav className="flex px-3 sm:px-5 gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              whitespace-nowrap px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors
              ${activeTab === tab.id
                ? 'bg-teal-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
        <button
          disabled
          className="whitespace-nowrap px-3 py-2.5 text-sm text-slate-600 cursor-not-allowed"
        >
          ＋
        </button>
      </nav>
    </header>
  )
}
