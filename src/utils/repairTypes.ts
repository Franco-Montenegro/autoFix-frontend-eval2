import type { EngineType } from '../types/enums'
import type { RepairType } from '../types/repairType'

/** Precio de catálogo de una reparación para un tipo de motor. Precio 0 = no aplica. */
export function priceForEngine(repair: RepairType, engine: EngineType): number {
  switch (engine) {
    case 'GASOLINE':
      return repair.priceGasoline
    case 'DIESEL':
      return repair.priceDiesel
    case 'HYBRID':
      return repair.priceHybrid
    case 'ELECTRIC':
      return repair.priceElectric
  }
}
