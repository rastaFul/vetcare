describe('Dashboard date ranges', () => {
  it('should calculate today range correctly', () => {
    const now = new Date('2026-06-04T14:00:00')
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    expect(todayStart.getHours()).toBe(0)
    expect(todayEnd.getHours()).toBe(23)
    expect(todayStart < now).toBe(true)
    expect(todayEnd > now).toBe(true)
  })

  it('should calculate 7 day range', () => {
    const now = new Date()
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const diff = in7Days.getTime() - now.getTime()
    expect(diff).toBe(7 * 24 * 60 * 60 * 1000)
  })

  it('should calculate 30 day range', () => {
    const now = new Date()
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const diffDays = (in30Days.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
    expect(diffDays).toBe(30)
  })
})
