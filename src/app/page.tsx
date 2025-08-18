"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { HeaderBar } from "@/components/shop/HeaderBar"
import { BottomNav } from "@/components/shop/BottomNav"
import { CustomizationSheet } from "@/components/shop/CustomizationSheet"
import { CartSheet } from "@/components/shop/CartSheet"
import { CheckoutSheet } from "@/components/shop/CheckoutSheet"
import { OrderManagement } from "@/components/shop/OrderManagement"
import { fetchApi, postApi, deleteApi, putApi } from "@/utils/Helper"
import MilkTeaList from "@/components/MilkTeaList"
import { MilkTea, Topping, CartItem, Order, SweetValue, IceValue, SizeValue } from "@/types/shop"

export default function FoxMilkTeaShop() {
  const [activeTab, setActiveTab] = useState<"order" | "manage">("order")
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [selectedMilkTea, setSelectedMilkTea] = useState<MilkTea | null>(null)

  // state cục bộ cho sheet
  const [sheetSweetness, setSheetSweetness] = useState<SweetValue>("4")
  const [sheetIce, setSheetIce] = useState<IceValue>("3")
  const [sheetSize, setSheetSize] = useState<SizeValue>("1")
  const [sheetNote, setSheetNote] = useState<string>("")
  const [sheetToppings, setSheetToppings] = useState<Topping[]>([])

  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [activeSheet, setActiveSheet] = useState<'none' | 'customization' | 'cart' | 'checkout'>('none')
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1)
  const [paymentMethod, setPaymentMethod] = useState<"" | "cash" | "transfer">("")
  const [cashAmount, setCashAmount] = useState<number>(0)
  const [cashError, setCashError] = useState<string>("")
  const [milkTeas, setMilkTeas] = useState<MilkTea[]>([])
  const [isLoadingMilkTeas, setIsLoadingMilkTeas] = useState<boolean>(false)
  const [toppings, setToppings] = useState<Topping[]>([])

  // discount state
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [discountLocked, setDiscountLocked] = useState<boolean>(false)

  // fetch data
  useEffect(() => {
    (async () => {
      try {
        setIsLoadingMilkTeas(true)
        const milkTeasRes = await fetchApi(`${process.env.API_URL}${process.env.PREFIX_API}products?fqnull=deleted_at&fq=is_active:1`)
        setMilkTeas(milkTeasRes?.status === 'success' && milkTeasRes?.data ? (milkTeasRes.data as MilkTea[]) : [])
        setIsLoadingMilkTeas(false)

        const toppingsRes = await fetchApi(`${process.env.API_URL}${process.env.PREFIX_API}toppings?fqnull=deleted_at&fq=is_active:1`)
        setToppings(toppingsRes?.status === 'success' && toppingsRes?.data ? (toppingsRes.data as Topping[]) : [])

        const cartRes = await fetchApi(`${process.env.API_URL}${process.env.PREFIX_API}cart_items?fqnull=deleted_at`)
        setCart(cartRes?.status === 'success' && cartRes?.data ? (cartRes.data as CartItem[]) : [])

        const ordersRes = await fetchApi(`${process.env.API_URL}${process.env.PREFIX_API}orders?fqnull=deleted_at`)
        setOrders(ordersRes?.status === 'success' && ordersRes?.data ? (ordersRes.data as Order[]) : [])
      } catch (e) {
        console.log(e)
      }
    })()
  }, [])

  const getQuantity = useCallback((id: number) => quantities[id] || 0, [quantities])

  const formatInputNumber = (value: string) => {
    const number = value.replace(/\D/g, '')
    return number ? parseInt(number, 10).toLocaleString('vi-VN') : ''
  }

  const updateQuantity = useCallback((id: number, newQuantity: number) => {
    if (newQuantity >= 0) setQuantities((prev) => ({ ...prev, [id]: newQuantity }))
  }, [])

  const formatPrice = (price: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)

  const formatDateTime = (date: Date) => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(date))

  const handleAddToCart = useCallback((milkTea: MilkTea) => {
    setSelectedMilkTea(milkTea)
    setSheetSweetness("4")
    setSheetIce("3")
    setSheetSize("1")
    setSheetNote("")
    setSheetToppings([])
    setActiveSheet('customization')
  }, [])

  const confirmAddToCart = useCallback(async (id: number) => {
    if (!selectedMilkTea) return
    const quantity = getQuantity(selectedMilkTea.id)

    const dataCart = {
      product_id: id,
      quantity,
      sweetness_id: sheetSweetness,
      ice_id: sheetIce,
      size_id: sheetSize,
      notes: sheetNote,
    }

    const addRes = await postApi(`${process.env.API_URL}${process.env.PREFIX_API}cart_items`, dataCart)
    if (addRes?.status === 'success') {
      const refreshed = await fetchApi(`${process.env.API_URL}${process.env.PREFIX_API}cart_items?fqnull=deleted_at`)
      if (refreshed?.status === 'success' && refreshed?.data) {
        setCart(refreshed.data as CartItem[])
        
        // Add toppings to cart item
        if(sheetToppings && sheetToppings.length > 0 ){
          const cartItemId = (refreshed?.data as CartItem[])[0]?.id
          if (cartItemId) {
            for (const topping of sheetToppings) {
              await postApi(`${process.env.API_URL}${process.env.PREFIX_API}cart_item_toppings`, {
                cart_item_id: cartItemId, 
                topping_id: topping.id
              })
            }
          }
        const refreshedCart = await fetchApi(`${process.env.API_URL}${process.env.PREFIX_API}cart_items?fqnull=deleted_at`)
        if (refreshedCart?.status === 'success' && refreshedCart?.data) {
          setCart(refreshedCart.data as CartItem[])
        }}

      }
      setActiveSheet('none')
      setSelectedMilkTea(null)
      setSheetSweetness("4"); 
      setSheetIce("3"); 
      setSheetSize("1");
      setSheetNote(""); 
      setSheetToppings([])
      setQuantities((prev) => (selectedMilkTea ? { ...prev, [selectedMilkTea.id]: 0 } : prev))
    } else {
      console.log('Error adding to cart:', addRes?.error)
    }
  }, [selectedMilkTea, getQuantity, sheetToppings, sheetSweetness, sheetIce, sheetSize, sheetNote])

  const toggleTopping = useCallback((t: Topping) => {
    setSheetToppings((prev) => (prev.some((x) => x.id === t.id) ? prev.filter((x) => x.id !== t.id) : [...prev, t]))
  }, [])
  
  const getTotalCartPrice = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => {
      const basePrice = item.product_price * item.quantity
      const toppingsPrice = item.toppings ? item.toppings.reduce((toppingSum, topping) => toppingSum + topping.price, 0) * item.quantity : 0
      const sizePrice = item.size_price * item.quantity
      return sum + basePrice + toppingsPrice + sizePrice
    }, 0)
    const discount = discountLocked ? discountAmount : 0
    const total = Math.max(subtotal - discount, 0)
    return total
  }, [cart, discountAmount, discountLocked])

  const removeFromCart = useCallback(async (itemId: number) => {
    const res = await deleteApi(`${process.env.API_URL}${process.env.PREFIX_API}cart_items/${itemId}`).then(() => ({ status: 'success' })).catch((e: unknown) => ({ error: e }))
    if ('status' in res && res.status === 'success') {
      const refreshed = await fetchApi(`${process.env.API_URL}${process.env.PREFIX_API}cart_items?fqnull=deleted_at`)
      if (refreshed?.status === 'success' && refreshed?.data) setCart(refreshed.data as CartItem[])
    } else {
      console.log('Error removing from cart', res)
    }
  }, [])

  const handleStartCheckout = useCallback(() => {
    setActiveSheet('checkout'); setCheckoutStep(1); setPaymentMethod("")
  }, [])

  const handlePaymentMethodNext = useCallback(() => { if (paymentMethod) setCheckoutStep(2) }, [paymentMethod])

  const handleCompleteOrder = useCallback(async () => {
    if (paymentMethod === "cash") {
      if (cashAmount === 0) { setCashError("Vui lòng nhập số tiền khách đưa"); return }
      if (cashAmount < getTotalCartPrice) { setCashError(`Số tiền không đủ. Còn thiếu ${formatPrice(getTotalCartPrice - cashAmount)}`); return }
    }
    setCashError("")

    const dataOrders = {
      payment_method_id: paymentMethod === "cash" ? 1 : 2,
      order_time: new Date(),
      total_amount: getTotalCartPrice,
      is_completed: 0,
      discount_amount: discountLocked ? discountAmount : 0,
    }
    const orderRes = await postApi(`${process.env.API_URL}${process.env.PREFIX_API}orders`, dataOrders)
    if (orderRes?.status === 'success') {
      await fetchApi(`${process.env.API_URL}${process.env.PREFIX_API}orders?fqnull=deleted_at`)
          .then((resp)=>{
              setOrders(resp.data as Order[])
              cart.map( async (item: CartItem) => {
                const order_item_data = {
                  order_id: (resp?.data as CartItem[])[0]?.id,
                  product_id: item.product_id,
                  size_id: item.size_id,
                  sweetness_id: item.sweetness_id,
                  ice_id: item.ice_id,
                  quantity: item.quantity,
                  unit_price: item.product_price,
                  notes: item.notes,
                  toppings: item?.toppings ?? []
                }
                await postApi(`${process.env.API_URL}${process.env.PREFIX_API}order_items`, order_item_data)
              })
          })
          .then(() => {
            cart.map(async(item) =>{
              await deleteApi(`${process.env.API_URL}${process.env.PREFIX_API}cart_items/${item.id}`)
            })
            setTimeout(async() => {
              const ordersRes = await fetchApi(`${process.env.API_URL}${process.env.PREFIX_API}orders?fqnull=deleted_at`)
              setOrders(ordersRes?.status === 'success' && ordersRes?.data ? (ordersRes.data as Order[]) : [])
            },200)
              setCart([]); setActiveSheet('none'); setCheckoutStep(1); setPaymentMethod(""); setCashAmount(0); setCashError("")
              setDiscountAmount(0); setDiscountLocked(false)
          })
    }
  }, [paymentMethod, cashAmount, getTotalCartPrice, cart, discountAmount, discountLocked])

  const toggleOrderStatus = useCallback(async (orderId: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId.id ? { ...o, is_completed: !o.is_completed } : o)))
    const res = await putApi(`${process.env.API_URL}${process.env.PREFIX_API}orders/${orderId.id}`, { is_completed: !orderId.is_completed })
    if (res?.error) {
      setOrders((prev) => prev.map((o) => (o.id === orderId.id ? { ...o, is_completed: orderId.is_completed } : o)))
    }
  }, [])

  const sortedOrders = useMemo(() => {
    const copy = [...orders]
    copy.sort((a, b) => (a.is_completed === b.is_completed ? new Date(a.order_time).getTime() - new Date(b.order_time).getTime() : a.is_completed ? 1 : -1))
    return copy
  }, [orders])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <HeaderBar activeTab={activeTab} cartCount={cart.length} onOpenCart={() => setActiveSheet('cart')} />

      {activeTab === "order" ? (
        <MilkTeaList
          milkTeas={milkTeas}
          isLoading={isLoadingMilkTeas}
          getQuantity={getQuantity}
          updateQuantity={updateQuantity}
          handleAddToCart={handleAddToCart}
          formatPrice={formatPrice}
        />
      ) : (
        <OrderManagement
          orders={sortedOrders}
          formatPrice={formatPrice}
          formatDateTime={formatDateTime}
          onToggleStatus={toggleOrderStatus}
          onBackToOrder={() => setActiveTab("order")}
        />
      )

      }

      <BottomNav
        activeTab={activeTab}
        pendingOrders={orders.filter((o) => !o.is_completed).length}
        onChangeTab={setActiveTab}
      />

      {/* overlay */}
      {activeSheet !== 'none' && (
        <div className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300" onClick={() => setActiveSheet('none')} />
      )

      }

      <CustomizationSheet
        open={activeSheet === 'customization'}
        milkTea={selectedMilkTea}
        toppings={toppings}
        quantity={selectedMilkTea ? getQuantity(selectedMilkTea.id) : 0}
        sheetSweetness={sheetSweetness}
        sheetIce={sheetIce}
        sheetSize={sheetSize}
        sheetNote={sheetNote}
        sheetToppings={sheetToppings}
        formatPrice={formatPrice}
        onClose={() => setActiveSheet('none')}
        onSweetChange={setSheetSweetness}
        onIceChange={setSheetIce}
        onSizeChange={setSheetSize}
        onNoteChange={setSheetNote}
        onToggleTopping={toggleTopping}
        onConfirm={confirmAddToCart}
      />

      <CartSheet
        open={activeSheet === 'cart'}
        cart={cart}
        formatPrice={formatPrice}
        total={getTotalCartPrice}
        onClose={() => setActiveSheet('none')}
        onRemove={removeFromCart}
        onCheckout={handleStartCheckout}
        discountAmount={discountAmount}
        discountLocked={discountLocked}
        onChangeDiscount={(n: number) => setDiscountAmount(n)}
        onApplyDiscount={() => setDiscountLocked(true)}
        onClearDiscount={() => { setDiscountAmount(0); setDiscountLocked(false) }}
      />

      <CheckoutSheet
        open={activeSheet === 'checkout'}
        step={checkoutStep}
        paymentMethod={paymentMethod}
        cart={cart}
        total={getTotalCartPrice}
        cashAmount={cashAmount}
        cashError={cashError}
        formatPrice={formatPrice}
        onClose={() => { setActiveSheet('cart'); setCashAmount(0) }}
        onNext={handlePaymentMethodNext}
        onConfirm={handleCompleteOrder}
        onPaymentChange={setPaymentMethod}
        onCashChange={setCashAmount}
        formatInputNumber={formatInputNumber}
      />
    </div>
  )
}
