export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { runNotificationCron } = await import('./lib/notification-cron')

    const HOUR_MS = 60 * 60 * 1000

    // First run: 5 minutes after start (let the DB initialize)
    setTimeout(() => {
      runNotificationCron().catch((e) => console.error('[Cron] Error:', e))
    }, 5 * 60 * 1000)

    // Subsequent runs: every hour
    setInterval(() => {
      runNotificationCron().catch((e) => console.error('[Cron] Error:', e))
    }, HOUR_MS)
  }
}
