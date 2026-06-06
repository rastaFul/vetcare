/**
 * VetCare — Visual Audit via Playwright
 * Captures screenshots of login page + simulates dashboard via direct navigation
 */
import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'

const BASE = 'http://localhost:3004'
const OUT  = '.specs/features/ui-audit/screenshots'

mkdirSync(OUT, { recursive: true })

const VIEWPORTS = [
  { name: 'mobile',  width: 375, height: 812 },
  { name: 'tablet',  width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]

async function capture(page, slug, label) {
  await page.waitForTimeout(800)
  const file = path.join(OUT, `${slug}.png`)
  await page.screenshot({ path: file, fullPage: true })
  console.log(`✓ ${label} → ${file}`)
}

;(async () => {
  const browser = await chromium.launch({ headless: true })

  for (const vp of VIEWPORTS) {
    const ctx  = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
    const page = await ctx.newPage()

    // --- Login page (public) ---
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
    // Wait for React hydration: button appears when JS loads
    await page.waitForSelector('button', { timeout: 5000 }).catch(() => {})
    await page.waitForTimeout(1200)
    await capture(page, `${vp.name}-login`, `${vp.name} login`)

    // --- Landing / redirect ---
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await capture(page, `${vp.name}-root`, `${vp.name} root`)

    await ctx.close()
  }

  await browser.close()
  console.log('\nDone. Screenshots saved to', OUT)
})()
