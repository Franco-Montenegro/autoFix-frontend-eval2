import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import {
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { getHistory } from '../../api/reports'
import { ErrorAlert } from '../../components/ErrorAlert'
import { Loading } from '../../components/Loading'
import { PageHeader } from '../../components/PageHeader'
import type { HistoryRow } from '../../types/report'
import { formatCLP, formatDate, formatTime } from '../../utils/format'
import { ENGINE_TYPE_LABELS, VEHICLE_TYPE_LABELS } from '../../utils/labels'

/** Columnas en el orden del enunciado (HU4). */
const COLUMNS: { label: string; align?: 'right'; value: (row: HistoryRow) => string | number }[] = [
  { label: 'Patente', value: (row) => row.licensePlate },
  { label: 'Marca', value: (row) => row.brand },
  { label: 'Modelo', value: (row) => row.model },
  { label: 'Tipo vehículo', value: (row) => VEHICLE_TYPE_LABELS[row.vehicleType] },
  { label: 'Año fabricación', value: (row) => row.manufactureYear },
  { label: 'Tipo motor', value: (row) => ENGINE_TYPE_LABELS[row.engineType] },
  { label: 'Fecha ingreso', value: (row) => formatDate(row.entryDateTime) },
  { label: 'Hora ingreso', value: (row) => formatTime(row.entryDateTime) },
  { label: 'Monto total reparaciones', align: 'right', value: (row) => formatCLP(row.repairsAmount) },
  { label: 'Monto recargos', align: 'right', value: (row) => formatCLP(row.surchargesAmount) },
  { label: 'Monto dctos.', align: 'right', value: (row) => formatCLP(row.discountsAmount) },
  { label: 'Sub total', align: 'right', value: (row) => formatCLP(row.subTotal) },
  { label: 'Monto IVA', align: 'right', value: (row) => formatCLP(row.taxAmount) },
  { label: 'Costo total', align: 'right', value: (row) => formatCLP(row.totalAmount) },
  { label: 'Fecha salida', value: (row) => formatDate(row.readyDateTime) },
  { label: 'Hora salida', value: (row) => formatTime(row.readyDateTime) },
  { label: 'Fecha retiro', value: (row) => formatDate(row.pickupDateTime) },
  { label: 'Hora retiro', value: (row) => formatTime(row.pickupDateTime) },
]

/** HU4: todos los vehículos con todos los campos del historial de reparaciones. */
export function HistoryPage() {
  const navigate = useNavigate()
  const { data, isPending, error } = useQuery({ queryKey: ['history'], queryFn: getHistory })

  return (
    <>
      <PageHeader title="Historial de reparaciones" />
      <Typography color="text.secondary" sx={{ mt: -2, mb: 3 }}>
        Una fila por ingreso al taller. Los montos de recargos, descuentos, IVA y total se calculan al
        registrar el retiro del vehículo.
      </Typography>
      {isPending && <Loading />}
      {error && <ErrorAlert error={error} />}
      {data && data.length === 0 && <Alert severity="info">No hay vehículos registrados.</Alert>}
      {data && data.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {COLUMNS.map((column) => (
                  <TableCell key={column.label} align={column.align} sx={{ whiteSpace: 'nowrap' }}>
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow
                  key={`${row.licensePlate}-${row.repairOrderId ?? 'sin-ingresos'}`}
                  hover
                  onClick={() =>
                    void navigate(
                      row.repairOrderId === null
                        ? `/vehicles/${row.licensePlate}`
                        : `/repair-orders/${row.repairOrderId}`,
                    )
                  }
                  sx={{ cursor: 'pointer' }}
                >
                  {COLUMNS.map((column) => (
                    <TableCell key={column.label} align={column.align} sx={{ whiteSpace: 'nowrap' }}>
                      {column.value(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  )
}
