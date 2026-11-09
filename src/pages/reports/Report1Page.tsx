import { useQuery } from '@tanstack/react-query'
import { Typography } from '@mui/material'
import { getReport1 } from '../../api/reports'
import { ErrorAlert } from '../../components/ErrorAlert'
import { Loading } from '../../components/Loading'
import { PageHeader } from '../../components/PageHeader'
import { MonthYearPicker } from '../../components/month-year/MonthYearPicker'
import { useYearMonth } from '../../components/month-year/useYearMonth'
import { RepairMatrixTable } from './RepairMatrixTable'

/** HU5: tipos de reparación vs tipos de vehículo de un mes, con cantidad y monto. */
export function Report1Page() {
  const [period, setPeriod] = useYearMonth()
  const { data, isPending, error } = useQuery({
    queryKey: ['reports', 'r1', period.year, period.month],
    queryFn: () => getReport1(period.year, period.month),
  })

  return (
    <>
      <PageHeader title="Reporte 1: Reparaciones por tipo de vehículo" />
      <Typography color="text.secondary" sx={{ mt: -2, mb: 3 }}>
        Cantidad de reparaciones y monto total del mes, según la fecha de cada reparación.
      </Typography>
      <MonthYearPicker key={`${period.year}-${period.month}`} value={period} onChange={setPeriod} />
      {isPending && <Loading />}
      {error && <ErrorAlert error={error} />}
      {data && <RepairMatrixTable data={data} />}
    </>
  )
}
