import { useSearchParams } from 'react-router'

export interface YearMonth {
  year: number
  month: number
}

function currentYearMonth(): YearMonth {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

function parse(value: string | null, min: number, max: number): number | undefined {
  const number = Number(value)
  return value !== null && Number.isInteger(number) && number >= min && number <= max ? number : undefined
}

/**
 * Mes y año elegidos para un reporte, guardados en la URL (?year=…&month=…) para poder
 * compartir el enlace y conservarlos al pasar de un reporte a otro. Por defecto, el mes actual.
 */
export function useYearMonth(): [YearMonth, (value: YearMonth) => void] {
  const [searchParams, setSearchParams] = useSearchParams()
  const fallback = currentYearMonth()
  const value: YearMonth = {
    year: parse(searchParams.get('year'), 2000, 2100) ?? fallback.year,
    month: parse(searchParams.get('month'), 1, 12) ?? fallback.month,
  }
  const setValue = (next: YearMonth) =>
    setSearchParams({ year: String(next.year), month: String(next.month) })
  return [value, setValue]
}
