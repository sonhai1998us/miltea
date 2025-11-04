import { fetchApi, postApi, deleteApi, putApi } from "@/utils/Helper"
import { MilkTea, Topping, CartItem, Order } from "@/types/shop"

export class ShopService {
  private static getApiUrl(endpoint: string): string {
    return `${process.env.API_URL}${process.env.PREFIX_API}${endpoint}`
  }

  // Fetch milk teas
  static async fetchMilkTeas(): Promise<MilkTea[]> {
    try {
      const response = await fetchApi(this.getApiUrl('products?fqnull=deleted_at&fq=is_active:1'))
      return response?.status === 'success' && response?.data ? response.data as MilkTea[] : []
    } catch (error) {
      console.error('Error fetching milk teas:', error)
      return []
    }
  }

  // Fetch toppings
  static async fetchToppings(): Promise<Topping[]> {
    try {
      const response = await fetchApi(this.getApiUrl('toppings?fqnull=deleted_at&fq=is_active:1,sellable:1'))
      return response?.status === 'success' && response?.data ? response.data as Topping[] : []
    } catch (error) {
      console.error('Error fetching toppings:', error)
      return []
    }
  }

  // Fetch cart items
  static async fetchCartItems(): Promise<CartItem[]> {
    try {
      const response = await fetchApi(this.getApiUrl('cart_items?fqnull=deleted_at'))
      return response?.status === 'success' && response?.data ? response.data as CartItem[] : []
    } catch (error) {
      console.error('Error fetching cart items:', error)
      return []
    }
  }

  // Fetch orders
  static async fetchOrders(): Promise<Order[]> {
    try {
      const response = await fetchApi(this.getApiUrl('orders?fqnull=deleted_at'))
      return response?.status === 'success' && response?.data ? response.data as Order[] : []
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  }

  // Add item to cart (product)
  static async addToCart(cartData: {
    product_id: number
    quantity: number
    sweetness_id: string
    ice_id: string
    size_id: string
    notes: string
    item_type?: string
  }): Promise<boolean> {
    try {
      const cartPayload = {
        ...cartData,
        item_type: cartData.item_type || "PRODUCT"
      }
      const response = await postApi(this.getApiUrl('cart_items'), cartPayload)
      return response?.status === 'success'
    } catch (error) {
      console.error('Error adding to cart:', error)
      return false
    }
  }

  // Add topping to cart as a separate item
  static async addToppingToCart(cartData: {
    topping_id: number
    quantity: number
    notes?: string
  }): Promise<boolean> {
    try {
      const cartPayload = {
        topping_id: cartData.topping_id,
        quantity: cartData.quantity,
        item_type: "TOPPING",
        size_id: null,
        sweetness_id: null,
        ice_id: null,
        notes: cartData.notes || ""
      }
      const response = await postApi(this.getApiUrl('cart_items'), cartPayload)
      return response?.status === 'success'
    } catch (error) {
      console.error('Error adding topping to cart:', error)
      return false
    }
  }

  // Add topping to cart item
  static async addToppingToCartItem(cartItemId: number, toppingId: number, quantity: number): Promise<boolean> {
    try {
      const response = await postApi(this.getApiUrl('cart_item_toppings'), {
        cart_item_id: cartItemId,
        topping_id: toppingId,
        quantity
      })
      return response?.status === 'success'
    } catch (error) {
      console.error('Error adding topping to cart item:', error)
      return false
    }
  }

  // Remove item from cart
  static async removeFromCart(itemId: number): Promise<boolean> {
    try {
      const response = await deleteApi(this.getApiUrl(`cart_items/${itemId}`))
      return response?.status === 'success'
    } catch (error) {
      console.log('Error removing from cart:', error)
      return false
    }
  }

  // Create order
  static async createOrder(orderData: {
    payment_method_id: number
    order_time: Date
    total_amount: number
    is_completed: number
    discount_amount: number
  }): Promise<Order | null> {
    try {
      const response = await postApi(this.getApiUrl('orders'), orderData)
      if(response?.status === 'success'){
        const _fetchOrdersNewest = await fetchApi(this.getApiUrl('orders')).then(resp => (resp?.data as Order[])[0])
        return _fetchOrdersNewest
      }
      return response?.status === 'success' ? response as Order : null
    } catch (error) {
      console.error('Error creating order:', error)
      return null
    }
  }

  // Add order item
  static async addOrderItem(orderItemData: {
    order_id: number
    product_id: number
    size_id: string
    sweetness_id: string
    ice_id: string
    quantity: number
    unit_price: number
    notes: string
    item_type: "PRODUCT" | "TOPPING"
    topping_id: number
    toppings: Topping[]
  }): Promise<boolean> {
    try {
      const response = await postApi(this.getApiUrl('order_items'), orderItemData)
      return response?.status === 'success'
    } catch (error) {
      console.error('Error adding order item:', error)
      return false
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: number, isCompleted: boolean): Promise<boolean> {
    try {
      const response = await putApi(this.getApiUrl(`orders/${orderId}`), { is_completed: isCompleted })
      return response?.status === 'success'
    } catch (error) {
      console.error('Error updating order status:', error)
      return false
    }
  }

  // Clear cart (remove all items)
  static async clearCart(cartItems: CartItem[]): Promise<boolean> {
    try {
      const deletePromises = cartItems.map(item => this.removeFromCart(item.id))
      await Promise.all(deletePromises)
      return true
    } catch (error) {
      console.error('Error clearing cart:', error)
      return false
    }
  }
  static async printBill(order: Order): Promise<boolean>{ 
    try {
      await postApi(this.getApiUrl('print-bill'), order)
      return true
    } catch (error) {
      console.error('Error print bill order:', error)
      return false
    }
  }

}
