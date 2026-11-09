import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { bonusesQueryKey, getBonuses } from '../../api/bonuses'
import { ErrorAlert } from '../../components/ErrorAlert'
import { Loading } from '../../components/Loading'
import { PageHeader } from '../../components/PageHeader'
import { MONTH_OPTIONS } from '../../utils/dateTime'
import { formatCLP } from '../../utils/format'
import { BonusFormDialog } from './BonusFormDialog'

const MIN_YEAR = 2000
const MAX_YEAR = 2100

export function BonusesPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [yearInput, setYearInput] = useState(String(today.getFullYear()))
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data, isPending, error } = useQuery({
    queryKey: bonusesQueryKey(year, month),
    queryFn: () => getBonuses(year, month),
  })

  function handleYearChange(value: string) {
    setYearInput(value)
    const parsed = Number(value)
    // Solo se consulta con un año completo; mientras se escribe se mantiene el anterior.
    if (Number.isInteger(parsed) && parsed >= MIN_YEAR && parsed <= MAX_YEAR) {
      setYear(parsed)
    }
  }

  const monthLabel = MONTH_OPTIONS[month - 1].label

  return (
    <>
      <PageHeader title="Bonos de descuento" />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <TextField
          size="small"
          label="Año"
          type="number"
          value={yearInput}
          onChange={(event) => handleYearChange(event.target.value)}
          sx={{ width: 120 }}
          slotProps={{ htmlInput: { min: MIN_YEAR, max: MAX_YEAR } }}
        />
        <TextField
          size="small"
          label="Mes"
          select
          value={month}
          onChange={(event) => setMonth(Number(event.target.value))}
          sx={{ width: 160 }}
        >
          {MONTH_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Registrar cupo
        </Button>
      </Box>

      {isPending && <Loading />}
      {error && <ErrorAlert error={error} />}
      {data && data.length === 0 && (
        <Alert severity="info">
          No hay bonos registrados para {monthLabel.toLowerCase()} de {year}.
        </Alert>
      )}
      {data && data.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Marca</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell align="right">Monto por bono</TableCell>
                <TableCell align="right">Usados</TableCell>
                <TableCell align="right">Disponibles</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((bonus) => (
                <TableRow key={bonus.id}>
                  <TableCell>{bonus.brand}</TableCell>
                  <TableCell align="right">{bonus.quantity}</TableCell>
                  <TableCell align="right">{formatCLP(bonus.amount)}</TableCell>
                  <TableCell align="right">{bonus.used}</TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      component="span"
                      color={bonus.available === 0 ? 'error' : undefined}
                      sx={{ fontWeight: 500 }}
                    >
                      {bonus.available}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {dialogOpen && (
        <BonusFormDialog
          initialYear={year}
          initialMonth={month}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </>
  )
}
