import type { BonusResponse, CreateBonusRequest } from '../types/bonus'
import { apiRequest } from './client'

export function bonusesQueryKey(year: number, month: number) {
  return ['bonuses', year, month] as const
}

export function getBonuses(year: number, month: number): Promise<BonusResponse[]> {
  return apiRequest<BonusResponse[]>('/bonuses', { query: { year, month } })
}

export function createBonus(request: CreateBonusRequest): Promise<BonusResponse> {
  return apiRequest<BonusResponse>('/bonuses', { method: 'POST', body: request })
}
