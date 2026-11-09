import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import type { CountAmount, Report1 } from '../../types/report'
import { formatCLP } from '../../utils/format'
import { VEHICLE_TYPE_LABELS } from '../../utils/labels'

function MatrixCell({ value, total = false }: { value: CountAmount; total?: boolean }) {
  const empty = value.count === 0
  return (
    <TableCell align="right" sx={{ bgcolor: total ? 'action.hover' : undefined, whiteSpace: 'nowrap' }}>
      <Box sx={{ color: empty ? 'text.disabled' : undefined, fontWeight: total ? 600 : undefined }}>
        <Typography variant="body2" component="div" sx={{ fontWeight: 'inherit' }}>
          {value.count}
        </Typography>
        <Typography
          variant="caption"
          component="div"
          color={empty ? 'inherit' : 'text.secondary'}
          sx={{ fontWeight: 'inherit' }}
        >
          {empty ? '—' : formatCLP(value.amount)}
        </Typography>
      </Box>
    </TableCell>
  )
}

/** HU5: reparaciones × tipos de vehículo, con cantidad (arriba) y monto (abajo) por celda, y totales. */
export function RepairMatrixTable({ data }: { data: Report1 }) {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Lista de reparaciones</TableCell>
            {data.vehicleTypes.map((type) => (
              <TableCell key={type} align="right">
                {VEHICLE_TYPE_LABELS[type]}
              </TableCell>
            ))}
            <TableCell align="right" sx={{ bgcolor: 'action.hover', fontWeight: 600 }}>
              TOTAL
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.rows.map((row) => (
            <TableRow key={row.repairTypeId} hover>
              <TableCell>{row.name}</TableCell>
              {data.vehicleTypes.map((type) => (
                <MatrixCell key={type} value={row.cells[type]} />
              ))}
              <MatrixCell value={row.total} total />
            </TableRow>
          ))}
          <TableRow>
            <TableCell sx={{ bgcolor: 'action.hover', fontWeight: 600 }}>TOTAL</TableCell>
            {data.vehicleTypes.map((type) => (
              <MatrixCell key={type} value={data.columnTotals[type]} total />
            ))}
            <MatrixCell value={data.grandTotal} total />
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}
