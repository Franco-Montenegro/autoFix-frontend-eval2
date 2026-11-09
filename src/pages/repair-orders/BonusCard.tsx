import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import { bonusesQueryKey, getBonuses } from '../../api/bonuses'
import { assignBonus, removeBonus, repairOrderQueryKey } from '../../api/repairOrders'
import { getVehicle, vehicleQueryKey } from '../../api/vehicles'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { ErrorAlert } from '../../components/ErrorAlert'
import { Loading } from '../../components/Loading'
import { useNotify } from '../../components/notifications/useNotify'
import type { RepairOrderResponse } from '../../types/repairOrder'
import { yearMonthOf } from '../../utils/dateTime'
import { formatCLP } from '../../utils/format'

/** Selector de bono para un ingreso abierto sin bono. */
function AssignBonusForm({ order }: { order: RepairOrderResponse }) {
  const queryClient = useQueryClient()
  const notify = useNotify()
  const [bonusId, setBonusId] = useState('')
  const { year, month } = yearMonthOf(order.entryDateTime)

  const vehicleQuery = useQuery({
    queryKey: vehicleQueryKey(order.licensePlate),
    queryFn: () => getVehicle(order.licensePlate),
  })
  const bonusesQuery = useQuery({
    queryKey: bonusesQueryKey(year, month),
    queryFn: () => getBonuses(year, month),
  })

  const mutation = useMutation({
    mutationFn: (id: number) => assignBonus(order.id, { bonusId: id }),
    onSuccess: async (updated) => {
      queryClient.setQueryData(repairOrderQueryKey(order.id), updated)
      await queryClient.invalidateQueries({ queryKey: ['bonuses'] })
      notify('Bono asignado')
    },
  })

  if (vehicleQuery.isPending || bonusesQuery.isPending) return <Loading />
  if (vehicleQuery.error) return <ErrorAlert error={vehicleQuery.error} />
  if (bonusesQuery.error) return <ErrorAlert error={bonusesQuery.error} />

  // Solo se ofrecen opciones válidas; la regla real la aplica la API (409/422).
  const brand = vehicleQuery.data.brand
  const options = bonusesQuery.data.filter(
    (bonus) => bonus.brand === brand && bonus.available > 0,
  )

  if (options.length === 0) {
    return (
      <Typography color="text.secondary">
        No hay bonos disponibles de {brand} para {month}/{year}.
      </Typography>
    )
  }

  return (
    <>
      {mutation.error && (
        <Box sx={{ mb: 2 }}>
          <ErrorAlert error={mutation.error} />
        </Box>
      )}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
        <TextField
          size="small"
          select
          label="Bono"
          value={bonusId}
          onChange={(event) => setBonusId(event.target.value)}
          sx={{ minWidth: 280 }}
        >
          {options.map((bonus) => (
            <MenuItem key={bonus.id} value={String(bonus.id)}>
              {bonus.brand} {bonus.month}/{bonus.year} · {formatCLP(bonus.amount)} (
              {bonus.available} disponibles)
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant="contained"
          disabled={bonusId === ''}
          loading={mutation.isPending}
          onClick={() => mutation.mutate(Number(bonusId))}
        >
          Asignar
        </Button>
      </Box>
    </>
  )
}

/** Bono del ingreso: asignar o quitar antes del retiro; solo lectura después. */
export function BonusCard({ order }: { order: RepairOrderResponse }) {
  const queryClient = useQueryClient()
  const notify = useNotify()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const editable = order.status !== 'DELIVERED'

  const removeMutation = useMutation({
    mutationFn: () => removeBonus(order.id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: repairOrderQueryKey(order.id) }),
        queryClient.invalidateQueries({ queryKey: ['bonuses'] }),
      ])
      notify('Bono quitado')
      setConfirmOpen(false)
    },
  })

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Bono de descuento
        </Typography>
        {order.bonus ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ flexGrow: 1 }}>
              Bono {order.bonus.brand} por {formatCLP(order.bonus.amount)}
            </Typography>
            {editable && (
              <Button
                color="error"
                onClick={() => {
                  removeMutation.reset()
                  setConfirmOpen(true)
                }}
              >
                Quitar bono
              </Button>
            )}
          </Box>
        ) : editable ? (
          <AssignBonusForm order={order} />
        ) : (
          <Alert severity="info">El ingreso no tiene bono asignado.</Alert>
        )}
      </CardContent>

      {confirmOpen && (
        <ConfirmDialog
          title="Quitar bono"
          message="El bono se quitará del ingreso y su cupo quedará disponible."
          confirmLabel="Quitar bono"
          isPending={removeMutation.isPending}
          error={removeMutation.error}
          onConfirm={() => removeMutation.mutate()}
          onClose={() => setConfirmOpen(false)}
        />
      )}
    </Card>
  )
}
