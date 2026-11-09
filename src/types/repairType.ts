/** Reparación del catálogo con su precio por tipo de motor. Precio 0 = no aplica. */
export interface RepairType {
  id: number
  name: string
  priceGasoline: number
  priceDiesel: number
  priceHybrid: number
  priceElectric: number
}

/** Body para crear o modificar una reparación (HU2). */
export type RepairTypeRequest = Omit<RepairType, 'id'>
