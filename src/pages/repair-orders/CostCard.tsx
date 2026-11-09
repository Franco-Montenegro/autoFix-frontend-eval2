import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { recalculateCost, repairOrderQueryKey } from '../../api/repairOrders'
import { vehicleRepairOrdersQueryKey } from '../../api/vehicles'
import { ErrorAlert } from '../../components/ErrorAlert'
import { useNotify } from '../../components/notifications/useNotify'
import type { RepairOrderCost, RepairOrderResponse } from '../../types/repairOrder'
import { formatCLP } from '../../utils/format'

type CostLine = { label: string; field: keyof RepairOrderCost; sign: 1 | -1 }

const COST_LINES: CostLine[] = [
  { label: 'Subtotal de reparaciones', field: 'repairsSubtotal', sign: 1 },
  { label: 'Recargo por kilometraje', field: 'mileageSurcharge', sign: 1 },
  { label: 'Recargo por antigüedad', field: 'ageSurcharge', sign: 1 },
  { label: 'Recargo por retraso en el retiro', field: 'delaySurcharge', sign: 1 },
  { label: 'Descuento por número de reparaciones', field: 'repairCountDiscount', sign: -1 },
  { label: 'Descuento por día de atención', field: 'dayDiscount', sign: -1 },
  { label: 'Descuento por bono', field: 'bonusDiscount', sign: -1 },
  { label: 'IVA', field: 'taxAmount', sign: 1 },
]

/** Muestra un descuento con signo negativo; los montos vienen de la API sin recalcular. */
function formatLine(amount: number, sign: 1 | -1): string {
  return sign === -1 && amount > 0 ? `− ${formatCLP(amount)}` : formatCLP(amount)
}

/** Desglose del costo de un ingreso entregado, con la opción de recalcularlo. */
export function CostCard({ order }: { order: RepairOrderResponse }) {
  const queryClient = useQueryClient()
  const notify = useNotify()

  const mutation = useMutation({
    mutationFn: () => recalculateCost(order.id),
    onSuccess: async (updated) => {
      queryClient.setQueryData(repairOrderQueryKey(order.id), updated)
      await queryClient.invalidateQueries({
        queryKey: vehicleRepairOrdersQueryKey(updated.licensePlate),
      })
      notify('Costo recalculado')
    },
  })

  const cost = order.cost

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
            Costo de la reparación
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Recalcular
          </Button>
        </Box>
        {mutation.error && (
          <Box sx={{ mb: 2 }}>
            <ErrorAlert error={mutation.error} />
          </Box>
        )}
        {cost ? (
          <>
            <Table size="small">
              <TableBody>
                {COST_LINES.map((line) => (
                  <TableRow key={line.field}>
                    <TableCell sx={{ pl: 0 }}>{line.label}</TableCell>
                    <TableCell align="right" sx={{ pr: 0 }}>
                      {formatLine(cost[line.field], line.sign)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" component="p">
                Total
              </Typography>
              <Typography variant="h6" component="p">
                {formatCLP(cost.totalAmount)}
              </Typography>
            </Box>
          </>
        ) : (
          <Typography color="text.secondary">
            El costo aún no está calculado. Use "Recalcular" para calcularlo.
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
