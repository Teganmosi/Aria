// Unit tests for Aria - Your Spiritual Companion

describe('API Service Exports', () => {
  it('should export API_BASE_URL', async () => {
    const { API_BASE_URL } = await import('../services/api')
    expect(API_BASE_URL).toBeDefined()
    expect(typeof API_BASE_URL).toBe('string')
    expect(API_BASE_URL).toContain('http')
  })

  it('should export authService', async () => {
    const { authService } = await import('../services/api')
    expect(authService).toBeDefined()
    expect(typeof authService.login).toBe('function')
    expect(typeof authService.register).toBe('function')
    expect(typeof authService.logout).toBe('function')
    expect(typeof authService.getMe).toBe('function')
  })

  it('should export aiService', async () => {
    const { aiService } = await import('../services/api')
    expect(aiService).toBeDefined()
    expect(typeof aiService.generate).toBe('function')
    expect(typeof aiService.chat).toBe('function')
  })

  it('should export homeService', async () => {
    const { homeService } = await import('../services/api')
    expect(homeService).toBeDefined()
    expect(typeof homeService.getHomeData).toBe('function')
    expect(typeof homeService.getVerse).toBe('function')
    expect(typeof homeService.getActivity).toBe('function')
    expect(typeof homeService.getStats).toBe('function')
  })

  it('should export prayerService', async () => {
    const { prayerService } = await import('../services/api')
    expect(prayerService).toBeDefined()
    expect(typeof prayerService.createPrayer).toBe('function')
    expect(typeof prayerService.getPrayers).toBe('function')
    expect(typeof prayerService.deletePrayer).toBe('function')
  })

  it('should export bibleService', async () => {
    const { bibleService } = await import('../services/api')
    expect(bibleService).toBeDefined()
    expect(typeof bibleService.getChapter).toBe('function')
    expect(typeof bibleService.getVerse).toBe('function')
    expect(typeof bibleService.searchVerses).toBe('function')
  })

  it('should export emotionalSupportService', async () => {
    const { emotionalSupportService } = await import('../services/api')
    expect(emotionalSupportService).toBeDefined()
    expect(typeof emotionalSupportService.createSession).toBe('function')
    expect(typeof emotionalSupportService.getSessions).toBe('function')
  })

  it('should export devotionService', async () => {
    const { devotionService } = await import('../services/api')
    expect(devotionService).toBeDefined()
    expect(typeof devotionService.getSettings).toBe('function')
    expect(typeof devotionService.saveSettings).toBe('function')
    expect(typeof devotionService.getDevotions).toBe('function')
  })
})

describe('ErrorBoundary Component', () => {
  it('should be importable', async () => {
    const { default: ErrorBoundary } = await import('../components/ErrorBoundary')
    expect(ErrorBoundary).toBeDefined()
  })
})

describe('useAuth Hook', () => {
  it('should be importable', async () => {
    const { default: useAuth } = await import('../hooks/useAuth')
    expect(useAuth).toBeDefined()
  })
})
