import type { RepairOrderResponse } from '../types/repairOrder'
import type { CreateVehicleRequest, VehicleResponse } from '../types/vehicle'
import { apiRequest } from './client'

export function getVehicles(): Promise<VehicleResponse[]> {
  return apiRequest<VehicleResponse[]>('/vehicles')
}

export function getVehicle(licensePlate: string): Promise<VehicleResponse> {
  return apiRequest<VehicleResponse>(`/vehicles/${encodeURIComponent(licensePlate)}`)
}

export function createVehicle(request: CreateVehicleRequest): Promise<VehicleResponse> {
  return apiRequest<VehicleResponse>('/vehicles', { method: 'POST', body: request })
}

export function getVehicleRepairOrders(licensePlate: string): Promise<RepairOrderResponse[]> {
  return apiRequest<RepairOrderResponse[]>(
    "/repair-orders", { query: { licensePlate } },
  )
}

export function vehicleQueryKey(licensePlate: string) {
  return ['vehicles', licensePlate] as const
}

export function vehicleRepairOrdersQueryKey(licensePlate: string) {
  return ['vehicles', licensePlate, 'repair-orders'] as const
}
