"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import {
  ShoppingCart,
  ArrowLeft,
  Clock,
  CheckCircle,
  Circle,
  Coffee,
  ClipboardList,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { fetchApi, postApi, deleteApi, extractValuesByKey, putMultipleApi, putApi } from "@/utils/Helper"
import { TagInput } from "@/components/ui/tagInput"
import MilkTeaList from "@/components/MilkTeaList"

interface MilkTea {
  documentId: string
  id: number
  name: string
  price: number
  description: string
  image: { url: string }
  rating: number
}

interface Topping {
  documentId: string
  id: number
  name: string
  price: number
}

interface CartItem {
  documentId?: string
  id: number
  milkTea: MilkTea
  quantity: number
  toppings: Topping[]
  sweetness: string
  ice: string
  note: string
  totalPrice: number
  status: boolean
}

interface Order {
  documentId?: string
  id: number
  items: CartItem[]
  totalPrice: number
  paymentMethod: string
  orderTime: Date
  isCompleted: boolean
}

interface Voucher {
  name: string
  value: number
  type: string
}

const sweetnessLevels = [
  { value: "50", label: "50%" },
  { value: "70", label: "70%" },
  { value: "100", label: "100%" },
]

const iceLevels = [
  { value: "no-ice", label: "Không đá" },
  { value: "less-ice", label: "Có đá" },
  { value: "normal-ice", label: "Đá riêng" },
]

export default function FoxMilkTeaShop() {
  const [activeTab, setActiveTab] = useState<"order" | "manage">("order")
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({})
  const [selectedMilkTea, setSelectedMilkTea] = useState<MilkTea | null>(null)
  const [selectedToppings, setSelectedToppings] = useState<{ [key: number]: Topping[] }>({})
  const [selectedSweetness, setSelectedSweetness] = useState<{ [key: number]: string }>({})
  const [selectedIce, setSelectedIce] = useState<{ [key: number]: string }>({})
  const [selectedNote, setSelectedNote] = useState<{ [key: number]: string }>({})
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [activeSheet, setActiveSheet] = useState<'none' | 'customization' | 'cart' | 'checkout'>('none')
  const [checkoutStep, setCheckoutStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [cashAmount, setCashAmount] = useState<number>(0)
  const [cashError, setCashError] = useState<string>("")
  const [milkTeas, setMilkTeas] = useState<MilkTea[]>([])
  const [isLoadingMilkTeas, setIsLoadingMilkTeas] = useState<boolean>(false)
  const [toppings, setToppings] = useState<Topping[]>([])
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [selectedVouchers, setSelectedVouchers] = useState<Voucher | null>(null)
  // const [orderCompleted, setOrderCompleted] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load milk teas first
        setIsLoadingMilkTeas(true)
        const milkTeasRes = await fetchApi(`${process.env.API_URL}${process.env.PREFIX_API}milk-tea-and-coffees?populate=image`)
          .then(resp => resp?.data ?? [])
          .catch(e => console.log(e))
        setMilkTeas(milkTeasRes as MilkTea[])
        setIsLoadingMilkTeas(false)

        // Load toppings second
        const toppingsRes = await fetchApi(`${process.env.API_URL}${process.env.PREFIX_API}toppings`)
          .then(resp => resp?.data ?? [])
          .catch(e => console.log(e))
        setToppings(toppingsRes as Topping[])

        // Load cart items third
        const cartRes = await fetchApi(`${process.env.API_URL}${process.env.PREFIX_API}cart-items?populate=*&filters[isOrdered]=false`)
          .then(resp => resp?.data ?? [])
          .catch(e => console.log(e))
        setCart(cartRes as CartItem[])

        // Load orders fourth
        const ordersRes = await fetchApi(`${process.env.API_URL}${process.env.PREFIX_API}orders?populate[items][populate]=*`)
          .then(resp => resp?.data ?? [])
          .catch(e => console.log(e))
        setOrders(ordersRes as Order[])

        // Load vouchers last
        const voucherRes = await fetchApi(`${process.env.API_URL}${process.env.PREFIX_API}vouchers`)
          .then(resp => resp?.data ?? [])
          .catch(e => console.log(e))
        
        if (Array.isArray(voucherRes)) {
          setVouchers(voucherRes.map((voucher) => ({
            id: voucher.id,
            name: voucher.name,
            value: voucher.value,
            type: voucher.type
          })) as Voucher[])
        }
      } catch (err) {
        console.log(err)
      }
    }
    fetchData()
  }, [])

  const getQuantity = useCallback((id: number) => quantities[id] || 0, [quantities])

  const formatInputNumber = (value: string) => {
    // Remove all non-digit characters
    const number = value.replace(/\D/g, '')
    // Convert to number and format with thousand separators
    return number ? parseInt(number, 10).toLocaleString('vi-VN') : ''
  }

  const handleCashInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Remove thousand separators and convert to number
    const number = parseInt(value.replace(/\./g, ''), 10)
    if (!isNaN(number) && number >= 0) {
      setCashAmount(number)
    }
  }

  const updateQuantity = useCallback((id: number, newQuantity: number) => {
    if (newQuantity >= 0) {
      setQuantities((prev) => ({ ...prev, [id]: newQuantity }))
    }
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const handleAddToCart = useCallback((milkTea: MilkTea) => {
    setSelectedMilkTea(milkTea)
    // Initialize default values for this milk tea if not already set
    setSelectedSweetness(prev => ({
      ...prev,
      [milkTea.id]: prev[milkTea.id] || "50"
    }))
    setSelectedIce(prev => ({
      ...prev,
      [milkTea.id]: prev[milkTea.id] || "normal-ice"
    }))
    setSelectedNote(prev => ({
      ...prev,
      [milkTea.id]: prev[milkTea.id] || ""
    }))
    setActiveSheet('customization')
  }, [])

  const calcPrice = (price: number, value: number, type: string) => {
      switch (type){
        case "thousand":
          price = price - value          
          break;
        default:
          price = price - (price * (value / 100))
      }
    return price;
  }

  const confirmAddToCart = async () => {
    if (!selectedMilkTea) return
    const quantity = getQuantity(selectedMilkTea.id)
    const currentToppings = selectedToppings[selectedMilkTea.id] || []
    const toppingsPrice = currentToppings.reduce((sum, topping) => sum + topping.price, 0)
    let totalPrice = (selectedMilkTea.price + toppingsPrice) * quantity
    if(selectedVouchers){
      totalPrice = calcPrice(totalPrice, selectedVouchers.value, selectedVouchers.type)
    }
    const dataCart = {
      milkTea: {
        connect: [{ documentId: selectedMilkTea.documentId }],
      },
      toppings: {
        connect: currentToppings.map((t) => ({ documentId: t.documentId })),
      },
      quantity,
      sweetness: sweetnessLevels.find((s) => s.value === selectedSweetness[selectedMilkTea.id])?.label || "",
      ice: iceLevels.find((i) => i.value === selectedIce[selectedMilkTea.id])?.label || "",
      note: selectedNote[selectedMilkTea.id] || "",
      totalPrice,
    };

    for (const key in dataCart) {
      const value = (dataCart as Record<string, unknown>)[key];
      if (
        value &&
        typeof value === "object" &&
        value !== null &&
        "connect" in value &&
        Array.isArray((value as { connect: unknown[] }).connect) &&
        (value as { connect: unknown[] }).connect.length === 0
      ) {
        delete (dataCart as Record<string, unknown>)[key];
      }
    }

    await postApi(`${process.env.API_URL}${process.env.PREFIX_API}cart-items`, {data: dataCart}).then(async () => 
    {
      const responseCartItems = await fetchApi(`${process.env.API_URL}${process.env.PREFIX_API}cart-items?populate=*&filters[isOrdered]=false`).then(resp => resp?.data ?? []).catch(e => console.log(e))
      setCart(responseCartItems as CartItem[])

      setActiveSheet('none')
      setSelectedMilkTea(null)
    }
    ).catch(err => console.log(err));

    // Reset quantity về 0
    if (selectedMilkTea) {
      setQuantities((prev) => ({ ...prev, [selectedMilkTea.id]: 0 }))
    }
  }

  const toggleTopping = useCallback((topping: Topping) => {
    if (!selectedMilkTea) return
    setSelectedToppings((prev) => {
      const currentToppings = prev[selectedMilkTea.id] || []
      const toppingExists = currentToppings.find((t) => t.id === topping.id)
      if (toppingExists) {
        return {
          ...prev,
          [selectedMilkTea.id]: currentToppings.filter((t) => t.id !== topping.id)
        }
      } else {
        return {
          ...prev,
          [selectedMilkTea.id]: [...currentToppings, topping]
        }
      }
    })
  }, [selectedMilkTea])

  const getTotalCartPrice = useMemo(() => cart.reduce((sum, item) => sum + item.totalPrice, 0), [cart])

  const removeFromCart = async (itemId: string) => {
    // setCart((prev) => prev.filter((item) => item.id !== itemId))
    await deleteApi(`${process.env.API_URL}${process.env.PREFIX_API}cart-items/${itemId}`).then(async () => 
      {
        const responseCartItems = await fetchApi(`${process.env.API_URL}${process.env.PREFIX_API}cart-items?populate=*&filters[isOrdered]=false`).then(resp => resp?.data ?? []).catch(e => console.log(e))
        setCart(responseCartItems as CartItem[])
      }
      ).catch(err => console.log(err));
  }

  const handleStartCheckout = () => {
    setActiveSheet('checkout')
    setCheckoutStep(1)
    setPaymentMethod("")
    // setOrderCompleted(false)
  }

  const handlePaymentMethodNext = () => {
    if (paymentMethod) {
      setCheckoutStep(2)
    }
  }

  const handleCompleteOrder = async () => {
    if (paymentMethod === "cash") {
      if (cashAmount === 0) {
        setCashError("Vui lòng nhập số tiền khách đưa")
        return
      }
      if (cashAmount < getTotalCartPrice) {
        setCashError(`Số tiền không đủ. Còn thiếu ${formatPrice(getTotalCartPrice - cashAmount)}`)
        return
      }
    }
    setCashError("")

    // Tạo đơn hàng mới
    const dataOrders = {
      items: {
        connect: cart.map((t) => ({ documentId: t.documentId })),
      },
      totalPrice: getTotalCartPrice,
      paymentMethod: paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản",
      orderTime: new Date(),
      isCompleted: false,
    };
    await postApi(`${process.env.API_URL}${process.env.PREFIX_API}orders`,  {data: dataOrders})
      .then( async () => {
        const response = await fetchApi(`${process.env.API_URL}${process.env.PREFIX_API}orders?populate[items][populate]=*`).then(resp => resp?.data ?? []).catch(e => console.log(e))
        setOrders(response as Order[])
      })

    // Reset cart sau 200 ms
    setTimeout(async() => {
      await putMultipleApi(`${process.env.API_URL}${process.env.PREFIX_API}put-cart_items`, {documentIds: extractValuesByKey(cart, "documentId") as string[]}).then(async () => 
        {
          setCart([])
          setActiveSheet('none')
          setCheckoutStep(1)
          setPaymentMethod("")
          setCashAmount(0)
          setCashError("")
        }
        ).catch(err => console.log(err));
      // setOrderCompleted(false)
    }, 200)
  }

  const toggleOrderStatus = async (orderId: Order) => {
    setOrders((prev) =>
      prev.map((order) => (order.documentId === orderId.documentId ? { ...order, isCompleted: !order.isCompleted } : order)),
    )

    await putApi(`${process.env.API_URL}${process.env.PREFIX_API}orders/${orderId.documentId}`,{
      data: {isCompleted: !orderId.isCompleted}
    })
  }

  const handleTagsChange = (updatedTags: { name: string; value?: number; type?: string }[]) => {
    setSelectedVouchers(
      updatedTags.length > 0
        ? {
            name: updatedTags[0].name,
            value: updatedTags[0].value ?? 0,
            type: updatedTags[0].type ?? ""
          }
        : null
    );
  };

  // Sắp xếp đơn hàng: inactive trước, sau đó theo thời gian cũ nhất
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1
      }
      const aTime = new Date(a.orderTime).getTime();
      const bTime = new Date(b.orderTime).getTime();
      return aTime - bTime
    })
  }, [orders])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center">
              <img
                src={"/images/logo/logo3.png"}
                alt={""}
                className="w-16 h-16 object-contain rounded-lg"
              />
            </div>
            <div>
              <h1 className="font-bold text-lg">Lá và Sương</h1>
              <p className="text-xs opacity-90">Cà phê - Trà sữa - Trà trái cây</p>
            </div>
          </div>
          {activeTab === "order" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 relative"
              onClick={() => setActiveSheet('cart')}
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-amber-400 text-green-800 text-xs px-1.5 py-0.5">
                  {cart.length}
                </Badge>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "order" ? (
        /* Product Grid */
        <MilkTeaList
          milkTeas={milkTeas}
          isLoading={isLoadingMilkTeas}
          getQuantity={getQuantity}
          updateQuantity={updateQuantity}
          handleAddToCart={handleAddToCart}
          formatPrice={formatPrice}
        />
      ) : (
        /* Order Management */
        <div className="p-4 max-w-md mx-auto pb-24">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌿</div>
              <p className="text-gray-500 text-lg mb-2">Chưa có đơn hàng nào</p>
              <p className="text-sm text-gray-400">Hãy thưởng thức hương vị tự nhiên của Lá và Sương!</p>
              <Button
                onClick={() => setActiveTab("order")}
                className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600"
              >
                Đặt trà sữa ngay
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedOrders.map((order) => (
                <Card
                  key={order.id}
                  className={`border-2 ${order.isCompleted ? "border-green-200 bg-green-50" : "border-green-200"}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800">Đơn hàng #{order.id.toString().slice(-6)}</h3>
                          <Badge
                            className={
                              order.isCompleted ? "bg-green-100 text-green-800" : "bg-green-100 text-green-800"
                            }
                          >
                            {order.isCompleted ? "Hoàn thành" : "Đang xử lý"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{formatDateTime(order.orderTime)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Thanh toán: {order.paymentMethod}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => order.documentId && toggleOrderStatus(order)}
                        className={`h-8 w-8 p-0 ${order.isCompleted ? "text-green-600 hover:bg-green-100" : "text-green-600 hover:bg-green-100"}`}
                      >
                        {order.isCompleted ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                      </Button>
                    </div>

                    <div className="space-y-2 mb-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {item.milkTea.name} x{item.quantity}
                            </span>
                            <span className="text-green-600">{formatPrice(item.totalPrice)}</span>
                          </div>
                          <div className="text-xs text-gray-500 ml-2">
                            {item.sweetness} • {item.ice}
                            {item.toppings.length > 0 && ` • ${item.toppings.map((t) => t.name).join(", ")}`}
                            {item.note && <div className="text-green-600 mt-1">Ghi chú: {item.note}</div>}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-3" />

                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Tổng cộng:</span>
                      <span className="font-bold text-xl text-green-600">{formatPrice(order.totalPrice)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 shadow-lg">
        <div className="max-w-md mx-auto">
          <div className="flex">
            <button
              onClick={() => setActiveTab("order")}
              className={`flex-1 py-3 px-4 flex flex-col items-center gap-1 transition-colors ${
                activeTab === "order"
                  ? "text-green-600 bg-green-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Coffee className="w-5 h-5" />
              <span className="text-xs font-medium">Đặt hàng</span>
            </button>
            <button
              onClick={() => setActiveTab("manage")}
              className={`flex-1 py-3 px-4 flex flex-col items-center gap-1 transition-colors relative ${
                activeTab === "manage"
                  ? "text-green-600 bg-green-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ClipboardList className="w-5 h-5" />
              <span className="text-xs font-medium">Quản lý</span>
              {orders.filter((order) => !order.isCompleted).length > 0 && (
                <Badge className="absolute top-1 right-3 bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
                  {orders.filter((order) => !order.isCompleted).length}
                </Badge>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Sheet Overlay */}
      {activeSheet !== 'none' && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
          onClick={() => setActiveSheet('none')}
        />
      )}

      {/* Customization Bottom Sheet */}
      {activeSheet === 'customization' && (
        <div
          className={`fixed top-0 bottom-0 left-0 right-0 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
            activeSheet === 'customization' ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="max-w-md mx-auto h-full flex flex-col">
            {/* Header */}
            <div className="px-4 pb-4 pt-4 border-b border-gray-100">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 mr-3"
                  onClick={() => setActiveSheet('none')}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-lg font-bold text-green-600 flex items-center gap-2 flex-1 justify-center">
                  <span>🌿</span>
                  Tùy chỉnh đồ uống
                </h2>
                <div className="w-8"></div> {/* Spacer for centering */}
              </div>
            </div>

            {selectedMilkTea && (
              <>
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto ">
                  <div className="p-4 space-y-4">
                    <div className="text-center bg-green-50 p-3 rounded-lg">
                      <h3 className="font-semibold text-gray-800">{selectedMilkTea.name}</h3>
                      <p className="text-sm text-gray-600">Số lượng: {getQuantity(selectedMilkTea.id)}</p>
                    </div>

                    {/* Toppings */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Chọn topping</Label>
                      <div className="grid gap-2 mt-2">
                        {toppings.map((topping) => (
                          <div key={topping.id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50">
                            <Checkbox
                              id={`topping-${topping.id}`}
                              checked={(selectedToppings[selectedMilkTea?.id || 0] || []).some((t) => t.id === topping.id)}
                              onCheckedChange={() => toggleTopping(topping)}
                            />
                            <Label
                              htmlFor={`topping-${topping.id}`}
                              className="flex-1 text-sm cursor-pointer flex justify-between"
                            >
                              <span>{topping.name}</span>
                              <span className="text-green-600 font-medium">+{formatPrice(topping.price)}</span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Sweetness */}
                    <div>
                                              <Label className="text-sm font-semibold text-gray-700">Độ ngọt</Label>
                        <RadioGroup 
                          value={selectedSweetness[selectedMilkTea?.id || 0] || "50"} 
                          onValueChange={(value) => setSelectedSweetness({...selectedSweetness, [selectedMilkTea?.id || 0]: value})} 
                          className="mt-2"
                        >
                          {sweetnessLevels.map((level) => (
                            <div key={level.value} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50">
                              <RadioGroupItem value={level.value} id={`sweet-${level.value}`} />
                              <Label htmlFor={`sweet-${level.value}`} className="text-sm cursor-pointer">
                                {level.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                    </div>

                    <Separator />

                    {/* Ice */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Lượng đá</Label>
                      <RadioGroup 
                        value={selectedIce[selectedMilkTea?.id || 0] || "normal-ice"} 
                        onValueChange={(value) => setSelectedIce({...selectedIce, [selectedMilkTea?.id || 0]: value})} 
                        className="mt-2"
                      >
                        {iceLevels.map((level) => (
                          <div key={level.value} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50">
                            <RadioGroupItem value={level.value} id={`ice-${level.value}`} />
                            <Label htmlFor={`ice-${level.value}`} className="text-sm cursor-pointer">
                              {level.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <Separator />

                    {/* Note */}
                    <div>
                                              <Label className="text-sm font-semibold text-gray-700">Ghi chú cho ly trà sữa</Label>
                        <textarea
                          value={selectedNote[selectedMilkTea?.id || 0] || ""}
                          onChange={(e) => setSelectedNote({...selectedNote, [selectedMilkTea?.id || 0]: e.target.value})}
                          placeholder="Ví dụ: Ít đường hơn, nhiều đá, không topping, thêm lá bạc hà..."
                          className="w-full mt-2 p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          rows={3}
                          maxLength={200}
                        />
                        <div className="text-xs text-gray-400 mt-1 text-right">{(selectedNote[selectedMilkTea?.id || 0] || "").length}/200 ký tự</div>
                    </div>
                    {/* Voucher */}
                    <div>
                                              <Label className="text-sm font-semibold text-gray-700">Mã giảm giá</Label>
                      <TagInput initialTags={vouchers}
                        onTagsChange={handleTagsChange} />
                    </div>
                  </div>
                </div>

                {/* Fixed Bottom Section */}
                <div className="border-t border-gray-100 bg-white">
                  {/* Price Summary */}
                  <div className="p-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                                              <div className="flex justify-between text-sm mb-1">
                          <span>Giá gốc:</span>
                          <span>{formatPrice(selectedMilkTea.price * getQuantity(selectedMilkTea.id))}</span>
                        </div>
                        {(selectedToppings[selectedMilkTea?.id || 0] || []).length > 0 && (
                          <div className="flex justify-between text-sm mb-1">
                            <span>Topping:</span>
                            <span>
                              +
                              {formatPrice(
                                (selectedToppings[selectedMilkTea?.id || 0] || []).reduce((sum, t) => sum + t.price, 0) * getQuantity(selectedMilkTea.id),
                              )}
                            </span>
                          </div>
                        )}
                        <Separator className="my-2" />
                        <div className="flex justify-between font-semibold text-green-600">
                          <span>Tổng cộng:</span>
                          <span>
                            {formatPrice(
                                selectedVouchers 
                                ? 
                                  calcPrice((selectedMilkTea.price + (selectedToppings[selectedMilkTea?.id || 0] || []).reduce((sum, t) => sum + t.price, 0)) *
                                  getQuantity(selectedMilkTea.id), selectedVouchers.value, selectedVouchers.type) 
                                :
                                  (selectedMilkTea.price + (selectedToppings[selectedMilkTea?.id || 0] || []).reduce((sum, t) => sum + t.price, 0)) *
                                  getQuantity(selectedMilkTea.id)
                              ,
                            )}
                          </span>
                        </div>
                    </div>

                    <Button
                      onClick={confirmAddToCart}
                      className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12 text-base font-semibold"
                    >
                      Thêm vào giỏ hàng
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Cart Bottom Sheet */}
      {activeSheet === 'cart' && (
        <div
          className={`fixed top-0 bottom-0 left-0 right-0 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
            activeSheet === 'cart' ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="max-w-md mx-auto h-full flex flex-col">
            {/* Header */}
            <div className="px-4 pb-4 pt-4 border-b border-gray-100">
              <div className="flex items-center">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mr-3" onClick={() => setActiveSheet('none')}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-lg font-bold text-green-600 flex items-center gap-2 flex-1 justify-center">
                  <ShoppingCart className="w-5 h-5" />
                  Giỏ hàng của bạn
                </h2>
                <div className="w-8"></div> {/* Spacer for centering */}
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🌿</div>
                  <p className="text-gray-500 text-lg mb-2">Giỏ hàng trống</p>
                  <p className="text-sm text-gray-400">Hãy chọn món yêu thích từ Lá và Sương!</p>
                </div>
              </div>
            ) : (
              <>
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto ">
                  <div className="p-4 space-y-4">
                    {cart.map((item) => (
                      <Card key={item.id} className="border-green-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-base">{item.milkTea.name}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                              onClick={() => removeFromCart(item.documentId as string)}
                            >
                              X
                            </Button>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1 mb-3">
                            <p>Số lượng: {item.quantity}</p>
                            <p>Độ ngọt: {item.sweetness}</p>
                            <p>Lượng đá: {item.ice}</p>
                            {item.toppings.length > 0 && <p>Topping: {item.toppings.map((t) => t.name).join(", ")}</p>}
                            {item.note && <p className="text-green-600 font-medium">Ghi chú: {item.note}</p>}
                          </div>
                          <div className="flex justify-end">
                            <span className="font-bold text-lg text-green-600">{formatPrice(item.totalPrice)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Fixed Bottom Section */}
                <div className="border-t border-gray-100 bg-white">
                  <div className="p-4">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-xl">Tổng cộng:</span>
                        <span className="font-bold text-2xl text-green-600">{formatPrice(getTotalCartPrice)}</span>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12 text-base font-semibold"
                        onClick={handleStartCheckout}
                      >
                        Đặt hàng ngay
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout Bottom Sheet */}
      {activeSheet === 'checkout' && (
        <div
          className={`fixed top-0 bottom-0 left-0 right-0 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
            activeSheet === 'checkout' ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="max-w-md mx-auto h-full flex flex-col">
            {/* Header */}
            <div className="px-4 pb-4 pt-4 border-b border-gray-100">
              <div className="flex items-center">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mr-3" onClick={() => {setActiveSheet('none'); setCashAmount(0)}}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-lg font-bold text-green-600 flex items-center gap-2 flex-1 justify-center">
                  {/* <span>🦊</span> */}
                  {checkoutStep === 1
                    ? "Chọn thanh toán"
                    : paymentMethod === "cash"
                      ? "Thanh toán tiền mặt"
                      : "Chuyển khoản"}
                </h2>
                <div className="w-8"></div> {/* Spacer for centering */}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto ">
              <div className="p-4">
                {checkoutStep === 1 && (
                  <div className="space-y-4">
                    {/* Order Summary */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Tóm tắt đơn hàng</h3>
                      <div className="space-y-1 text-sm">
                        {cart.map((item) => (
                          <div
                            key={item.id}
                            className="border-b border-green-100 pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0"
                          >
                            <div className="flex justify-between">
                              <span>
                                {item.milkTea.name} x{item.quantity}
                              </span>
                              <span>{formatPrice(item.totalPrice)}</span>
                            </div>
                            {item.note && <div className="text-xs text-green-600 mt-1">Ghi chú: {item.note}</div>}
                          </div>
                        ))}
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-bold text-green-600">
                        <span>Tổng cộng:</span>
                        <span>{formatPrice(getTotalCartPrice)}</span>
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                        Chọn phương thức thanh toán
                      </Label>
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                        <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <RadioGroupItem value="cash" id="cash" />
                          <Label htmlFor="cash" className="flex-1 cursor-pointer flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">💵</div>
                            <div>
                              <div className="font-medium">Tiền mặt</div>
                              <div className="text-sm text-gray-500">Thanh toán khi nhận hàng</div>
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <RadioGroupItem value="transfer" id="transfer" />
                          <Label htmlFor="transfer" className="flex-1 cursor-pointer flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">🏦</div>
                            <div>
                              <div className="font-medium">Chuyển khoản</div>
                              <div className="text-sm text-gray-500">Thanh toán qua QR code</div>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                )}

                {checkoutStep === 2 && paymentMethod === "cash" && (
                  <div className="text-center py-8 space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nhập số tiền khách đưa</label>
                      <input 
                        id="cash-input" 
                        type="text" 
                        className={`w-full h-12 border ${cashError ? 'border-red-500' : 'border-gray-200'} rounded-lg p-2`} 
                        placeholder="Nhập số tiền khách đưa"
                        value={formatInputNumber(cashAmount.toString())}
                        onChange={handleCashInputChange}
                        min="0"
                      />
                      {cashError && (
                        <p className="text-red-500 text-sm mt-1">{cashError}</p>
                      )}
                      <div className="flex justify-center mt-4 mb-4">
                        <p className="text-sm text-gray-500">
                          {cashAmount > getTotalCartPrice ? (
                            <>Tiền thối: <span className="text-green-600 font-medium">{formatPrice(cashAmount - getTotalCartPrice)}</span></>
                          ) : cashAmount > 0 ? (
                            <>Còn thiếu: <span className="text-red-600 font-medium">{formatPrice(getTotalCartPrice - cashAmount)}</span></>
                          ) : (
                            <>Tiền thối: {formatPrice(0)}</>
                          )}
                        </p>
                      </div>
                      <p className="text-gray-600">Đơn hàng của bạn đã được xác nhận</p>
                      <p className="text-sm text-gray-500 mt-2">Tổng tiền: {formatPrice(getTotalCartPrice)}</p>
                      <p className="text-sm text-gray-500">Thanh toán khi nhận hàng</p>
                    </div>
                  </div>
                )}

                {checkoutStep === 2 && paymentMethod === "transfer" && (
                  <div className="text-center py-4 space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">Quét mã QR để thanh toán</h3>
                      <p className="text-sm text-gray-600">
                        Số tiền cần chuyển:{" "}
                        <span className="font-bold text-green-600">{formatPrice(getTotalCartPrice)}</span>
                      </p>
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center">
                      <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                            <Image alt="" src={`https://img.vietqr.io/image/VCB-9931782220-qr_only.png?amount=${getTotalCartPrice}`} width={600} height={776} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg text-left">
                      <h4 className="font-semibold text-blue-800 mb-2">Thông tin chuyển khoản:</h4>
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-medium">Ngân hàng:</span> Vietcombank
                        </p>
                        <p>
                          <span className="font-medium">Số tài khoản:</span> 1234567890
                        </p>
                        <p>
                          <span className="font-medium">Chủ tài khoản:</span> Lá và Sương
                        </p>
                        <p>
                          <span className="font-medium">Số tiền:</span>{" "}
                          <span className="font-bold text-green-600">{formatPrice(getTotalCartPrice)}</span>
                        </p>
                        {/* <p>
                          <span className="font-medium">Nội dung:</span> Lá và Sương Order #{Date.now().toString().slice(-6)}
                        </p> */}
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      <p>Sau khi chuyển khoản thành công,</p>
                      <p>vui lòng nhấn &quot;Xác nhận hoàn tất&quot; bên dưới</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Bottom Section */}
            {checkoutStep === 1 && (
              <div className="border-t border-gray-100 bg-white">
                <div className="p-4">
                  <Button
                    onClick={handlePaymentMethodNext}
                    disabled={!paymentMethod}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12 text-base font-semibold disabled:opacity-50"
                  >
                    Tiếp theo
                  </Button>
                </div>
              </div>
            )}

            {checkoutStep === 2 && (
              <div className="border-t border-gray-100 bg-white">
                <div className="p-4">
                  <Button
                    onClick={handleCompleteOrder}
                    className={`w-full h-12 text-base font-semibold ${
                      paymentMethod === "cash"
                        ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    }`}
                  >
                    Xác nhận hoàn tất
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
