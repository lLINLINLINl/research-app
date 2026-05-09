import { describe, it, expect } from 'vitest'
import { transformData } from './dataTransformer'
import type { ParsedExcelData } from '../types'

describe('transformData', () => {
  it('should expand daily counts into individual rows', () => {
    const input: ParsedExcelData = {
      days: ['Day 1', 'Day 2'],
      groups: ['Control', 'Treatment'],
      values: [
        [3, 2],
        [1, 4],
      ],
    }
    const result = transformData(input, 'Time')
    expect(result.headers).toEqual(['Time', 'Control', 'Treatment'])
    expect(result.rows).toHaveLength(7)
    expect(result.rows[0]).toEqual({ Time: 'Day 1', Control: 1, Treatment: 1 })
    expect(result.rows[1]).toEqual({ Time: 'Day 1', Control: 1, Treatment: 1 })
    expect(result.rows[2]).toEqual({ Time: 'Day 1', Control: 1, Treatment: '' })
    expect(result.rows[3]).toEqual({ Time: 'Day 2', Control: 1, Treatment: 1 })
    expect(result.rows[4]).toEqual({ Time: 'Day 2', Control: '', Treatment: 1 })
    expect(result.rows[5]).toEqual({ Time: 'Day 2', Control: '', Treatment: 1 })
    expect(result.rows[6]).toEqual({ Time: 'Day 2', Control: '', Treatment: 1 })
  })

  it('should skip days where all values are zero', () => {
    const input: ParsedExcelData = {
      days: ['Day 1'],
      groups: ['Control'],
      values: [[0]],
    }
    const result = transformData(input, 'Time')
    expect(result.rows).toHaveLength(0)
  })

  it('should handle single group', () => {
    const input: ParsedExcelData = {
      days: ['Day 1'],
      groups: ['Control'],
      values: [[2]],
    }
    const result = transformData(input, 'Day')
    expect(result.headers).toEqual(['Day', 'Control'])
    expect(result.rows).toHaveLength(2)
    expect(result.rows[0]).toEqual({ Day: 'Day 1', Control: 1 })
    expect(result.rows[1]).toEqual({ Day: 'Day 1', Control: 1 })
  })

  it('should use custom column name for first column', () => {
    const input: ParsedExcelData = {
      days: ['Day 1'],
      groups: ['Control'],
      values: [[1]],
    }
    const result = transformData(input, '自定义名称')
    expect(result.headers[0]).toBe('自定义名称')
    expect(result.rows[0]).toHaveProperty('自定义名称')
  })
})
