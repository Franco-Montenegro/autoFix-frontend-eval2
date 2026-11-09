import { Chip, type ChipProps } from '@mui/material'
import type { RepairOrderStatus } from '../types/enums'
import { REPAIR_ORDER_STATUS_LABELS } from '../utils/labels'

const STATUS_COLORS: Record<RepairOrderStatus, ChipProps['color']> = {
  IN_REPAIR: 'warning',
  READY: 'info',
  DELIVERED: 'success',
}

export function RepairOrderStatusChip({ status }: { status: RepairOrderStatus }) {
  return (
    <Chip size="small" color={STATUS_COLORS[status]} label={REPAIR_ORDER_STATUS_LABELS[status]} />
  )
}
