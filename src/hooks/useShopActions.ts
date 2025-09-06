import { useCallback, useMemo } from "react"
import { ShopService } from "@/services/shopService"
import { MilkTea, Topping, Order } from "@/types/shop"
import { validateCashPayment, calculateTotalCartPrice } from "@/utils/shopUtils"

export const useShopActions = (
  state: ReturnType<typeof import('./useShopState').useShopState>
) => {
  const {
    setMilkTeas,
    setIsLoadingMilkTeas,
    setToppings,
    setCart,
    setOrders,
    setActiveSheet,
    setSelectedMilkTea,
    setQuantities,
    setCashError,
    resetSheetState,
    resetCheckoutState,
    quantities,
    selectedMilkTea,
    sheetSweetness,
    sheetIce,
    sheetSize,
    sheetNote,
    sheetToppings,
    cart,
    discountAmount,
    discountLocked,
    paymentMethod,
    cashAmount,
  } = state

  // Calculate total cart price
  const getTotalCartPrice = useMemo(() => {
    return calculateTotalCartPrice(cart, discountAmount, discountLocked)
  }, [cart, discountAmount, discountLocked])

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoadingMilkTeas(true)
      
      // Fetch all data in parallel
      const [milkTeas, toppings, cartItems, orders] = await Promise.all([
        ShopService.fetchMilkTeas(),
        ShopService.fetchToppings(),
        ShopService.fetchCartItems(),
        ShopService.fetchOrders(),
      ])

      setMilkTeas(milkTeas)
      setToppings(toppings)
      setCart(cartItems)
      setOrders(orders)
      setIsLoadingMilkTeas(false)
    } catch (error) {
      console.error('Error fetching initial data:', error)
      setIsLoadingMilkTeas(false)
    }
  }, [setMilkTeas, setIsLoadingMilkTeas, setToppings, setCart, setOrders])

  // Handle add to cart
  const handleAddToCart = useCallback((milkTea: MilkTea) => {
    setSelectedMilkTea(milkTea)
    // resetSheetState()
    setActiveSheet('customization')
  }, [setSelectedMilkTea, resetSheetState, setActiveSheet])

  // Confirm add to cart
  const confirmAddToCart = useCallback(async (id: number) => {
    if (!selectedMilkTea) return

    const quantity = quantities[id] || 0
    const cartData = {
      product_id: id,
      quantity,
      sweetness_id: sheetSweetness,
      ice_id: sheetIce,
      size_id: sheetSize,
      notes: sheetNote,
    }

    const success = await ShopService.addToCart(cartData)
    if (success) {
      // Refresh cart
      const refreshedCart = await ShopService.fetchCartItems()
      setCart(refreshedCart)

      // Add toppings if any
      if (sheetToppings && sheetToppings.length > 0) {
        const cartItemId = refreshedCart[0]?.id
        if (cartItemId) {
          for (const topping of sheetToppings) {
            await ShopService.addToppingToCartItem(cartItemId, topping.id)
          }
          // Refresh cart again after adding toppings
          const finalCart = await ShopService.fetchCartItems()
          setCart(finalCart)
        }
      }

      // Reset state
      setActiveSheet('none')
      resetSheetState()
      setQuantities(prev => selectedMilkTea ? { ...prev, [selectedMilkTea.id]: 0 } : prev)
    } else {
      console.log('Error adding to cart')
    }
  }, [selectedMilkTea, quantities, sheetSweetness, sheetIce, sheetSize, sheetNote, sheetToppings, setCart, setActiveSheet, resetSheetState, setQuantities])

  // Toggle topping selection
  const toggleTopping = useCallback((topping: Topping) => {
    state.setSheetToppings((prev) => 
      prev.some((x) => x.id === topping.id) 
        ? prev.filter((x) => x.id !== topping.id) 
        : [...prev, topping]
    )
  }, [state.setSheetToppings])

  // Remove from cart
  const removeFromCart = useCallback(async (itemId: number) => {
    try{
      await ShopService.removeFromCart(itemId)
        const refreshedCart = await ShopService.fetchCartItems();
        setCart(refreshedCart)
    }catch(e){
      console.log('Error removing from cart',e)
    }
  }, [setCart])

  // Start checkout
  const handleStartCheckout = useCallback(() => {
    setActiveSheet('checkout')
    state.setCheckoutStep(1)
    state.setPaymentMethod("")
  }, [setActiveSheet, state.setCheckoutStep, state.setPaymentMethod])

  // Handle payment method next
  const handlePaymentMethodNext = useCallback(() => {
    if (paymentMethod) {
      state.setCheckoutStep(2)
    }
  }, [paymentMethod, state.setCheckoutStep])

  // Complete order
  const handleCompleteOrder = useCallback(async () => {
    if (paymentMethod === "cash") {
      const error = validateCashPayment(cashAmount, getTotalCartPrice)
      if (error) {
        setCashError(error)
        return
      }
    }
    setCashError("")
    const now = new Date();
    const orderData = {
      payment_method_id: paymentMethod === "cash" ? 1 : 2,
      order_time: new Date(now.getTime() + 7 * 60 * 60 * 1000),
      total_amount: getTotalCartPrice,
      is_completed: 0,
      discount_amount: discountLocked ? discountAmount : 0,
    }

    const newOrder = await ShopService.createOrder(orderData).then((resp) => resp)
    if (newOrder) {
      // Add order items
      for (const item of cart) {
        await ShopService.addOrderItem({
          order_id: newOrder.id,
          product_id: Number(item.product_id),
          size_id: item.size_id.toString(),
          sweetness_id: item.sweetness_id.toString(),
          ice_id: item.ice_id.toString(),
          quantity: item.quantity,
          unit_price: item.product_price,
          notes: item.notes,
          toppings: item?.toppings ?? []
        })
      }

      // Clear cart
      await ShopService.clearCart(cart)

      // Refresh data
      const [refreshedOrders, refreshedCart] = await Promise.all([
        ShopService.fetchOrders(),
        ShopService.fetchCartItems(),
      ])

      setOrders(refreshedOrders)
      setCart(refreshedCart)

      // Reset checkout state
      setActiveSheet('none')
      resetCheckoutState()
    } else {
      console.log('Error creating order')
    }
  }, [
    paymentMethod, 
    cashAmount, 
    getTotalCartPrice, 
    cart, 
    discountAmount, 
    discountLocked,
    setCashError,
    setOrders,
    setCart,
    setActiveSheet,
    resetCheckoutState
  ])
  // Toggle order status
  const toggleOrderStatus = useCallback(async (order: Order) => {
    // Optimistic update
    setOrders((prev) => 
      prev.map((o) => 
        o.id === order.id ? { ...o, is_completed: !o.is_completed } : o
      )
    )

    const success = await ShopService.updateOrderStatus(order.id, !order.is_completed)
    if (!success) {
      // Revert on error
      setOrders((prev) => 
        prev.map((o) => 
          o.id === order.id ? { ...o, is_completed: order.is_completed } : o
        )
      )
    }
  }, [setOrders])

  return {
    getTotalCartPrice,
    fetchInitialData,
    handleAddToCart,
    confirmAddToCart,
    toggleTopping,
    removeFromCart,
    handleStartCheckout,
    handlePaymentMethodNext,
    handleCompleteOrder,
    printOrderBill: useCallback(() => {
      // Popup will be handled by OrderManagement component
      // No need to call API directly
    }, []),
    toggleOrderStatus,
  }
}
