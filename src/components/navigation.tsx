import type { ReactNode } from 'react'
import AssessmentIcon from '@mui/icons-material/Assessment'
import BuildIcon from '@mui/icons-material/Build'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import HistoryIcon from '@mui/icons-material/History'
import ListAltIcon from '@mui/icons-material/ListAlt'

export interface NavItem {
  label: string
  path: string
  icon: ReactNode
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: 'Vehículos', path: '/vehicles', icon: <DirectionsCarIcon /> },
      { label: 'Nuevo ingreso', path: '/repair-orders/new', icon: <BuildIcon /> },
      { label: 'Bonos', path: '/bonuses', icon: <CardGiftcardIcon /> },
      { label: 'Catálogo de reparaciones', path: '/repair-types', icon: <ListAltIcon /> },
    ],
  },
  {
    title: 'Reportes',
    items: [
      { label: 'Historial de reparaciones', path: '/reports/history', icon: <HistoryIcon /> },
      { label: 'Reporte 1: Por tipo de vehículo', path: '/reports/r1', icon: <AssessmentIcon /> },
      { label: 'Reporte 2: Comparativo mensual', path: '/reports/r2', icon: <CompareArrowsIcon /> },
    ],
  },
]
