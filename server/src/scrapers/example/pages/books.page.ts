import { Locator, Page } from "playwright"
import { BasePage } from "../../common/base.page"
import { ListItem } from "../../common/elements/listItem.element"
import { BookData } from "../../../types/books.types"

export class BooksPage extends BasePage {
  private readonly baseUrl = "https://demoqa.com/books"
  private readonly ELEMENT_TIMEOUT = 5000 // 5 second timeout for element operations

  private readonly bookItems: ListItem = new ListItem(
    this.page,
    ".rt-tr-group",
    "Books",
    false,
    false
  )

  constructor(page: Page) {
    super(page)
  }

  override async goto(): Promise<void> {
    await super.goto(this.baseUrl)
    // Wait for books to be loaded
    await this.elementsShouldBeVisible()
  }

  async getBooks(): Promise<BookData[]> {
    await this.elementsShouldBeVisible()

    const bookLocators = await this.bookItems.getLocator().all()
    console.log(`Found ${bookLocators.length} book locators`)

    const books: BookData[] = []
    let processedCount = 0
    let skippedCount = 0

    for (const [index, bookLocator] of bookLocators.entries()) {
      console.log(`Processing book ${index + 1}/${bookLocators.length}`)

      try {
        // Basic row content check
        const cells = await bookLocator.locator(".rt-td").count()
        if (cells === 0) {
          console.log(`Skipping empty row ${index + 1}`)
          skippedCount++
          continue
        }

        const bookData = await this.extractBookData(bookLocator, index)
        if (bookData) {
          books.push(bookData)
          processedCount++
          console.log(`Successfully extracted: ${bookData.title}`)
        } else {
          skippedCount++
        }
      } catch (error) {
        console.error(`Failed to process row ${index + 1}:`, error)
        skippedCount++
      }
    }

    console.log("Extraction summary:")
    console.log(`- Total rows: ${bookLocators.length}`)
    console.log(`- Successfully processed: ${processedCount}`)
    console.log(`- Skipped/failed: ${skippedCount}`)

    return books
  }

  private async extractBookData(
    bookLocator: Locator,
    index: number
  ): Promise<BookData | null> {
    // First verify this row has a title link before proceeding
    const titleExists = (await bookLocator.locator(".rt-td a").count()) > 0
    if (!titleExists) {
      console.log(`Skipping row ${index + 1} - no title link found`)
      return null
    }

    try {
      // Extract data with timeouts and fallbacks
      const [titleElement, authorElement, imageElement, publisherElement] =
        await Promise.all([
          bookLocator
            .locator(".rt-td a")
            .first()
            .textContent({
              timeout: this.ELEMENT_TIMEOUT,
            })
            .catch(() => "Unknown Product"),
          bookLocator
            .locator(".rt-td:nth-child(3)")
            .first()
            .textContent({
              timeout: this.ELEMENT_TIMEOUT,
            })
            .catch(() => "Unknown"),
          bookLocator
            .locator(".rt-td img")
            .first()
            .getAttribute("src", {
              timeout: this.ELEMENT_TIMEOUT,
            })
            .catch(() => null),
          bookLocator
            .locator(".rt-td:nth-child(4)")
            .first()
            .textContent({
              timeout: this.ELEMENT_TIMEOUT,
            })
            .catch(() => null),
        ])

      const title = titleElement?.trim() || "Unknown Product"
      const author = authorElement?.trim() || "Unknown"
      const imageUrl = imageElement || undefined
      const publisher = publisherElement?.trim()

      // Validate we have at least a valid title
      if (title === "Unknown Product" || title === "") {
        console.log(`Skipping row ${index + 1} - invalid title`)
        return null
      }

      return { title, author, imageUrl, publisher }
    } catch (error) {
      console.error(`Error extracting data from row ${index + 1}:`, error)
      return null
    }
  }
}
