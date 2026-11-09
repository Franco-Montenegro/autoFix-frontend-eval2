/** Marcas con convenio de bonos (docs/api.md, "Bonos"). */
export const BONUS_BRANDS = ['TOYOTA', 'FORD', 'HYUNDAI', 'HONDA'] as const

export type BonusBrand = (typeof BONUS_BRANDS)[number]

export interface BonusResponse {
  id: number
  brand: string
  year: number
  month: number
  quantity: number
  /** Monto de cada bono, en pesos. */
  amount: number
  used: number
  available: number
}

export interface CreateBonusRequest {
  brand: BonusBrand
  year: number
  month: number
  quantity: number
  amount: number
}

export interface AssignBonusRequest {
  bonusId: number
}
