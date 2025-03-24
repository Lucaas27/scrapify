import { Page } from "playwright"
import { BaseScraper } from "../common/base.scraper"
import { BooksPage } from "./pages/books.page"
import { BookData } from "../../types/books.types"
import { ScraperOptions, ScraperResult } from "../../types/scrapers.types"

export class DemoQABooksScraper extends BaseScraper<BookData[]> {
  id = "demoqa"
  source = "https://demoqa.com/books"
  name = "DemoQA Books"
  description =
    "Scrapes all books from demoqa.com/books across all pagination pages"

  protected createPage(page: Page): BooksPage {
    return new BooksPage(page)
  }

  protected async extractData(pageObject: BooksPage) {
    // Navigate to the books page
    await pageObject.goto()

    // Get all books from all pages
    const books = await pageObject.getData()

    console.log(`Found ${books.length} books`)
    return books
  }

  override async scrape(
    options: ScraperOptions
  ): Promise<ScraperResult<BookData[]>> {
    return await super.scrape(options)
  }
}
