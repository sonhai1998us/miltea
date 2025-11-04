export interface MilkTea {
  documentId?: string
  id: number
  name: string
  base_price: number
  description: string
  image?: { url: string } | null
  rating: number | string
  created_at?: string
  updated_at?: string
}

export interface Topping {
  documentId?: string
  id: number
  name: string
  price: number
  created_at?: string
  updated_at?: string
}

export interface CartItem {
  id: number
  milkTea: MilkTea
  quantity: number
  toppings: Topping[]
  product_id: string
  product_name: string
  sweetness_name: string
  ice_name: string
  notes: string
  total_price: number
  product_price: number
  size_id: string
  size_name: string
  size_price: number
  sweetness_id: string
  ice_id: string
  unit_price: number
  status: boolean
  item_type: "PRODUCT" | "TOPPING"
  topping_id: number
  topping_name: string
  topping_price: number
}

export interface Order {
  id: number
  items: CartItem[]
  total_price: number
  paymentMethod: string
  order_time: Date
  payment_method_id: number
  total_amount: number
  discount_amount: number
  is_completed: boolean
}

export interface Voucher {
  name: string
  value: number
  type: "percent" | "thousand" | string
}

// API Response interfaces for sweetness and ice levels
export interface SweetnessLevel {
  id: number
  level: number
  label: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface IceLevel {
  id: number
  level: number
  label: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// API Response interface for sizes
export interface Size {
  id: number
  name: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Transformed interfaces for frontend use
export interface SweetnessLevelOption {
  value: string
  label: string
}

export interface IceLevelOption {
  value: string
  label: string
}

export interface SizeOption {
  value: string
  label: string
}

// Default values for fallback
export const defaultSweetnessLevels: SweetnessLevelOption[] = [
  { value: "0", label: "0%" },
  { value: "30", label: "30%" },
  { value: "50", label: "50%" },
  { value: "70", label: "70%" },
  { value: "100", label: "100%" },
]

export const defaultIceLevels: IceLevelOption[] = [
  { value: "3", label: "Không đá" },
  { value: "4", label: "Vừa" },
  { value: "5", label: "Đầy" },
]

export const defaultSizes: SizeOption[] = [
  { value: "1", label: "S" },
  { value: "2", label: "M" },
  { value: "3", label: "L" },
]

// Functions to fetch levels from API
export const fetchSweetnessLevels = async (): Promise<SweetnessLevelOption[]> => {
  try {
    const { fetchApi } = await import('@/utils/Helper')
    const data = await fetchApi(`${process.env.API_URL}${process.env.PREFIX_API}sweetness_levels?fqnull=deleted_at`)
    
    if (data?.status === 'success' && Array.isArray(data?.data)) {
      return data.data.map((item: SweetnessLevel) => ({
        value: item.id.toString(),
        label: item.label
      }))
    }
    return defaultSweetnessLevels
  } catch (error) {
    console.error('Error fetching sweetness levels:', error)
    return defaultSweetnessLevels
  }
}

export const fetchIceLevels = async (): Promise<IceLevelOption[]> => {
  try {
    const { fetchApi } = await import('@/utils/Helper')
    const data = await fetchApi(`${process.env.API_URL}${process.env.PREFIX_API}ice_levels?fqnull=deleted_at`)
    
    if (data?.status === 'success' && Array.isArray(data?.data)) {
      return data.data.map((item: IceLevel) => ({
        value: item.id.toString(),
        label: item.label
      }))
    }
    return defaultIceLevels
  } catch (error) {
    console.error('Error fetching ice levels:', error)
    return defaultIceLevels
  }
}

export const fetchSizes = async (): Promise<SizeOption[]> => {
  try {
    const { fetchApi } = await import('@/utils/Helper')
    const data = await fetchApi(`${process.env.API_URL}${process.env.PREFIX_API}sizes?fqnull=deleted_at`)
    
    if (data?.status === 'success' && Array.isArray(data?.data)) {
      return data.data.map((item: Size) => ({
        value: item.id.toString(),
        label: item.name
      }))
    }
    return defaultSizes
  } catch (error) {
    console.error('Error fetching sizes:', error)
    return defaultSizes
  }
}

// Legacy types for backward compatibility
export type SweetValue = string
export type IceValue = string
export type SizeValue = string
