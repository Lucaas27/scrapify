import cors from "cors"
import "dotenv/config"
import express from "express"
import { chromium } from "playwright"
import { ScraperManager } from "./scrapers"
import { ResponseHandler } from "./utils/responseHandler"

const app = express()
const scraperManager = new ScraperManager()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const PORT = process.env.PORT || 3001

// Get all available scrapers
app.get("/api/scrapers", (_req, res) => {
  const scrapers = scraperManager.getScrapersInfo()
  ResponseHandler.success(res, scrapers)
})

// Scrape with a specific scraper
app.get("/api/scrape/:id", async (req, res) => {
  const { id } = req.params

  try {
    const browser = await chromium.launch()
    const result = await scraperManager.runScraper(id, {
      browser,
      retryCount: 3,
    })

    await browser.close()

    if (!result) {
      return ResponseHandler.error(res, `Scraper '${id}' not found`, 404)
    }

    ResponseHandler.success(res, result)
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred"
    ResponseHandler.error(res, errorMessage, 500)
  }
})

// Scrape with all scrapers
app.get("/api/scrape", async (_req, res) => {
  try {
    const browser = await chromium.launch()
    const results = await scraperManager.scrapeAll({
      browser,
      retryCount: 3,
    })

    await browser.close()
    ResponseHandler.success(res, results)
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred"
    ResponseHandler.error(res, errorMessage, 500)
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
