export interface Product {
  id: number
  name: string
  description: string
  price: number | null
  image: string
  images: string[]
  category: string
  subcategory: string
  manufacturer: string
  manufacturerCode: string
  productReference: string
}
