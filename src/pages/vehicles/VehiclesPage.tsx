import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link as RouterLink, useNavigate } from 'react-router'
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import { getVehicles } from '../../api/vehicles'
import { ErrorAlert } from '../../components/ErrorAlert'
import { Loading } from '../../components/Loading'
import { PageHeader } from '../../components/PageHeader'
import { ENGINE_TYPE_LABELS, VEHICLE_TYPE_LABELS } from '../../utils/labels'
import { VehicleFormDialog } from './VehicleFormDialog'

export function VehiclesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const { data, isPending, error } = useQuery({ queryKey: ['vehicles'], queryFn: getVehicles })

  // Filtro solo de visualización sobre el listado que entrega la API.
  const query = search.trim().toUpperCase()
  const vehicles = data?.filter((vehicle) => vehicle.licensePlate.includes(query)) ?? []

  return (
    <>
      <PageHeader title="Vehículos" />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <TextField
          size="small"
          label="Buscar por patente"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Registrar vehículo
        </Button>
      </Box>

      {isPending && <Loading />}
      {error && <ErrorAlert error={error} />}
      {data && vehicles.length === 0 && (
        <Alert severity="info">
          {data.length === 0
            ? 'No hay vehículos registrados.'
            : 'No se encontraron vehículos con esa patente.'}
        </Alert>
      )}
      {vehicles.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Patente</TableCell>
                <TableCell>Marca</TableCell>
                <TableCell>Modelo</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell align="right">Año</TableCell>
                <TableCell>Motor</TableCell>
                <TableCell align="right">Asientos</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow
                  key={vehicle.id}
                  hover
                  onClick={() => void navigate(`/vehicles/${vehicle.licensePlate}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Link component={RouterLink} to={`/vehicles/${vehicle.licensePlate}`}>
                      {vehicle.licensePlate}
                    </Link>
                  </TableCell>
                  <TableCell>{vehicle.brand}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{VEHICLE_TYPE_LABELS[vehicle.vehicleType]}</TableCell>
                  <TableCell align="right">{vehicle.manufactureYear}</TableCell>
                  <TableCell>{ENGINE_TYPE_LABELS[vehicle.engineType]}</TableCell>
                  <TableCell align="right">{vehicle.seats}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {dialogOpen && <VehicleFormDialog onClose={() => setDialogOpen(false)} />}
    </>
  )
}
