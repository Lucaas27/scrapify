import { Scraper, ScraperOptions, ScraperResult } from "../types/scrapers.types"
import { BooksToScrapeScraper } from "./books-to-scrape/books-to-scrape.scraper"
import { DemoQABooksScraper } from "./example/books.scraper"

// Register all scrapers here
const scraperClasses = [DemoQABooksScraper, BooksToScrapeScraper]

export class ScraperManager {
  private scrapers: Map<string, Scraper> = new Map()

  constructor() {
    // Initialize all scrapers
    scraperClasses.forEach(ScraperClass => {
      const scraper = new ScraperClass()
      this.scrapers.set(scraper.id, scraper)
    })
  }

  getScrapers(): Scraper[] {
    return Array.from(this.scrapers.values())
  }

  getScrapersInfo(): { id: string; name: string; description: string }[] {
    return this.getScrapers().map(scraper => ({
      id: scraper.id,
      name: scraper.name,
      description: scraper.description,
    }))
  }

  getScraper(id: string): Scraper | undefined {
    return this.scrapers.get(id)
  }

  async runScraper<T>(
    id: string,
    options: ScraperOptions
  ): Promise<ScraperResult<T> | null> {
    const scraper = this.getScraper(id) as Scraper<T> | undefined

    if (!scraper) {
      return null
    }

    return await scraper.scrape(options)
  }

  async scrapeAll(
    options: ScraperOptions
  ): Promise<Record<string, ScraperResult<unknown>>> {
    const results: Record<string, ScraperResult<unknown>> = {}

    for (const scraper of this.getScrapers()) {
      const result = await scraper.scrape(options)
      results[scraper.id] = result
    }

    return results
  }
}
