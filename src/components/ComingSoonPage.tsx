import { Alert } from '@mui/material'
import { PageHeader } from './PageHeader'

/** Página provisoria para los módulos de las próximas subfases. */
export function ComingSoonPage({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} />
      <Alert severity="info">Próximamente.</Alert>
    </>
  )
}
