import type { ParsedExcelData, ConverterResult, OutputRow } from '../types'

export function transformData(
  data: ParsedExcelData,
  firstColumnName: string
): ConverterResult {
  const headers = [firstColumnName, ...data.groups]
  const rows: OutputRow[] = []

  for (let dayIdx = 0; dayIdx < data.days.length; dayIdx++) {
    const dayValues = data.values[dayIdx]
    const maxDeaths = Math.max(...dayValues, 0)
    if (maxDeaths === 0) continue

    for (let rowNum = 0; rowNum < maxDeaths; rowNum++) {
      const row: OutputRow = { [firstColumnName]: data.days[dayIdx] }
      for (let groupIdx = 0; groupIdx < data.groups.length; groupIdx++) {
        row[data.groups[groupIdx]] = rowNum < dayValues[groupIdx] ? 1 : ''
      }
      rows.push(row)
    }
  }

  return { headers, rows }
}
