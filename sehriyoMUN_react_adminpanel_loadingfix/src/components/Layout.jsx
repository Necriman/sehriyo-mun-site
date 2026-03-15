import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function Layout({ theme, onToggleTheme }) {
  return (
    <div className="min-h-screen">
      <Navbar theme={theme} onToggleTheme={onToggleTheme} />
      <main><Outlet /></main>
      <Footer />
    </div>
  )
}
