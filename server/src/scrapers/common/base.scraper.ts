import { Page } from "playwright"
import {
  Scraper,
  ScraperOptions,
  ScraperResult,
} from "../../types/scrapers.types"

export abstract class BaseScraper<T = unknown> implements Scraper<T> {
  abstract id: string
  abstract source: string
  abstract name: string
  abstract description: string

  protected async withRetry<R>(fn: () => Promise<R>, retries = 3): Promise<R> {
    try {
      return await fn()
    } catch (error) {
      if (retries <= 0) throw error
      console.error(`Error occurred during scraping:`)
      console.error(
        `- Message: ${error instanceof Error ? error.message : "Unknown error"}`
      )
      console.error(
        `- Stack: ${error instanceof Error ? error.stack : "No stack trace"}`
      )
      console.error(`- Retries remaining: ${retries}`)

      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log(`Retrying... (${retries} attempts left)`)
      return this.withRetry(fn, retries - 1)
    }
  }

  protected startTimer(): () => number {
    const start = performance.now()
    return () => Math.round(performance.now() - start)
  }

  // This should be implemented by concrete scrapers
  protected abstract createPage(page: Page): unknown
  protected abstract extractData(page: unknown): Promise<unknown>

  async scrape({
    browser,
    context,
    retryCount = 3,
  }: ScraperOptions): Promise<ScraperResult<T>> {
    const getElapsedTime = this.startTimer()

    // Create context if not provided
    let ownContext = false
    if (!context) {
      context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
        acceptDownloads: true,
      })
      ownContext = true
    }

    try {
      const page = await context.newPage()
      const pageObject = this.createPage(page)

      // Perform the actual scraping with retry capability
      const items = await this.withRetry(
        async () => this.extractData(pageObject),
        retryCount
      )

      return {
        id: this.id,
        source: this.source,
        items: items as T[],
        timestamp: new Date(Date.now()),
        metadata: {
          totalItems: (items as T[]).length,
          executionTimeMs: getElapsedTime(),
        },
      }
    } finally {
      // Only close the context if we created it
      if (ownContext) {
        await context.close()
      }
    }
  }
}
