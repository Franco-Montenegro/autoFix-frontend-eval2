import { useQuery } from '@tanstack/react-query'
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
import { getReport2 } from '../../api/reports'
import { ErrorAlert } from '../../components/ErrorAlert'
import { Loading } from '../../components/Loading'
import { PageHeader } from '../../components/PageHeader'
import { MonthYearPicker } from '../../components/month-year/MonthYearPicker'
import { useYearMonth } from '../../components/month-year/useYearMonth'
import type { CountAmount } from '../../types/report'
import { formatCLP, formatVariation, formatYearMonth } from '../../utils/format'

/** Celda de dos líneas, como en el enunciado: arriba la cantidad y abajo el monto. */
function TwoLineCell({ top, bottom, muted = false }: { top: string; bottom: string; muted?: boolean }) {
  return (
    <TableCell align="right" sx={{ whiteSpace: 'nowrap', bgcolor: muted ? 'action.hover' : undefined }}>
      <Typography variant="body2">{top}</Typography>
      <Typography variant="caption" color="text.secondary">
        {bottom}
      </Typography>
    </TableCell>
  )
}

function MonthCell({ value }: { value: CountAmount }) {
  return <TwoLineCell top={String(value.count)} bottom={formatCLP(value.amount)} />
}

function VariationCell({ count, amount }: { count: number | null; amount: number | null }) {
  return <TwoLineCell top={formatVariation(count)} bottom={formatVariation(amount)} muted />
}

/** HU6: comparativo de cada reparación en el mes elegido respecto de los dos meses previos. */
export function Report2Page() {
  const [period, setPeriod] = useYearMonth()
  const { data, isPending, error } = useQuery({
    queryKey: ['reports', 'r2', period.year, period.month],
    queryFn: () => getReport2(period.year, period.month),
  })

  return (
    <>
      <PageHeader title="Reporte 2: Comparativo mensual" />
      <Typography color="text.secondary" sx={{ mt: -2, mb: 3 }}>
        Cantidad (arriba) y monto (abajo) de cada reparación en el mes elegido y los dos anteriores.
        La variación compara cada mes con el anterior; "—" indica que el mes anterior no tuvo
        reparaciones.
      </Typography>
      <MonthYearPicker key={`${period.year}-${period.month}`} value={period} onChange={setPeriod} />
      {isPending && <Loading />}
      {error && <ErrorAlert error={error} />}
      {data && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Reparación</TableCell>
                <TableCell align="right">{formatYearMonth(data.month)}</TableCell>
                <TableCell align="right" sx={{ bgcolor: 'action.hover' }}>
                  % Variación
                </TableCell>
                <TableCell align="right">{formatYearMonth(data.previous)}</TableCell>
                <TableCell align="right" sx={{ bgcolor: 'action.hover' }}>
                  % Variación
                </TableCell>
                <TableCell align="right">{formatYearMonth(data.beforePrevious)}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.rows.map((row) => (
                <TableRow key={row.repairTypeId} hover>
                  <TableCell>
                    <Box sx={{ minWidth: 220 }}>{row.name}</Box>
                  </TableCell>
                  <MonthCell value={row.month} />
                  <VariationCell count={row.countVariation} amount={row.amountVariation} />
                  <MonthCell value={row.previous} />
                  <VariationCell count={row.previousCountVariation} amount={row.previousAmountVariation} />
                  <MonthCell value={row.beforePrevious} />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  )
}
