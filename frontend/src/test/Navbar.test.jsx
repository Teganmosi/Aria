import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Navbar from '../components/Navbar'

// Mock useAuth hook
vi.mock('../hooks/useAuth', () => ({
  default: () => ({
    logout: vi.fn(),
  }),
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Navbar Component', () => {
  it('renders brand name', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )
    expect(screen.getByText('Aria')).toBeDefined()
  })

  it('renders navigation links', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )
    expect(screen.getByText('Bible Study')).toBeDefined()
    expect(screen.getByText('Emotional Support')).toBeDefined()
    expect(screen.getByText('Devotion')).toBeDefined()
  })

  it('toggles mobile menu on button click', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )
    const toggleBtn = screen.getByLabelText('Toggle menu')
    fireEvent.click(toggleBtn)
    // Check if the nav-links div has the 'open' class
    const navLinks = document.querySelector('.nav-links')
    expect(navLinks.classList.contains('open')).toBe(true)
  })
})
