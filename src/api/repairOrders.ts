import type { AssignBonusRequest } from '../types/bonus'
import type {
  CreateRepairOrderRequest,
  RepairOrderDateTimeRequest,
  RepairOrderResponse,
} from '../types/repairOrder'
import { apiRequest } from './client'

export function repairOrderQueryKey(id: number | string) {
  return ['repair-orders', String(id)] as const
}

export function createRepairOrder(request: CreateRepairOrderRequest): Promise<RepairOrderResponse> {
  return apiRequest<RepairOrderResponse>('/repair-orders', { method: 'POST', body: request })
}

export function getRepairOrder(id: string): Promise<RepairOrderResponse> {
  return apiRequest<RepairOrderResponse>(`/repair-orders/${encodeURIComponent(id)}`)
}

/** Registra la salida de la reparación (IN_REPAIR → READY). */
export function registerReady(
  id: number,
  request: RepairOrderDateTimeRequest,
): Promise<RepairOrderResponse> {
  return apiRequest<RepairOrderResponse>(`/repair-orders/${id}/ready`, {
    method: 'PATCH',
    body: request,
  })
}

/** Registra el retiro del vehículo (READY → DELIVERED); la API calcula el costo. */
export function registerPickup(
  id: number,
  request: RepairOrderDateTimeRequest,
): Promise<RepairOrderResponse> {
  return apiRequest<RepairOrderResponse>(`/repair-orders/${id}/pickup`, {
    method: 'PATCH',
    body: request,
  })
}

/** Asigna un bono al ingreso (solo antes del retiro). */
export function assignBonus(id: number, request: AssignBonusRequest): Promise<RepairOrderResponse> {
  return apiRequest<RepairOrderResponse>(`/repair-orders/${id}/bonus`, {
    method: 'PUT',
    body: request,
  })
}

/** Quita el bono del ingreso y libera su cupo (solo antes del retiro). */
export function removeBonus(id: number): Promise<void> {
  return apiRequest<void>(`/repair-orders/${id}/bonus`, { method: 'DELETE' })
}

/** Vuelve a calcular el costo de un ingreso entregado. */
export function recalculateCost(id: number): Promise<RepairOrderResponse> {
  return apiRequest<RepairOrderResponse>(`/repair-orders/${id}/cost`, { method: 'POST' })
}
