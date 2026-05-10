import { useState, useRef, useCallback } from 'react'
import * as XLSX from 'xlsx'
import type { ParsedExcelData, OutputRow } from '../types'
import { transformData } from '../utils/dataTransformer'
import { sampleData } from '../data/sampleData'

type Step = 'upload' | 'preview' | 'result'

export function SurvivalDataConverter() {
  const [step, setStep] = useState<Step>('upload')
  const [fileName, setFileName] = useState<string>('')
  const [inputData, setInputData] = useState<ParsedExcelData | null>(null)
  const [columnName, setColumnName] = useState('Days')
  const [result, setResult] = useState<{ headers: string[]; rows: OutputRow[] } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.xlsx')) {
      setError('请上传 .xlsx 格式的文件')
      return
    }
    setError('')
    setFileName(file.name)
    setIsProcessing(true)
    try {
      const data = await parseFile(file)
      setInputData(data)
      setStep('preview')
    } catch (e) {
      setError(e instanceof Error ? e.message : '文件解析失败')
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleConvert = () => {
    if (!inputData) return
    setIsProcessing(true)
    try {
      const r = transformData(inputData, columnName.trim() || 'Days')
      setResult(r)
      setStep('result')
    } catch (e) {
      setError('数据转换失败')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const ws = XLSX.utils.json_to_sheet(result.rows, { header: result.headers })
    ws['!cols'] = result.headers.map(() => ({ wch: 14 }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '展开结果')
    XLSX.writeFile(wb, '生存曲线数据_展开结果.xlsx')
  }

  const handleReset = () => {
    setStep('upload')
    setFileName('')
    setInputData(null)
    setResult(null)
    setError('')
    setColumnName('Days')
  }

  const loadSample = () => {
    setInputData(sampleData)
    setFileName('（示例数据）')
    setStep('preview')
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')} className="font-medium hover:text-red-800">✕</button>
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="animate-[fadeIn_0.3s_ease-out]">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-50 mb-4">
              <svg className="w-7 h-7 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">生存曲线数据转换</h2>
            <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto leading-relaxed">
              将汇总死亡计数表展开为个体级数据，用于 Kaplan-Meier 生存分析
            </p>
          </div>
          <div
            ref={dropRef}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-2xl p-12 sm:p-16 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition-all duration-200 group"
          >
            <svg className="w-14 h-14 mx-auto text-slate-300 group-hover:text-teal-500 mb-4 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-6m0 0l-2 2m2-2l2 2m-7 4v2a2 2 0 002 2h10a2 2 0 002-2v-2M7 8V6a2 2 0 012-2h6a2 2 0 012 2v2" />
            </svg>
            <p className="text-slate-700 font-medium mb-1">拖拽 Excel 文件到此处</p>
            <p className="text-slate-400 text-sm mb-5">或点击选择文件 · 支持 .xlsx</p>
            <span className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm shadow-teal-200">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
              </svg>
              选择文件
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="text-center mt-8">
            <button
              onClick={loadSample}
              className="inline-flex items-center gap-1.5 text-teal-600 text-sm hover:text-teal-700 font-medium transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
              加载示例数据体验
              <span className="text-teal-400">→</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 2 & 3: Preview / Result */}
      {(step === 'preview' || step === 'result') && inputData && (
        <div>
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-800">生存曲线数据转换</h2>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{fileName}</span>
            </div>
            <button onClick={handleReset} className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
              重新上传
            </button>
          </div>

          {/* Desktop: side-by-side */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-6">
            {/* Left: Input Preview */}
            <div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">
                {step === 'result' ? '原始数据' : '数据预览'}
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="p-2.5 text-left font-semibold text-slate-700 border-b whitespace-nowrap">Days</th>
                      {inputData.groups.map((g) => (
                        <th key={g} className="p-2.5 text-left font-semibold text-slate-700 border-b whitespace-nowrap">{g}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {inputData.days.map((day, i) => (
                      <tr key={i} className={`border-b border-slate-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                        <td className="p-2.5 text-slate-800 font-medium">{day}</td>
                        {inputData.values[i].map((v, j) => (
                          <td key={j} className="p-2.5 text-slate-700">{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Config or Result */}
            <div className="mt-4 lg:mt-0">
              {step === 'preview' && (
                <div>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">输出设置</h3>
                  <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                    <label className="block text-sm text-slate-600 mb-1.5 font-medium">
                      第一列列名
                    </label>
                    <input
                      type="text"
                      value={columnName}
                      onChange={(e) => setColumnName(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow"
                      placeholder="输入列名，如：Days、天数、Time"
                    />
                    <button
                      onClick={handleConvert}
                      disabled={isProcessing}
                      className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-teal-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-teal-200"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                      </svg>
                      {isProcessing ? '展开中…' : '展开数据'}
                    </button>
                  </div>
                </div>
              )}
              {step === 'result' && result && (
                <div>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">展开结果 <span className="text-slate-400 font-normal">（{result.rows.length} 行）</span></h3>
                  <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-80 overflow-y-auto shadow-sm">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0">
                        <tr className="bg-slate-100">
                          {result.headers.map((h) => (
                            <th key={h} className="p-2.5 text-left font-semibold text-slate-700 border-b whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.slice(0, 100).map((row, i) => (
                          <tr key={i} className={`border-b border-slate-100 text-xs ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                            {result.headers.map((h) => (
                              <td key={h} className="p-2 text-slate-700">{row[h]}</td>
                            ))}
                          </tr>
                        ))}
                        {result.rows.length > 100 && (
                          <tr><td colSpan={result.headers.length} className="p-3 text-center text-slate-400 text-xs">仅显示前 100 行</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-teal-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-teal-700 transition-colors shadow-sm shadow-teal-200"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    下载 Excel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Processing overlay */}
      {isProcessing && step !== 'upload' && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full mx-auto mb-2" />
          <p className="text-sm text-slate-500">正在处理…</p>
        </div>
      )}
    </div>
  )
}

/** Internal: parse File to ParsedExcelData */
async function parseFile(file: File): Promise<ParsedExcelData> {
  const buf = await file.arrayBuffer()
  const workbook = XLSX.read(new Uint8Array(buf), { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const jsonData = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1 })

  if (jsonData.length < 2) throw new Error('文件至少需要两行：标题行 + 数据行')

  const groups = (jsonData[0] as (string | number)[]).slice(1).map(String)
  const days: string[] = []
  const values: number[][] = []

  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i] as (string | number)[]
    if (row[0] === undefined || row[0] === null || row[0] === '') break
    days.push(String(row[0]))
    values.push(row.slice(1).map((v) => { const n = Number(v); return isNaN(n) ? 0 : n }))
  }

  return { days, groups, values }
}
