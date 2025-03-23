import { expect, Locator, Page } from "@playwright/test"

export abstract class BaseElement {
  page: Page
  name: string
  locatorStr: string
  hiddenOnFirstLoad: boolean
  strict: boolean

  protected constructor(
    page: Page,
    locatorStr: string,
    name: string,
    hiddenOnFirstLoad: boolean = false,
    strict: boolean = true
  ) {
    this.page = page
    this.locatorStr = locatorStr
    this.name = name
    this.hiddenOnFirstLoad = hiddenOnFirstLoad
    this.strict = strict
  }

  get elementName(): string {
    return this.name || this.constructor.name
  }

  get typeOf(): string {
    return "element"
  }

  get typeOfCapitalised(): string {
    return this.typeOf.charAt(0).toUpperCase() + this.typeOf.slice(1)
  }

  private generateInfoMessage(info: string): string {
    return `The ${this.typeOf} with name "${this.elementName}" and locator "${this.locatorStr}" ${info}`
  }

  getLocator(options?: {
    has?: Locator
    hasNot?: Locator
    hasNotText?: string | RegExp
    hasText?: string | RegExp
  }): Locator {
    return this.page.locator(this.locatorStr, options || {})
  }

  async shouldBeVisible(): Promise<void> {
    try {
      // For multiple elements, check if at least one is visible
      if (!this.strict) {
        const count = await this.getLocator().count()
        console.log(`Found ${count} elements for "${this.name}"`)

        if (count === 0) {
          throw new Error(`No elements found for "${this.name}"`)
        }

        // Check if at least one element is visible
        const isVisible = await this.getLocator().first().isVisible()
        if (!isVisible) {
          throw new Error(`No visible elements found for "${this.name}"`)
        }

        return
      }

      // For strict mode, expect exactly one visible element
      await this.getLocator().waitFor({ state: "visible", timeout: 10000 })
    } catch (error) {
      console.error(`Element visibility check failed for "${this.name}":`)
      console.error(`- Selector: ${this.getLocator()}`)
      if (error instanceof Error) {
        console.error(`- Error: ${error.message}`)
        console.error(`- Stack: ${error.stack}`)
      }
      throw error
    }
  }

  async shouldBeHidden(): Promise<void> {
    console.log(`${this.typeOfCapitalised} "${this.name}" should be hidden`)
    const locator = this.getLocator()
    await expect(
      locator,
      this.generateInfoMessage("should be hidden")
    ).toBeHidden()
  }

  async shouldHaveText(text: string): Promise<void> {
    console.log(
      `${this.typeOfCapitalised} "${this.name}" should have text ${text}`
    )
    const locator = this.getLocator()
    await expect(
      locator,
      this.generateInfoMessage(`contain text ${text}`)
    ).toContainText(text)
  }

  async click(): Promise<void> {
    console.log(`Clicking the ${this.typeOf} named ${this.name}`)
    await this.getLocator().click()
  }

  async doubleClick(): Promise<void> {
    console.log(`Double click on ${this.typeOf} "${this.name}"`)
    await this.getLocator().dblclick()
  }

  async hover(): Promise<void> {
    console.log(`Hovering over the ${this.typeOf} named ${this.name}`)
    await this.getLocator().hover()
  }

  async type(text: string): Promise<void> {
    console.log(`Typing into the ${this.typeOf} named ${this.name}`)
    await this.getLocator().pressSequentially(text, { delay: 100 })
  }

  async clear(): Promise<void> {
    console.log(`Clearing the ${this.typeOf} named ${this.name}`)
    await this.getLocator().clear()
  }

  async pressKey(key: string): Promise<void> {
    console.log(
      `Pressing the key "${key}" on the ${this.typeOf} named ${this.name}`
    )
    await this.getLocator().press(key)
  }

  async focus(): Promise<void> {
    console.log(`Focusing on the ${this.typeOf} named ${this.name}`)
    await this.getLocator().focus()
  }

  async scrollIntoView(): Promise<void> {
    console.log(`Scrolling the ${this.typeOf} named ${this.name} into view`)
    await this.getLocator().scrollIntoViewIfNeeded()
  }

  async selectOption(option: string): Promise<void> {
    console.log(
      `Selecting the option "${option}" from the ${this.typeOf} named ${this.name}`
    )
    await this.getLocator().selectOption({ label: option })
  }

  async shouldBeDisabled(): Promise<void> {
    console.log(`${this.typeOfCapitalised} "${this.name}" should be disabled`)
    const locator = this.getLocator()
    await expect(
      locator,
      this.generateInfoMessage("should be disabled")
    ).toBeDisabled()
  }

  async shouldHaveValue(value: string): Promise<void> {
    console.log(
      `${this.typeOfCapitalised} "${this.name}" should have value "${value}"`
    )
    const locator = this.getLocator()
    await expect(
      locator,
      this.generateInfoMessage(`should have value ${value}`)
    ).toHaveValue(value)
  }

  async shouldNotHaveValue(value: string): Promise<void> {
    console.log(
      `${this.typeOfCapitalised} "${this.name}" should not have value "${value}"`
    )
    const locator = this.getLocator()
    await expect(
      locator,
      this.generateInfoMessage(`should not have ${value}`)
    ).not.toHaveValue(value)
  }

  async shouldHaveAttribute(attribute: string, value: string): Promise<void> {
    console.log(
      `${this.typeOfCapitalised} "${this.name}" should have attribute "${attribute}" with value "${value}"`
    )
    const locator = this.getLocator()
    await expect(
      locator,
      this.generateInfoMessage(
        `should attribute "${attribute}" with value have ${value}`
      )
    ).toHaveAttribute(attribute, value)
  }
}
