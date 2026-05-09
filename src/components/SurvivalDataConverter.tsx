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
  const [columnName, setColumnName] = useState('天数')
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
      const r = transformData(inputData, columnName.trim() || '天数')
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
    setColumnName('天数')
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
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
          <button onClick={() => setError('')} className="ml-2 font-medium">✕</button>
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div>
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-slate-800">生存曲线数据转换</h2>
            <p className="text-slate-500 text-sm mt-1">
              将汇总死亡计数表展开为个体级数据，用于 Kaplan-Meier 生存分析
            </p>
          </div>
          <div
            ref={dropRef}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-xl p-12 sm:p-16 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-colors"
          >
            <svg className="w-12 h-12 mx-auto text-teal-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-6m0 0l-2 2m2-2l2 2m-7 4v2a2 2 0 002 2h10a2 2 0 002-2v-2M7 8V6a2 2 0 012-2h6a2 2 0 012 2v2" />
            </svg>
            <p className="text-slate-700 font-medium mb-1">拖拽 Excel 文件到此处</p>
            <p className="text-slate-400 text-sm mb-4">或点击选择文件 · 支持 .xlsx</p>
            <span className="inline-block border border-teal-600 text-teal-600 px-5 py-2 rounded-lg text-sm font-medium hover:bg-teal-50 transition-colors">
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
          <div className="text-center mt-6">
            <button
              onClick={loadSample}
              className="text-teal-600 text-sm hover:text-teal-700 underline underline-offset-2"
            >
              加载示例数据体验 →
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
            <button onClick={handleReset} className="text-sm text-slate-400 hover:text-slate-600">
              ← 重新上传
            </button>
          </div>

          {/* Desktop: side-by-side */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-6">
            {/* Left: Input Preview */}
            <div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">
                {step === 'result' ? '原始数据' : '数据预览'}
              </h3>
              <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-2.5 text-left font-medium text-slate-600 border-b whitespace-nowrap">天数</th>
                      {inputData.groups.map((g) => (
                        <th key={g} className="p-2.5 text-left font-medium text-slate-600 border-b whitespace-nowrap">{g}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {inputData.days.map((day, i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0">
                        <td className="p-2.5 text-slate-800">{day}</td>
                        {inputData.values[i].map((v, j) => (
                          <td key={j} className="p-2.5 text-slate-800">{v}</td>
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
                  <div className="border border-slate-200 rounded-lg p-4">
                    <label className="block text-sm text-slate-600 mb-1.5">
                      第一列列名
                    </label>
                    <input
                      type="text"
                      value={columnName}
                      onChange={(e) => setColumnName(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="输入列名，如：天数、Day、Time"
                    />
                    <button
                      onClick={handleConvert}
                      disabled={isProcessing}
                      className="mt-4 w-full bg-teal-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-teal-700 disabled:opacity-50 transition-colors"
                    >
                      {isProcessing ? '处理中…' : '⚡ 展开数据'}
                    </button>
                  </div>
                </div>
              )}
              {step === 'result' && result && (
                <div>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">展开结果 <span className="text-slate-400 font-normal">（{result.rows.length} 行）</span></h3>
                  <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-80 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-white">
                        <tr className="bg-slate-50">
                          {result.headers.map((h) => (
                            <th key={h} className="p-2.5 text-left font-medium text-slate-600 border-b whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.slice(0, 100).map((row, i) => (
                          <tr key={i} className="border-b border-slate-100 text-xs">
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
                    className="mt-4 w-full bg-teal-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-teal-700 transition-colors"
                  >
                    📋 下载 Excel
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
