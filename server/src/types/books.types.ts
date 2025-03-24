export interface BookData {
  title: string
  imageUrl?: string
  author?: string
  publisher?: string
}

export interface BookToScrapeData {
  title: string
  imageUrl?: string
  price?: string
  availability?: string
  author?: string
  publisher?: string
}
