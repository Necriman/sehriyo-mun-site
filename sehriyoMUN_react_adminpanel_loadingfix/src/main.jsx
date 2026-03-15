import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'
import './i18n'
import { App } from './App'
import { useTheme } from './hooks/useTheme'

function Root() {
  const { theme, toggle } = useTheme()
  return <App theme={theme} onToggleTheme={toggle} />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
