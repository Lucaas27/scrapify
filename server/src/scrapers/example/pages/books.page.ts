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
    const books: BookData[] = []

    for (const bookLocator of bookLocators) {
      // Skip empty rows or rows without proper content
      const hasContent = (await bookLocator.locator(".rt-td").count()) > 0
      if (!hasContent) continue

      try {
        // Use the class properties with the bookLocator as context
        const titleElement =
          (await this.bookName
            .getLocator()
            .filter({ has: bookLocator })
            .textContent()) || "Unknown Product"

        const authorElement =
          (await this.bookAuthor
            .getLocator()
            .filter({ has: bookLocator })
            .textContent()) || "Unknown"

        const imageUrl =
          (await this.bookImage
            .getLocator()
            .filter({ has: bookLocator })
            .getAttribute("src")) || undefined

        const publisherElement =
          (await this.bookPublisher
            .getLocator()
            .filter({ has: bookLocator })
            .textContent()) || undefined

        // Only add non-empty books (some rows might be empty in the table)
        if (titleElement !== "Unknown Product" && titleElement.trim() !== "") {
          books.push({
            title: titleElement.trim(),
            imageUrl,
            author: authorElement?.trim(),
            publisher: publisherElement?.trim(),
          })
        }
      } catch (error) {
        console.error("Error extracting book data:", error)
      }
    }

    return books
  }
}
