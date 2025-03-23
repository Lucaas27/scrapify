import { BaseElement } from "../base.element"
import { Page } from "@playwright/test"

export class Link extends BaseElement {
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
    return "link"
  }
}
