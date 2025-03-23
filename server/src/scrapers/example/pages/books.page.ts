import { Page } from "playwright"
import { BasePage } from "../../common/base.page"
import { Link } from "../../common/elements/link.element"
import { ListItem } from "../../common/elements/listItem.element"
import { Wrapper } from "../../common/elements/wapper.element"
import { BookData } from "../../../types/books.types"

export class BooksPage extends BasePage {
  private readonly baseUrl = "https://demoqa.com/books"

  private readonly bookItems: ListItem = new ListItem(
    this.page,
    ".rt-tr-group",
    "Books",
    false,
    false
  )

  private readonly bookName: Link = new Link(
    this.page,
    ".rt-td a",
    "Product Name",
    false,
    false
  )

  private readonly bookAuthor: Wrapper = new Wrapper(
    this.page,
    ".rt-td:nth-child(3)",
    "Product Author",
    false,
    false
  )
  private readonly bookImage: Wrapper = new Wrapper(
    this.page,
    ".rt-td img",
    "Product Image",
    false,
    false
  )
  private readonly bookPublisher: Wrapper = new Wrapper(
    this.page,
    ".rt-td:nth-child(4)",
    "Product Publisher",
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
    // Wait for book list to be visible
    await this.elementsShouldBeVisible()

    // Get all book items
    const bookLocators = await this.bookItems.getLocator().all()
    console.log(`Found ${bookLocators.length} book locators`)
    const books: BookData[] = []

    for (const [index, bookLocator] of bookLocators.entries()) {
      console.log(`Processing book ${index + 1}/${bookLocators.length}`)

      try {
        // Skip empty rows or rows without proper content
        const hasContent = (await bookLocator.locator(".rt-td").count()) > 0
        if (!hasContent) {
          console.log(`Skipping empty row ${index + 1}`)
          continue
        }

        // Extract data with proper context
        const data = await Promise.all([
          bookLocator
            .locator(".rt-td a")
            .first()
            .textContent()
            .then(text => text?.trim() || "Unknown Product"),
          bookLocator
            .locator(".rt-td:nth-child(3)")
            .first()
            .textContent()
            .then(text => text?.trim() || "Unknown"),
          bookLocator.locator(".rt-td img").first().getAttribute("src"),
          bookLocator
            .locator(".rt-td:nth-child(4)")
            .first()
            .textContent()
            .then(text => text?.trim()),
        ])

        const [title, author, imageUrl, publisher] = data

        // Only add non-empty books (some rows might be empty in the table)
        if (title !== "Unknown Product" && title !== "") {
          books.push({ title, author, imageUrl, publisher })
        }
      } catch (error) {
        console.error("Error extracting book data:", error)
      }
    }

    return books
  }
}
