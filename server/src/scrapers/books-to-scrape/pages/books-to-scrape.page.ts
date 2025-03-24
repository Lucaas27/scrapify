import { Page } from "playwright"
import { BasePage } from "../../common/base.page"
import { ListItem } from "../../common/elements/listItem.element"
import { BookToScrapeData } from "../../../types/books.types"

export class BooksToScrapePage extends BasePage {
  private readonly baseUrl = "http://books.toscrape.com/"

  private readonly bookItems: ListItem = new ListItem(
    this.page,
    "article.product_pod",
    "Book Items",
    false,
    false
  )

  constructor(page: Page) {
    super(page)
  }

  override async goto(): Promise<void> {
    await super.goto(this.baseUrl)
  }

  async getData(): Promise<BookToScrapeData[]> {
    const books: BookToScrapeData[] = []
    let currentPage = 1

    while (true) {
      console.log(`Processing page ${currentPage}`)

      const pageBooks = await this.getBooksFromCurrentPage()
      books.push(...pageBooks)

      // Check for next page
      const hasNextPage = (await this.page.locator(".next").count()) > 0
      if (!hasNextPage) break

      // Go to next page
      currentPage++
      await this.page.click(".next a")
      await this.page.waitForLoadState("domcontentloaded")
    }

    return books
  }

  private async getBooksFromCurrentPage(): Promise<BookToScrapeData[]> {
    const bookLocators = await this.bookItems.getLocator().all()
    const books: BookToScrapeData[] = []

    for (const bookLocator of bookLocators) {
      try {
        const title = await bookLocator.locator("h3 a").getAttribute("title")
        const price = await bookLocator.locator(".price_color").textContent()
        const imageUrl = await bookLocator
          .locator(".image_container img")
          .getAttribute("src")
        const availability = await bookLocator
          .locator(".availability")
          .textContent()

        if (title) {
          books.push({
            title: title.trim(),
            price: price?.trim() || "N/A",
            imageUrl: imageUrl ? `${this.baseUrl}${imageUrl}` : undefined,
            availability: availability?.trim(),
          })
        }
      } catch (error) {
        console.error("Failed to extract book:", error)
      }
    }

    return books
  }
}
