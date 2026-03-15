import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/Layout'
import Home from './pages/Home'
import Committees from './pages/Committees'
import CommitteeDetail from './pages/CommitteeDetail'
import Team from './pages/Team'
import Apply from './pages/Apply'
import Schedule from './pages/Schedule'
import NotFound from './pages/NotFound'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import { AdminGate } from './components/AdminGate'

export function App({ theme, onToggleTheme }) {
  const router = createBrowserRouter([
    {
      element: <Layout theme={theme} onToggleTheme={onToggleTheme} />,
      children: [
        { path: '/', element: <Home /> },
        { path: '/committees', element: <Committees /> },
        { path: '/committees/:slug', element: <CommitteeDetail /> },
        { path: '/schedule', element: <Schedule /> },
        { path: '/team', element: <Team /> },
        { path: '/apply', element: <Apply /> },
        { path: '/admin/login', element: <AdminLogin /> },
        { path: '/admin', element: (<AdminGate><AdminDashboard /></AdminGate>) },
        { path: '*', element: <NotFound /> },
      ],
    },
  ])
  return <RouterProvider router={router} />
}
