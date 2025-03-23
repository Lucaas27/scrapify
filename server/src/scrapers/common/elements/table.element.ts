import { BaseElement } from "../base.element"
import { expect, Locator, Page } from "@playwright/test"

export class Table extends BaseElement {
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
    return "table"
  }

  async shouldHaveColumn(
    columnName: string,
    not: boolean = false
  ): Promise<Locator> {
    const column = this.page.locator(`th:has-text("${columnName}")`)
    console.log(`Table column "${columnName}" should be defined`)
    if (not) {
      await expect(column).not.toBeVisible()
    } else {
      await expect(column).toBeVisible()
    }

    return column
  }

  async shouldHaveRow(
    rowNumber: number,
    not: boolean = false
  ): Promise<Locator> {
    const row = this.page.locator(`tr:nth-child(${rowNumber})`)
    console.log(`Table row number "${rowNumber}" should be defined`)
    if (not) {
      await expect(row).not.toBeVisible()
    } else {
      await expect(row).toBeVisible()
    }

    return row
  }

  async shouldHaveCellWithText(
    rowNumber: number,
    text: string,
    not: boolean = false
  ): Promise<Locator> {
    const cell: Locator = this.page.locator(
      `tr:nth-child(${rowNumber}) td:has-text("${text}")`
    )
    console.log(
      `Row number "${rowNumber}" should contain a cell with text "${text}"`
    )
    expect(cell).toBeDefined()
    if (not) {
      await expect(cell).not.toContainText(text)
    } else {
      await expect(cell).toContainText(text)
    }

    return cell
  }

  async shouldHaveCellWithAttribute(
    rowNumber: number,
    columnName: string,
    attribute: string,
    value: string,
    not: boolean = false
  ): Promise<Locator> {
    let cell: Locator = null!
    console.log(
      `Row number "${rowNumber}" in column "${columnName}" should ${
        not ? "not " : ""
      }have attribute "${attribute}" with value "${value}"`
    )
    const columnIndex = await this.page
      .locator(`th:has-text("${columnName}")`)
      .evaluate(th => Array.from(th.parentNode?.children || []).indexOf(th) + 1)

    cell = this.page.locator(
      `tr:nth-child(${rowNumber}) td:nth-child(${columnIndex})`
    )

    if (not) {
      await expect(cell).not.toHaveAttribute(attribute, value)
    } else {
      await expect(cell).toHaveAttribute(attribute, value)
    }

    return cell
  }

  async shouldHaveNumberOfRows(
    numberOfRows: number,
    not: boolean = false
  ): Promise<void> {
    console.log(`Table should have "${numberOfRows}" rows`)
    const rows = this.page.locator("tr")
    if (not) {
      await expect(rows).not.toHaveCount(numberOfRows)
    } else {
      await expect(rows).toHaveCount(numberOfRows)
    }
  }

  async shouldHaveNumberOfColumns(
    numberOfColumns: number,
    not: boolean = false
  ): Promise<void> {
    console.log(`Table should have "${numberOfColumns}" columns`)
    const columns = this.page.locator("th")
    if (not) {
      await expect(columns).not.toHaveCount(numberOfColumns)
    } else {
      await expect(columns).toHaveCount(numberOfColumns)
    }
  }

  async shouldAllCellsInColumnHaveText(
    columnName: string,
    text: string,
    not: boolean = false
  ): Promise<void> {
    console.log(
      `All cells in column "${columnName}" should have text "${text}"`
    )
    const columnIndex = await this.page
      .locator(`th:has-text("${columnName}")`)
      .evaluate(th => Array.from(th.parentNode?.children || []).indexOf(th) + 1)
    const columnCells = this.page.locator(`tr td:nth-child(${columnIndex})`)
    const cellCount = await columnCells.count()
    for (let i = 0; i < cellCount; i++) {
      const cell = columnCells.nth(i)
      if (not) {
        await expect(cell).not.toContainText(text)
      } else {
        await expect(cell).toContainText(text)
      }
    }
  }

  async shouldHaveTableHeaders(headers: string[]): Promise<void> {
    headers.forEach(async header => {
      await this.shouldHaveColumn(header)
    })
  }
}
