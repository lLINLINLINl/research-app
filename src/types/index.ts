export interface ParsedExcelData {
  days: string[]
  groups: string[]
  values: number[][] // values[dayIndex][groupIndex]
}

export interface OutputRow {
  [key: string]: string | number
}

export interface ConverterResult {
  headers: string[]
  rows: OutputRow[]
}

export interface Tab {
  id: string
  label: string
}
