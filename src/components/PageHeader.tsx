import { Typography } from '@mui/material'

export function PageHeader({ title }: { title: string }) {
  return (
    <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
      {title}
    </Typography>
  )
}
