import { createBrowserRouter, Navigate } from 'react-router'
import { AppLayout } from './components/AppLayout'
import { ComingSoonPage } from './components/ComingSoonPage'
import { BonusesPage } from './pages/bonuses/BonusesPage'
import { NewRepairOrderPage } from './pages/repair-orders/NewRepairOrderPage'
import { RepairOrderDetailPage } from './pages/repair-orders/RepairOrderDetailPage'
import { HistoryPage } from './pages/reports/HistoryPage'
import { Report1Page } from './pages/reports/Report1Page'
import { Report2Page } from './pages/reports/Report2Page'
import { RepairTypesPage } from './pages/repair-types/RepairTypesPage'
import { VehicleDetailPage } from './pages/vehicles/VehicleDetailPage'
import { VehiclesPage } from './pages/vehicles/VehiclesPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/vehicles" replace /> },
      { path: 'repair-types', element: <RepairTypesPage /> },
      { path: 'vehicles', element: <VehiclesPage /> },
      { path: 'vehicles/:plate', element: <VehicleDetailPage /> },
      { path: 'repair-orders/new', element: <NewRepairOrderPage /> },
      { path: 'repair-orders/:id', element: <RepairOrderDetailPage /> },
      { path: 'bonuses', element: <BonusesPage /> },
      { path: 'reports/history', element: <HistoryPage /> },
      { path: 'reports/r1', element: <Report1Page /> },
      { path: 'reports/r2', element: <Report2Page /> },
      { path: '*', element: <ComingSoonPage title="Página no encontrada" /> },
    ],
  },
])
