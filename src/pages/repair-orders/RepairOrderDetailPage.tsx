import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link as RouterLink, useParams } from 'react-router'
import {
  Box,
  Button,
  Card,
  CardContent,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BuildCircleIcon from '@mui/icons-material/BuildCircle'
import CarRepairIcon from '@mui/icons-material/CarRepair'
import {
  getRepairOrder,
  registerPickup,
  registerReady,
  repairOrderQueryKey,
} from '../../api/repairOrders'
import { vehicleRepairOrdersQueryKey } from '../../api/vehicles'
import { DateTimeDialog } from '../../components/DateTimeDialog'
import { ErrorAlert } from '../../components/ErrorAlert'
import { Loading } from '../../components/Loading'
import { RepairOrderStatusChip } from '../../components/RepairOrderStatusChip'
import { useNotify } from '../../components/notifications/useNotify'
import type { RepairOrderResponse } from '../../types/repairOrder'
import { formatCLP, formatDateTime, formatMileage } from '../../utils/format'
import { BonusCard } from './BonusCard'
import { CostCard } from './CostCard'

type StatusAction = 'ready' | 'pickup'

const ACTIONS: Record<
  StatusAction,
  {
    title: string
    label: string
    submitLabel: string
    success: string
    run: (id: number, dateTime: string) => Promise<RepairOrderResponse>
  }
> = {
  ready: {
    title: 'Registrar salida de la reparación',
    label: 'Fecha y hora de salida',
    submitLabel: 'Registrar salida',
    success: 'Salida registrada',
    run: (id, dateTime) => registerReady(id, { dateTime }),
  },
  pickup: {
    title: 'Registrar retiro del vehículo',
    label: 'Fecha y hora de retiro',
    submitLabel: 'Registrar retiro',
    success: 'Retiro registrado',
    run: (id, dateTime) => registerPickup(id, { dateTime }),
  },
}

function OrderSummary({ order }: { order: RepairOrderResponse }) {
  const plateLink = (
    <Link component={RouterLink} to={`/vehicles/${order.licensePlate}`}>
      {order.licensePlate}
    </Link>
  )
  const fields = [
    { label: 'Patente', value: plateLink },
    { label: 'Kilometraje', value: formatMileage(order.mileage) },
    { label: 'Ingreso', value: formatDateTime(order.entryDateTime) },
    { label: 'Salida', value: formatDateTime(order.readyDateTime) },
    { label: 'Retiro', value: formatDateTime(order.pickupDateTime) },
  ]
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr)' },
          gap: 2,
        }}
      >
        {fields.map((field) => (
          <Box key={field.label}>
            <Typography variant="caption" color="text.secondary">
              {field.label}
            </Typography>
            <Typography>{field.value}</Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  )
}

function OrderItems({ order }: { order: RepairOrderResponse }) {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Reparación</TableCell>
            <TableCell>Fecha y hora</TableCell>
            <TableCell align="right">Precio</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {order.items.map((item) => (
            <TableRow key={item.repairTypeId}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{formatDateTime(item.repairDateTime)}</TableCell>
              <TableCell align="right">{formatCLP(item.price)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export function RepairOrderDetailPage() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const notify = useNotify()
  const [action, setAction] = useState<StatusAction | null>(null)

  const { data: order, isPending, error } = useQuery({
    queryKey: repairOrderQueryKey(id),
    queryFn: () => getRepairOrder(id),
  })

  const mutation = useMutation({
    mutationFn: ({ kind, dateTime }: { kind: StatusAction; dateTime: string }) =>
      ACTIONS[kind].run(Number(id), dateTime),
    onSuccess: async (updated, { kind }) => {
      queryClient.setQueryData(repairOrderQueryKey(id), updated)
      await queryClient.invalidateQueries({
        queryKey: vehicleRepairOrdersQueryKey(updated.licensePlate),
      })
      notify(ACTIONS[kind].success)
      setAction(null)
    },
  })

  function openDialog(kind: StatusAction) {
    mutation.reset()
    setAction(kind)
  }

  return (
    <>
      {order && (
        <Button
          component={RouterLink}
          to={`/vehicles/${order.licensePlate}`}
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Volver al vehículo
        </Button>
      )}
      {isPending && <Loading />}
      {error && <ErrorAlert error={error} />}
      {order && (
        <>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 3 }}>
            <Typography variant="h5" component="h1">
              Ingreso N.º {order.id}
            </Typography>
            <RepairOrderStatusChip status={order.status} />
            <Box sx={{ flexGrow: 1 }} />
            {order.status === 'IN_REPAIR' && (
              <Button
                variant="contained"
                startIcon={<BuildCircleIcon />}
                onClick={() => openDialog('ready')}
              >
                Registrar salida
              </Button>
            )}
            {order.status === 'READY' && (
              <Button
                variant="contained"
                startIcon={<CarRepairIcon />}
                onClick={() => openDialog('pickup')}
              >
                Registrar retiro
              </Button>
            )}
          </Box>
          <OrderSummary order={order} />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '3fr 2fr' },
              gap: 3,
              alignItems: 'start',
            }}
          >
            <Box>
              <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                Reparaciones
              </Typography>
              <OrderItems order={order} />
            </Box>
            <Box>
              <BonusCard order={order} />
              {order.status === 'DELIVERED' && <CostCard order={order} />}
            </Box>
          </Box>
        </>
      )}

      {action && (
        <DateTimeDialog
          title={ACTIONS[action].title}
          label={ACTIONS[action].label}
          submitLabel={ACTIONS[action].submitLabel}
          isPending={mutation.isPending}
          error={mutation.error}
          onSubmit={(dateTime) => mutation.mutate({ kind: action, dateTime })}
          onClose={() => setAction(null)}
        />
      )}
    </>
  )
}
