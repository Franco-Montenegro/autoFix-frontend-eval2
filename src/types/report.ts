import type { EngineType, RepairOrderStatus, VehicleType } from './enums'

/** HU4: una fila por ingreso; un vehículo sin ingresos aparece con los campos del ingreso en `null`. */
export interface HistoryRow {
  licensePlate: string
  brand: string
  model: string
  vehicleType: VehicleType
  manufactureYear: number
  engineType: EngineType
  repairOrderId: number | null
  status: RepairOrderStatus | null
  entryDateTime: string | null
  /** Monto total de las reparaciones (se conoce desde el ingreso). */
  repairsAmount: number | null
  /** Recargos, descuentos, sub total, IVA y total: `null` hasta que se registra el retiro. */
  surchargesAmount: number | null
  discountsAmount: number | null
  subTotal: number | null
  taxAmount: number | null
  totalAmount: number | null
  readyDateTime: string | null
  pickupDateTime: string | null
}

export interface CountAmount {
  count: number
  amount: number
}

/** HU5, Reporte 1: reparaciones × tipos de vehículo de un mes. */
export interface Report1 {
  year: number
  month: number
  vehicleTypes: VehicleType[]
  rows: {
    repairTypeId: number
    name: string
    cells: Record<VehicleType, CountAmount>
    total: CountAmount
  }[]
  columnTotals: Record<VehicleType, CountAmount>
  grandTotal: CountAmount
}

/** HU6, Reporte 2: el mes elegido y los dos anteriores ("2026-10"). Variación `null` = "—". */
export interface Report2 {
  month: string
  previous: string
  beforePrevious: string
  rows: {
    repairTypeId: number
    name: string
    month: CountAmount
    previous: CountAmount
    beforePrevious: CountAmount
    countVariation: number | null
    amountVariation: number | null
    previousCountVariation: number | null
    previousAmountVariation: number | null
  }[]
}
