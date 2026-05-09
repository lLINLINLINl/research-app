import * as XLSX from 'xlsx'
import type { ParsedExcelData, OutputRow } from '../types'

export function parseExcelFile(file: File): Promise<ParsedExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1 })

        if (jsonData.length < 2) {
          reject(new Error('文件至少需要两行：标题行 + 数据行'))
          return
        }

        const groups = (jsonData[0] as (string | number)[]).slice(1).map(String)
        const days: string[] = []
        const values: number[][] = []

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as (string | number)[]
          if (row[0] === undefined || row[0] === null || row[0] === '') break
          days.push(String(row[0]))
          values.push(
            row.slice(1).map(v => {
              const num = Number(v)
              return isNaN(num) ? 0 : num
            })
          )
        }

        resolve({ days, groups, values })
      } catch {
        reject(new Error('文件解析失败，请确保是有效的 .xlsx 文件'))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

export function generateExcel(rows: OutputRow[], headers: string[]): void {
  const ws = XLSX.utils.json_to_sheet(rows, { header: headers })
  ws['!cols'] = headers.map(() => ({ wch: 14 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '展开结果')
  XLSX.writeFile(wb, '生存曲线数据_展开结果.xlsx')
}
