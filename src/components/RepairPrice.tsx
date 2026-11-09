import { Typography } from '@mui/material'
import { formatCLP } from '../utils/format'

/** Precio de catálogo de una reparación; 0 significa que no aplica para ese motor. */
export function RepairPrice({ price }: { price: number }) {
  return (
    <Typography variant="body2" component="span" color={price === 0 ? 'text.disabled' : undefined}>
      {price === 0 ? 'No aplica' : formatCLP(price)}
    </Typography>
  )
}
