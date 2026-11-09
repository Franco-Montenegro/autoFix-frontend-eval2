import type { EngineType, VehicleType } from './enums'

export interface VehicleResponse {
  id: number
  licensePlate: string
  brand: string
  model: string
  vehicleType: VehicleType
  manufactureYear: number
  engineType: EngineType
  seats: number
}

export interface CreateVehicleRequest {
  licensePlate: string
  brand: string
  model: string
  vehicleType: VehicleType
  manufactureYear: number
  engineType: EngineType
  seats: number
}
