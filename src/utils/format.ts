const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('es-CL')

const dateTimeFormatter = new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'short',
  timeStyle: 'short',
})

/** Formatea un monto en pesos chilenos; `null` se muestra como "—". */
export function formatCLP(amount: number | null): string {
  return amount === null ? '—' : clpFormatter.format(amount)
}

/** Formatea un kilometraje, ej. "45.000 km". */
export function formatMileage(mileage: number): string {
  return `${numberFormatter.format(mileage)} km`
}

/**
 * Formatea una fecha y hora ISO-8601 sin zona horaria (como las envía la API);
 * `null` se muestra como "—".
 */
export function formatDateTime(isoDateTime: string | null): string {
  return isoDateTime === null ? '—' : dateTimeFormatter.format(new Date(isoDateTime))
}

/** Solo la fecha de un ISO-8601 sin zona, ej. "2026-08-03" (columnas "Fecha" del historial). */
export function formatDate(isoDateTime: string | null): string {
  return isoDateTime === null ? '—' : isoDateTime.slice(0, 10)
}

/** Solo la hora de un ISO-8601 sin zona, ej. "10:00" (columnas "Hora" del historial). */
export function formatTime(isoDateTime: string | null): string {
  return isoDateTime === null ? '—' : isoDateTime.slice(11, 16)
}

/** Porcentaje entero con signo, ej. "+86 %" o "−93 %"; `null` (mes anterior en 0) se muestra como "—". */
export function formatVariation(value: number | null): string {
  if (value === null) return '—'
  return `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value)} %`
}

/** "2026-10" → "Octubre 2026". */
export function formatYearMonth(yearMonth: string): string {
  const name = new Intl.DateTimeFormat('es-CL', { month: 'long' }).format(
    new Date(Number(yearMonth.slice(0, 4)), Number(yearMonth.slice(5, 7)) - 1, 1),
  )
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${yearMonth.slice(0, 4)}`
}
