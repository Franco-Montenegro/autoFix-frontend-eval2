import type { EngineType, RepairOrderStatus, VehicleType } from '../types/enums'

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  SEDAN: 'Sedán',
  HATCHBACK: 'Hatchback',
  SUV: 'SUV',
  PICKUP: 'Pickup',
  VAN: 'Furgoneta',
}

export const ENGINE_TYPE_LABELS: Record<EngineType, string> = {
  GASOLINE: 'Gasolina',
  DIESEL: 'Diésel',
  HYBRID: 'Híbrido',
  ELECTRIC: 'Eléctrico',
}

export const REPAIR_ORDER_STATUS_LABELS: Record<RepairOrderStatus, string> = {
  IN_REPAIR: 'En reparación',
  READY: 'Listo para retiro',
  DELIVERED: 'Entregado',
}

/** Opciones para un select, en el orden de declaración de las etiquetas. */
export function toOptions<T extends string>(labels: Record<T, string>): { value: T; label: string }[] {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }))
}
