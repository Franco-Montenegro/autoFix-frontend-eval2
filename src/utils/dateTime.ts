function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** Fecha y hora local actual en el formato de un input `datetime-local` (`YYYY-MM-DDTHH:mm`). */
export function nowForInput(): string {
  const now = new Date()
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `T${pad(now.getHours())}:${pad(now.getMinutes())}`
  )
}

/** Año y mes (1–12) de una fecha ISO-8601 sin zona horaria, ej. "2026-09-28T10:00:00". */
export function yearMonthOf(isoDateTime: string): { year: number; month: number } {
  return { year: Number(isoDateTime.slice(0, 4)), month: Number(isoDateTime.slice(5, 7)) }
}

const monthFormatter = new Intl.DateTimeFormat('es-CL', { month: 'long' })

/** Meses del año para un select: 1 → "Enero", …, 12 → "Diciembre". */
export const MONTH_OPTIONS: { value: number; label: string }[] = Array.from(
  { length: 12 },
  (_, index) => {
    const name = monthFormatter.format(new Date(2000, index, 1))
    return { value: index + 1, label: name.charAt(0).toUpperCase() + name.slice(1) }
  },
)

/** Convierte el valor de un input `datetime-local` al formato de la API (ISO sin zona, con segundos). */
export function inputToApiDateTime(value: string): string {
  return value.length === 16 ? `${value}:00` : value
}
