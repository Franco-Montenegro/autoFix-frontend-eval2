import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import { getRepairTypes } from '../../api/repairTypes'
import { ErrorAlert } from '../../components/ErrorAlert'
import { Loading } from '../../components/Loading'
import { PageHeader } from '../../components/PageHeader'
import { RepairPrice } from '../../components/RepairPrice'
import type { EngineType } from '../../types/enums'
import type { RepairType } from '../../types/repairType'
import { ENGINE_TYPE_LABELS } from '../../utils/labels'
import { priceForEngine } from '../../utils/repairTypes'
import { RepairTypeFormDialog } from './RepairTypeFormDialog'

const ENGINES = Object.keys(ENGINE_TYPE_LABELS) as EngineType[]

/** Estado del diálogo: cerrado, creando una reparación o modificando una existente. */
type DialogState = { open: false } | { open: true; repairType?: RepairType }

/** HU2: catálogo de reparaciones con sus precios por motor; permite agregar y modificar. */
export function RepairTypesPage() {
  const [dialog, setDialog] = useState<DialogState>({ open: false })
  const { data, isPending, error } = useQuery({
    queryKey: ['repair-types'],
    queryFn: getRepairTypes,
  })

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <PageHeader title="Catálogo de reparaciones" />
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ open: true })}>
          Agregar reparación
        </Button>
      </Box>
      {isPending && <Loading />}
      {error && <ErrorAlert error={error} />}
      {data && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Reparación</TableCell>
                {ENGINES.map((engine) => (
                  <TableCell key={engine} align="right">
                    {ENGINE_TYPE_LABELS[engine]}
                  </TableCell>
                ))}
                <TableCell padding="checkbox" />
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((repair) => (
                <TableRow key={repair.id} hover>
                  <TableCell>{repair.name}</TableCell>
                  {ENGINES.map((engine) => (
                    <TableCell key={engine} align="right">
                      <RepairPrice price={priceForEngine(repair, engine)} />
                    </TableCell>
                  ))}
                  <TableCell padding="checkbox">
                    <Tooltip title="Modificar">
                      <IconButton
                        size="small"
                        aria-label={`Modificar ${repair.name}`}
                        onClick={() => setDialog({ open: true, repairType: repair })}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {dialog.open && (
        <RepairTypeFormDialog repairType={dialog.repairType} onClose={() => setDialog({ open: false })} />
      )}
    </>
  )
}
