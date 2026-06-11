import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    if (savedTheme === 'dark') {
      setIsDark(true)
      document.documentElement.dataset.theme = 'dark'
    } else {
      setIsDark(false)
      delete document.documentElement.dataset.theme
    }
  }, [])

  const toggleTheme = () => {
    if (isDark) {
      delete document.documentElement.dataset.theme
      localStorage.setItem('theme', 'light')
      setIsDark(false)
    } else {
      document.documentElement.dataset.theme = 'dark'
      localStorage.setItem('theme', 'dark')
      setIsDark(true)
    }
  }

  return (
    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}

export const AnimatedBackground = () => (
  <div className="animated-bg">
    <div className="bg-orb orb-1"></div>
    <div className="bg-orb orb-2"></div>
  </div>
)
