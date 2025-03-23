import { BaseElement } from "../base.element"
import { expect, Page } from "@playwright/test"

export class Select extends BaseElement {
  constructor(
    page: Page,
    locatorStr: string,
    name: string,
    hiddenOnFirstLoad?: boolean,
    strict?: boolean
  ) {
    super(page, locatorStr, name, hiddenOnFirstLoad ?? false, strict ?? true)
  }

  override get typeOf(): string {
    return "select"
  }

  async shouldHaveOption(option: string): Promise<void> {
    console.log(
      `${this.typeOfCapitalised} named ${this.name} should have option "${option}"`
    )
    const optionLocator = this.page.locator(`option:has-text("${option}")`)
    expect(optionLocator).toBeDefined()
  }

  async shouldHaveSelectedOption(option: string): Promise<void> {
    console.log(
      `${this.typeOfCapitalised} named ${this.name} should have option "${option}" selected`
    )
    const selectedOptionLocator = this.page.locator(
      `option:selected:has-text("${option}")`
    )
    expect(selectedOptionLocator).toBeDefined()
    expect(await this.getSelectedOptionText()).toBe(option)
  }

  async selectByVisibleText(text: string): Promise<void> {
    console.log(
      `${this.typeOfCapitalised} named ${this.name} should select option with text "${text}"`
    )
    await this.page.selectOption(this.locatorStr, { label: text })
    expect(await this.getSelectedOptionText()).toBe(text)
  }

  async selectByValue(value: string): Promise<void> {
    console.log(
      `${this.typeOfCapitalised} named ${this.name} should select option with value "${value}"`
    )
    await this.page.selectOption(this.locatorStr, { value })
    expect(await this.getSelectedOptionValue()).toBe(value)
  }

  async getSelectedOptionText(): Promise<string> {
    const selectedOption = await this.page
      .locator(this.locatorStr)
      .evaluate(
        element =>
          (element as HTMLSelectElement).selectedOptions[0]?.textContent ?? ""
      )

    return selectedOption
  }

  async getSelectedOptionValue(): Promise<string> {
    const selectedOption = await this.page
      .locator(this.locatorStr)
      .evaluate(
        element =>
          (element as HTMLSelectElement).selectedOptions[0]?.value ?? ""
      )

    return selectedOption
  }
}
