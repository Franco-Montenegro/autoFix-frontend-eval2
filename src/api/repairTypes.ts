import type { RepairType, RepairTypeRequest } from '../types/repairType'
import { apiRequest } from './client'

export function getRepairTypes(): Promise<RepairType[]> {
  return apiRequest<RepairType[]>('/repair-types')
}

export function createRepairType(request: RepairTypeRequest): Promise<RepairType> {
  return apiRequest<RepairType>('/repair-types', { method: 'POST', body: request })
}

export function updateRepairType(id: number, request: RepairTypeRequest): Promise<RepairType> {
  return apiRequest<RepairType>(`/repair-types/${id}`, { method: 'PUT', body: request })
}
