// API Response interface for product size prices
export interface ProductSizePrice {
  id: number
  product_id: number
  size_id: number
  price: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Transformed interface for frontend use
export interface ProductSizePrices {
  product_id: number
  size_id: number
  price: number
}

// Function to fetch product size prices from API
export const fetchProductSizePrices = async (): Promise<ProductSizePrices[]> => {
  try {
    const { fetchApi } = await import('@/utils/Helper')
    const data = await fetchApi(`${process.env.API_URL}${process.env.PREFIX_API}product_size_prices?fqnull=deleted_at`)
    
    if (data?.status === 'success' && Array.isArray(data?.data)) {
      return data.data.map((item: ProductSizePrice) => ({
        product_id: item.product_id,
        size_id: item.size_id,
        price: item.price
      }))
    }
    return []
  } catch (error) {
    console.error('Error fetching product size prices:', error)
    return []
  }
}

