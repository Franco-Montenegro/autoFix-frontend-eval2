import { createTheme } from '@mui/material/styles'
import { esES } from '@mui/material/locale'

export const theme = createTheme(
  {
    palette: {
      primary: { main: '#1565c0' },
      secondary: { main: '#ef6c00' },
      background: { default: '#f5f7fa' },
    },
  },
  esES,
)
