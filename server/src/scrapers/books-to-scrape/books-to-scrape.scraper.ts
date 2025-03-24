import { Page } from "playwright"
import { BookToScrapeData } from "../../types/books.types"
import { ScraperOptions, ScraperResult } from "../../types/scrapers.types"
import { BaseScraper } from "../common/base.scraper"
import { BooksToScrapePage } from "./pages/books-to-scrape.page"

export class BooksToScrapeScraper extends BaseScraper<BookToScrapeData[]> {
  id = "bookstoscrape"
  source = "https://books.toscrape.com/"
  name = "Books to Scrape"
  description =
    "Scrapes all books from https://books.toscrape.com/ across all pagination pages"

  protected createPage(page: Page): BooksToScrapePage {
    return new BooksToScrapePage(page)
  }

  protected async extractData(pageObject: BooksToScrapePage) {
    // Navigate to the books page
    await pageObject.goto()

    // Get all books from all pages
    const books = await pageObject.getData()

    console.log(`Found ${books.length} books`)
    return books
  }

  override async scrape(
    options: ScraperOptions
  ): Promise<ScraperResult<BookToScrapeData[]>> {
    return await super.scrape(options)
  }
}
