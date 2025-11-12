import { CartItem, Order } from "@/types/shop"

// Format price to Vietnamese currency
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("vi-VN", { 
    style: "currency", 
    currency: "VND" 
  }).format(price)
}

// Format date time to Vietnamese format
export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat("vi-VN", { 
    day: "2-digit", 
    month: "2-digit", 
    year: "numeric", 
    hour: "2-digit", 
    minute: "2-digit" 
  }).format(new Date(date))
}

// Format input number with Vietnamese locale
export const formatInputNumber = (value: string): string => {
  const number = value.replace(/\D/g, '')
  return number ? parseInt(number, 10).toLocaleString('vi-VN') : ''
}

// Calculate total cart price
export const calculateTotalCartPrice = (
  cart: CartItem[], 
  discountAmount: number = 0, 
  discountLocked: boolean = false
): number => {
  const subtotal = cart.reduce((sum, item) => {
    const basePrice = (item.product_price || item.topping_price) * item.quantity
    const toppingsPrice = item.toppings 
      ? item.toppings.reduce((toppingSum, topping) => toppingSum + topping.price, 0) * item.quantity 
      : 0
    const sizePrice = item.size_price * item.quantity
    return sum + basePrice + toppingsPrice + sizePrice
  }, 0)
  
  const discount = discountLocked ? discountAmount : 0
  return Math.max(subtotal - discount, 0)
}

// Sort orders by completion status and time
export const sortOrders = (orders: Order[]): Order[] => {
  const copy = [...orders]
  copy.sort((a, b) => {
    if (a.is_completed === b.is_completed) {
      return new Date(b.order_time).getTime() - new Date(a.order_time).getTime()
    }
    return a.is_completed ? 1 : -1
  })
  return copy
}

// Validate cash payment
export const validateCashPayment = (cashAmount: number, totalAmount: number): string => {
  if (cashAmount === 0) {
    return "Vui lòng nhập số tiền khách đưa"
  }
  if (cashAmount < totalAmount) {
    return `Số tiền không đủ. Còn thiếu ${formatPrice(totalAmount - cashAmount)}`
  }
  return ""
}

// Get quantity from quantities object
export const getQuantity = (quantities: Record<number, number>, id: number): number => {
  return quantities[id] || 0
}

// Update quantity in quantities object
export const updateQuantity = (
  quantities: Record<number, number>, 
  id: number, 
  newQuantity: number
): Record<number, number> => {
  if (newQuantity >= 0) {
    return { ...quantities, [id]: newQuantity }
  }
  return quantities
}

