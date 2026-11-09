import { useQuery } from '@tanstack/react-query'
import { Link as RouterLink, useNavigate, useParams } from 'react-router'
import {
  Alert,
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
import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {
  getVehicle,
  getVehicleRepairOrders,
  vehicleQueryKey,
  vehicleRepairOrdersQueryKey,
} from '../../api/vehicles'
import { ErrorAlert } from '../../components/ErrorAlert'
import { Loading } from '../../components/Loading'
import { PageHeader } from '../../components/PageHeader'
import { RepairOrderStatusChip } from '../../components/RepairOrderStatusChip'
import type { VehicleResponse } from '../../types/vehicle'
import { formatCLP, formatDateTime, formatMileage } from '../../utils/format'
import { ENGINE_TYPE_LABELS, VEHICLE_TYPE_LABELS } from '../../utils/labels'

function VehicleCard({ vehicle }: { vehicle: VehicleResponse }) {
  const fields: { label: string; value: string | number }[] = [
    { label: 'Marca', value: vehicle.brand },
    { label: 'Modelo', value: vehicle.model },
    { label: 'Tipo', value: VEHICLE_TYPE_LABELS[vehicle.vehicleType] },
    { label: 'Año de fabricación', value: vehicle.manufactureYear },
    { label: 'Motor', value: ENGINE_TYPE_LABELS[vehicle.engineType] },
    { label: 'Asientos', value: vehicle.seats },
  ]
  return (
    <Card sx={{ mb: 4 }}>
      <CardContent
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(6, 1fr)' },
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

function RepairOrderHistory({ licensePlate }: { licensePlate: string }) {
  const navigate = useNavigate()
  const { data, isPending, error } = useQuery({
    queryKey: vehicleRepairOrdersQueryKey(licensePlate),
    queryFn: () => getVehicleRepairOrders(licensePlate),
  })

  if (isPending) return <Loading />
  if (error) return <ErrorAlert error={error} />
  if (data.length === 0) {
    return <Alert severity="info">El vehículo no tiene ingresos registrados.</Alert>
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>N.º</TableCell>
            <TableCell>Ingreso</TableCell>
            <TableCell align="right">Kilometraje</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Reparaciones</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((order) => (
            <TableRow
              key={order.id}
              hover
              onClick={() => void navigate(`/repair-orders/${order.id}`)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>
                <Link component={RouterLink} to={`/repair-orders/${order.id}`}>
                  {order.id}
                </Link>
              </TableCell>
              <TableCell>{formatDateTime(order.entryDateTime)}</TableCell>
              <TableCell align="right">{formatMileage(order.mileage)}</TableCell>
              <TableCell>
                <RepairOrderStatusChip status={order.status} />
              </TableCell>
              <TableCell>{order.items.map((item) => item.name).join(', ')}</TableCell>
              <TableCell align="right">{formatCLP(order.cost?.totalAmount ?? null)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export function VehicleDetailPage() {
  const { plate = '' } = useParams()
  const { data: vehicle, isPending, error } = useQuery({
    queryKey: vehicleQueryKey(plate),
    queryFn: () => getVehicle(plate),
  })

  return (
    <>
      <Button component={RouterLink} to="/vehicles" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        Volver a vehículos
      </Button>
      {isPending && <Loading />}
      {error && <ErrorAlert error={error} />}
      {vehicle && (
        <>
          <PageHeader title={`Vehículo ${vehicle.licensePlate}`} />
          <VehicleCard vehicle={vehicle} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
              Historial de ingresos
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              component={RouterLink}
              to={`/repair-orders/new?plate=${encodeURIComponent(vehicle.licensePlate)}`}
            >
              Nuevo ingreso
            </Button>
          </Box>
          <RepairOrderHistory licensePlate={vehicle.licensePlate} />
        </>
      )}
    </>
  )
}
