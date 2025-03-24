import { Browser, BrowserContext } from "playwright"
import { BaseElement } from "../scrapers/common/base.element"

export interface ScraperOptions {
  browser: Browser
  context?: BrowserContext
  retryCount?: number
  url?: string
  maxConcurrency?: number
  timeoutMs?: number
}

export interface ScraperResult<T = unknown> {
  id: string
  source: string
  items: T[]
  timestamp: Date
  metadata?: {
    totalPages?: number
    totalItems?: number
    executionTimeMs?: number
  }
}

export interface Scraper<T = unknown> {
  id: string
  name: string
  description: string
  scrape(options: ScraperOptions): Promise<ScraperResult<T>>
}

export interface IElementsVisibility {
  getElements(): BaseElement[]
}
