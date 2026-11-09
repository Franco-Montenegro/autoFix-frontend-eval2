import { useState } from 'react'
import { Box, Button, MenuItem, TextField } from '@mui/material'
import { MONTH_OPTIONS } from '../../utils/dateTime'
import type { YearMonth } from './useYearMonth'

interface MonthYearPickerProps {
  value: YearMonth
  onChange: (value: YearMonth) => void
}

/** Selector de mes y año de los reportes; el reporte se consulta al presionar "Ver reporte". */
export function MonthYearPicker({ value, onChange }: MonthYearPickerProps) {
  const [month, setMonth] = useState(value.month)
  const [year, setYear] = useState(String(value.year))
  const yearNumber = Number(year)
  const validYear = Number.isInteger(yearNumber) && yearNumber >= 2000 && yearNumber <= 2100

  return (
    <Box
      component="form"
      onSubmit={(event) => {
        event.preventDefault()
        if (validYear) onChange({ year: yearNumber, month })
      }}
      sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start', mb: 3 }}
    >
      <TextField
        select
        label="Mes"
        size="small"
        value={month}
        onChange={(event) => setMonth(Number(event.target.value))}
        sx={{ minWidth: 160 }}
      >
        {MONTH_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Año"
        type="number"
        size="small"
        value={year}
        onChange={(event) => setYear(event.target.value)}
        error={!validYear}
        helperText={validYear ? undefined : 'Entre 2000 y 2100'}
        sx={{ width: 120 }}
      />
      <Button type="submit" variant="contained" disabled={!validYear}>
        Ver reporte
      </Button>
    </Box>
  )
}
