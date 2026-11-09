import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Toolbar,
  Typography,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { NAV_SECTIONS } from './navigation'

const DRAWER_WIDTH = 260

/** Barra superior y menú lateral. */
export function AppLayout() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Al pasar de un reporte a otro se conserva el mes elegido (?year=…&month=…).
  const onReport = location.pathname.startsWith('/reports/')
  const linkTo = (path: string) =>
    onReport && path.startsWith('/reports/') ? `${path}${location.search}` : path

  const menu = (
    <>
      <Toolbar />
      {NAV_SECTIONS.map((section, index) => (
        <List
          key={section.title ?? index}
          subheader={section.title ? <ListSubheader>{section.title}</ListSubheader> : undefined}
        >
          {index > 0 && <Divider sx={{ mb: 1 }} />}
          {section.items
            .map((item) => (
              <ListItemButton
                key={item.path}
                component={NavLink}
                to={linkTo(item.path)}
                onClick={() => setMobileOpen(false)}
                sx={{ '&.active': { bgcolor: 'action.selected' } }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
        </List>
      ))}
    </>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            aria-label="Abrir menú"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AutoFix
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {menu}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {menu}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}
