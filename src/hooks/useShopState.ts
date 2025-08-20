import { useState, useCallback } from "react"
import { MilkTea, Topping, CartItem, Order, SweetValue, IceValue, SizeValue } from "@/types/shop"

export const useShopState = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<"order" | "manage">("order")
  
  // Quantities state
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  
  // Selected milk tea state
  const [selectedMilkTea, setSelectedMilkTea] = useState<MilkTea | null>(null)
  
  // Sheet customization state
  const [sheetSweetness, setSheetSweetness] = useState<SweetValue>("4")
  const [sheetIce, setSheetIce] = useState<IceValue>("3")
  const [sheetSize, setSheetSize] = useState<SizeValue>("1")
  const [sheetNote, setSheetNote] = useState<string>("")
  const [sheetToppings, setSheetToppings] = useState<Topping[]>([])
  
  // Cart and orders state
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  
  // Sheet visibility state
  const [activeSheet, setActiveSheet] = useState<'none' | 'customization' | 'cart' | 'checkout'>('none')
  
  // Checkout state
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1)
  const [paymentMethod, setPaymentMethod] = useState<"" | "cash" | "transfer">("")
  const [cashAmount, setCashAmount] = useState<number>(0)
  const [cashError, setCashError] = useState<string>("")
  
  // Data state
  const [milkTeas, setMilkTeas] = useState<MilkTea[]>([])
  const [isLoadingMilkTeas, setIsLoadingMilkTeas] = useState<boolean>(false)
  const [toppings, setToppings] = useState<Topping[]>([])
  
  // Discount state
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [discountLocked, setDiscountLocked] = useState<boolean>(false)

  // Reset sheet state
  const resetSheetState = useCallback(() => {
    setSheetSweetness("4")
    setSheetIce("3")
    setSheetSize("1")
    setSheetNote("")
    setSheetToppings([])
    setSelectedMilkTea(null)
  }, [])

  // Reset checkout state
  const resetCheckoutState = useCallback(() => {
    setCheckoutStep(1)
    setPaymentMethod("")
    setCashAmount(0)
    setCashError("")
    setDiscountAmount(0)
    setDiscountLocked(false)
  }, [])

  return {
    // Tab state
    activeTab,
    setActiveTab,
    
    // Quantities state
    quantities,
    setQuantities,
    
    // Selected milk tea state
    selectedMilkTea,
    setSelectedMilkTea,
    
    // Sheet customization state
    sheetSweetness,
    setSheetSweetness,
    sheetIce,
    setSheetIce,
    sheetSize,
    setSheetSize,
    sheetNote,
    setSheetNote,
    sheetToppings,
    setSheetToppings,
    
    // Cart and orders state
    cart,
    setCart,
    orders,
    setOrders,
    
    // Sheet visibility state
    activeSheet,
    setActiveSheet,
    
    // Checkout state
    checkoutStep,
    setCheckoutStep,
    paymentMethod,
    setPaymentMethod,
    cashAmount,
    setCashAmount,
    cashError,
    setCashError,
    
    // Data state
    milkTeas,
    setMilkTeas,
    isLoadingMilkTeas,
    setIsLoadingMilkTeas,
    toppings,
    setToppings,
    
    // Discount state
    discountAmount,
    setDiscountAmount,
    discountLocked,
    setDiscountLocked,
    
    // Utility functions
    resetSheetState,
    resetCheckoutState,
  }
}

