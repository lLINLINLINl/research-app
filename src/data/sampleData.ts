import type { ParsedExcelData } from '../types'

export const sampleData: ParsedExcelData = {
  days: ['第1天', '第3天', '第7天', '第10天', '第14天', '第21天', '第28天'],
  groups: ['对照组', '低剂量组', '高剂量组'],
  values: [
    [0, 0, 0],  // 第1天
    [1, 0, 0],  // 第3天
    [3, 1, 0],  // 第7天
    [2, 2, 1],  // 第10天
    [4, 3, 1],  // 第14天
    [3, 2, 2],  // 第21天
    [1, 1, 0],  // 第28天
  ],
}
