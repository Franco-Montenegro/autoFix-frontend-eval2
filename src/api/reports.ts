import type { HistoryRow, Report1, Report2 } from '../types/report'
import { apiRequest } from './client'

/** HU4 (M3): todos los vehículos con todos los campos del historial. */
export function getHistory(): Promise<HistoryRow[]> {
  return apiRequest<HistoryRow[]>('/history')
}

/** HU5 (M4). */
export function getReport1(year: number, month: number): Promise<Report1> {
  return apiRequest<Report1>('/reports/r1', { query: { year, month } })
}

/** HU6 (M4). */
export function getReport2(year: number, month: number): Promise<Report2> {
  return apiRequest<Report2>('/reports/r2', { query: { year, month } })
}
