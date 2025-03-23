import { Page } from "playwright"
import { IElementsVisibility } from "../../types/scrapers.types"
import { BaseElement } from "./base.element"

export abstract class BasePage implements IElementsVisibility {
  protected constructor(protected page: Page) {}

  async goto(url: string): Promise<void> {
    console.log(`Visiting ${url}`)
    await this.page.goto(url, { waitUntil: "networkidle" })
  }

  async reloadPage(): Promise<void> {
    console.log("Reloading page")
    await this.page.reload({ waitUntil: "networkidle" })
  }

  async openNewTab(): Promise<Page> {
    console.log("Opening new tab")
    return await this.page.context().newPage()
  }

  async reloadTab(number: number): Promise<void> {
    console.log(`Reloading tab ${number}`)
    const tabPage = this.page.context().pages()[number]

    await tabPage?.bringToFront()
    await tabPage?.reload({ waitUntil: "networkidle" })
  }

  async closeTab(number: number): Promise<void> {
    console.log(`Closing tab ${number}`)
    const tabPage = this.page.context().pages()[number]

    await tabPage?.close()
  }

  async waitForDownload(): Promise<void> {
    console.log("Waiting for download to complete")
    await this.page.waitForEvent("download")
  }

  async getTitle(): Promise<string> {
    return this.page.title()
  }

  async screenshot(path?: string): Promise<Buffer> {
    return this.page.screenshot({ path })
  }

  /**
   * Uses reflection to retrieve all elements of type `BaseElement` from the current instance and its nested components.
   *
   * This method first collects all properties of the current instance that are instances of `BaseElement`.
   *
   * @returns {BaseElement[]} An array of `BaseElement` instances found in the current instance and its nested components.
   */
  getElements(): BaseElement[] {
    const elements = Object.getOwnPropertyNames(this)
      .map(prop => (this as Record<string, unknown>)[prop])
      .filter(prop => prop instanceof BaseElement)

    return elements
  }

  private getElementsHiddenOnFirstLoad(): BaseElement[] {
    return this.getElements().filter(element => element.hiddenOnFirstLoad)
  }

  /**
   * Ensures that all elements are visible, except those that are hidden by default.
   *
   * This method retrieves the elements using `getElements` and checks their visibility.
   * If an element is not in the list of elements hidden by default, it verifies that the element is visible.
   * For elements that are hidden by default, it verifies that they are hidden.
   *
   * @returns {Promise<void>} A promise that resolves when the visibility checks are complete.
   */
  async elementsShouldBeVisible(): Promise<void> {
    const elements = this.getElements()
    const elementsHiddenByDefault = this.getElementsHiddenOnFirstLoad
      ? this.getElementsHiddenOnFirstLoad()
      : []

    for (const element of elements) {
      if (!elementsHiddenByDefault.includes(element)) {
        await element.shouldBeVisible()
      }
    }

    for (const hiddenElement of elementsHiddenByDefault) {
      await hiddenElement.shouldBeHidden()
    }
  }
}
