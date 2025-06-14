"use client"

import { useState } from "react"
import {
  Plus,
  Minus,
  ShoppingCart,
  Star,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

interface MilkTea {
  id: number
  name: string
  price: number
  description: string
  image: string
  rating: number
}

interface Topping {
  id: number
  name: string
  price: number
}

interface CartItem {
  id: number
  milkTea: MilkTea
  quantity: number
  toppings: Topping[]
  sweetness: string
  ice: string
  note: string
  totalPrice: number
}

interface Order {
  id: number
  items: CartItem[]
  totalPrice: number
  paymentMethod: string
  orderTime: Date
  isCompleted: boolean
}

const milkTeas: MilkTea[] = [
  {
    id: 1,
    name: "Fox's Classic Milk Tea",
    price: 45000,
    description: "Trà sữa truyền thống với hương vị đậm đà, được pha chế theo công thức bí mật của Fox",
    image: "/images/logo/logo1.png?height=200&width=200",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Taro Fox Delight",
    price: 50000,
    description: "Trà sữa khoai môn thơm ngon với topping trân châu đen đặc biệt",
    image: "/images/logo/logo1.png?height=200&width=200",
    rating: 4.9,
  },
  {
    id: 3,
    name: "Brown Sugar Fox",
    price: 55000,
    description: "Trà sữa đường nâu tiger với lớp kem cheese béo ngậy trên mặt",
    image: "/images/logo/logo1.png?height=200&width=200",
    rating: 4.7,
  },
  {
    id: 4,
    name: "Matcha Fox Special",
    price: 52000,
    description: "Trà sữa matcha Nhật Bản cao cấp với vị đắng nhẹ và hậu ngọt",
    image: "/images/logo/logo1.png?height=200&width=200",
    rating: 4.6,
  },
  {
    id: 5,
    name: "Thai Fox Tea",
    price: 48000,
    description: "Trà sữa Thái Lan đậm đà với màu cam đặc trưng và vị ngọt thanh",
    image: "/images/logo/logo1.png?height=200&width=200",
    rating: 4.5,
  },
  {
    id: 6,
    name: "Chocolate Fox Dream",
    price: 58000,
    description: "Trà sữa chocolate đậm đà với topping whipped cream và chocolate chips",
    image: "/images/logo/logo1.png?height=200&width=200",
    rating: 4.8,
  },
]

const toppings: Topping[] = [
  { id: 1, name: "Trân châu đen", price: 8000 },
  { id: 2, name: "Trân châu trắng", price: 8000 },
  { id: 3, name: "Thạch dừa", price: 10000 },
  { id: 4, name: "Thạch cà phê", price: 10000 },
  { id: 5, name: "Pudding", price: 12000 },
  { id: 6, name: "Kem cheese", price: 15000 },
  { id: 7, name: "Trân châu hoàng kim", price: 15000 },
]

const sweetnessLevels = [
  { value: "0", label: "Không đường" },
  { value: "30", label: "30% đường" },
  { value: "50", label: "50% đường" },
  { value: "70", label: "70% đường" },
  { value: "100", label: "100% đường" },
]

const iceLevels = [
  { value: "no-ice", label: "Không đá" },
  { value: "less-ice", label: "Ít đá" },
  { value: "normal-ice", label: "Đá bình thường" },
  { value: "extra-ice", label: "Nhiều đá" },
]

export default function FoxMilkTeaShop() {
  const [activeTab, setActiveTab] = useState<"order" | "manage">("order")
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({})
  const [selectedMilkTea, setSelectedMilkTea] = useState<MilkTea | null>(null)
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([])
  const [selectedSweetness, setSelectedSweetness] = useState("70")
  const [selectedIce, setSelectedIce] = useState("normal-ice")
  const [selectedNote, setSelectedNote] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showCustomization, setShowCustomization] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [cashAmount, setCashAmount] = useState<number>(0)
  const [cashError, setCashError] = useState<string>("")
  // const [orderCompleted, setOrderCompleted] = useState(false)

  const getQuantity = (id: number) => quantities[id] || 0

  const formatInputNumber = (value: string) => {
    // Remove all non-digit characters
    const number = value.replace(/\D/g, '')
    // Convert to number and format with thousand separators
    return number ? Number(number).toLocaleString('vi-VN') : ''
  }

  const handleCashInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Remove thousand separators and convert to number
    const number = Number(value.replace(/\./g, ''))
    if (!isNaN(number) && number >= 0) {
      setCashAmount(number)
    }
  }

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity >= 0) {
      setQuantities((prev) => ({ ...prev, [id]: newQuantity }))
    }
  }

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
    }).format(date)
  }

  const handleAddToCart = (milkTea: MilkTea) => {
    setSelectedMilkTea(milkTea)
    setSelectedToppings([])
    setSelectedSweetness("70")
    setSelectedIce("normal-ice")
    setSelectedNote("")
    setShowCustomization(true)
  }

  const confirmAddToCart = () => {
    if (!selectedMilkTea) return

    const quantity = getQuantity(selectedMilkTea.id)
    const toppingsPrice = selectedToppings.reduce((sum, topping) => sum + topping.price, 0)
    const totalPrice = (selectedMilkTea.price + toppingsPrice) * quantity

    const cartItem: CartItem = {
      id: Date.now(),
      milkTea: selectedMilkTea,
      quantity,
      toppings: selectedToppings,
      sweetness: sweetnessLevels.find((s) => s.value === selectedSweetness)?.label || "",
      ice: iceLevels.find((i) => i.value === selectedIce)?.label || "",
      note: selectedNote,
      totalPrice,
    }

    setCart((prev) => [...prev, cartItem])
    setShowCustomization(false)
    setSelectedMilkTea(null)

    // Reset quantity về 0
    if (selectedMilkTea) {
      setQuantities((prev) => ({ ...prev, [selectedMilkTea.id]: 0 }))
    }
  }

  const toggleTopping = (topping: Topping) => {
    setSelectedToppings((prev) => {
      const exists = prev.find((t) => t.id === topping.id)
      if (exists) {
        return prev.filter((t) => t.id !== topping.id)
      } else {
        return [...prev, topping]
      }
    })
  }

  const getTotalCartPrice = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  const removeFromCart = (itemId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId))
  }

  const handleStartCheckout = () => {
    setShowCart(false)
    setShowCheckout(true)
    setCheckoutStep(1)
    setPaymentMethod("")
    // setOrderCompleted(false)
  }

  const handlePaymentMethodNext = () => {
    if (paymentMethod) {
      setCheckoutStep(2)
    }
  }

  const handleCompleteOrder = () => {
    if (paymentMethod === "cash") {
      if (cashAmount === 0) {
        setCashError("Vui lòng nhập số tiền khách đưa")
        return
      }
      if (cashAmount < getTotalCartPrice()) {
        setCashError(`Số tiền không đủ. Còn thiếu ${formatPrice(getTotalCartPrice() - cashAmount)}`)
        return
      }
    }
    setCashError("")

    // Tạo đơn hàng mới
    const newOrder: Order = {
      id: Date.now(),
      items: [...cart],
      totalPrice: getTotalCartPrice(),
      paymentMethod: paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản",
      orderTime: new Date(),
      isCompleted: false,
    }

    setOrders((prev) => [...prev, newOrder])

    // Reset cart sau 200 ms
    setTimeout(() => {
      setCart([])
      setShowCheckout(false)
      setCheckoutStep(1)
      setPaymentMethod("")
      setCashAmount(0)
      setCashError("")
      // setOrderCompleted(false)
    }, 200)
  }

  const toggleOrderStatus = (orderId: number) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, isCompleted: !order.isCompleted } : order)),
    )
  }

  // Sắp xếp đơn hàng: inactive trước, sau đó theo thời gian cũ nhất
  const sortedOrders = [...orders].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1 // inactive (false) trước
    }
    return a.orderTime.getTime() - b.orderTime.getTime() // cũ nhất trước
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center">
              <img
                src={"/images/logo/logo1.png"}
                alt={""}
                className="w-16 h-16 object-cover rounded-lg"
              />
            </div>
            <div>
              <h1 className="font-bold text-lg">1996 Milk Tea</h1>
              <p className="text-xs opacity-90">Coffee & Milk Tea</p>
            </div>
          </div>
          {activeTab === "order" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 relative"
              onClick={() => setShowCart(true)}
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-yellow-400 text-orange-800 text-xs px-1.5 py-0.5">
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
        <div className="p-4 max-w-md mx-auto pb-24">
          <div className="grid gap-4">
            {milkTeas.map((milkTea) => (
              <Card
                key={milkTea.id}
                className="overflow-hidden border-orange-200 shadow-md hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="w-24 h-24 flex items-center justify-center">
                      <img
                        src={milkTea.image || "/images/logo/logo1.png"}
                        alt={milkTea.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 p-3">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-gray-800 text-sm leading-tight">{milkTea.name}</h3>
                        <div className="flex items-center gap-1 ml-2">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">{milkTea.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{milkTea.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-orange-600">{formatPrice(milkTea.price)}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-orange-300 rounded-lg">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 hover:bg-orange-100"
                              onClick={() => updateQuantity(milkTea.id, getQuantity(milkTea.id) - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Input
                              type="number"
                              value={getQuantity(milkTea.id)}
                              onChange={(e) => updateQuantity(milkTea.id, Number.parseInt(e.target.value) || 0)}
                              className="w-12 h-7 text-center border-0 text-xs p-0"
                              min="0"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 hover:bg-orange-100"
                              onClick={() => updateQuantity(milkTea.id, getQuantity(milkTea.id) + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white h-7 px-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleAddToCart(milkTea)}
                            disabled={getQuantity(milkTea.id) === 0}
                          >
                            Chọn
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* Order Management */
        <div className="p-4 max-w-md mx-auto pb-24">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🦊</div>
              <p className="text-gray-500 text-lg mb-2">Chưa có đơn hàng nào</p>
              <p className="text-sm text-gray-400">Hãy đặt trà sữa yêu thích nhé!</p>
              <Button
                onClick={() => setActiveTab("order")}
                className="mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                Đặt trà sữa ngay
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedOrders.map((order) => (
                <Card
                  key={order.id}
                  className={`border-2 ${order.isCompleted ? "border-green-200 bg-green-50" : "border-orange-200"}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800">Đơn hàng #{order.id.toString().slice(-6)}</h3>
                          <Badge
                            className={
                              order.isCompleted ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
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
                        onClick={() => toggleOrderStatus(order.id)}
                        className={`h-8 w-8 p-0 ${order.isCompleted ? "text-green-600 hover:bg-green-100" : "text-orange-600 hover:bg-orange-100"}`}
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
                            <span className="text-orange-600">{formatPrice(item.totalPrice)}</span>
                          </div>
                          <div className="text-xs text-gray-500 ml-2">
                            {item.sweetness} • {item.ice}
                            {item.toppings.length > 0 && ` • ${item.toppings.map((t) => t.name).join(", ")}`}
                            {item.note && <div className="text-orange-600 mt-1">Ghi chú: {item.note}</div>}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-3" />

                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Tổng cộng:</span>
                      <span className="font-bold text-xl text-orange-600">{formatPrice(order.totalPrice)}</span>
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
                  ? "text-orange-600 bg-orange-50"
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
                  ? "text-orange-600 bg-orange-50"
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
      {(showCustomization || showCart || showCheckout) && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
          onClick={() => {
            setShowCustomization(false)
            setShowCart(false)
            setShowCheckout(false)
          }}
        />
      )}

      {/* Customization Bottom Sheet */}
      <div
        className={`fixed top-0 bottom-0 left-0 right-0 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          showCustomization ? "translate-y-0" : "translate-y-full"
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
                onClick={() => setShowCustomization(false)}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-bold text-orange-600 flex items-center gap-2 flex-1 justify-center">
                <span>🦊</span>
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
                  <div className="text-center bg-orange-50 p-3 rounded-lg">
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
                            checked={selectedToppings.some((t) => t.id === topping.id)}
                            onCheckedChange={() => toggleTopping(topping)}
                          />
                          <Label
                            htmlFor={`topping-${topping.id}`}
                            className="flex-1 text-sm cursor-pointer flex justify-between"
                          >
                            <span>{topping.name}</span>
                            <span className="text-orange-600 font-medium">+{formatPrice(topping.price)}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Sweetness */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Độ ngọt</Label>
                    <RadioGroup value={selectedSweetness} onValueChange={setSelectedSweetness} className="mt-2">
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
                    <RadioGroup value={selectedIce} onValueChange={setSelectedIce} className="mt-2">
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
                      value={selectedNote}
                      onChange={(e) => setSelectedNote(e.target.value)}
                      placeholder="Ví dụ: Ít đường hơn, nhiều đá, không topping..."
                      className="w-full mt-2 p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      rows={3}
                      maxLength={200}
                    />
                    <div className="text-xs text-gray-400 mt-1 text-right">{selectedNote.length}/200 ký tự</div>
                  </div>
                </div>
              </div>

              {/* Fixed Bottom Section */}
              <div className="border-t border-gray-100 bg-white">
                {/* Price Summary */}
                <div className="p-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Giá gốc:</span>
                      <span>{formatPrice(selectedMilkTea.price * getQuantity(selectedMilkTea.id))}</span>
                    </div>
                    {selectedToppings.length > 0 && (
                      <div className="flex justify-between text-sm mb-1">
                        <span>Topping:</span>
                        <span>
                          +
                          {formatPrice(
                            selectedToppings.reduce((sum, t) => sum + t.price, 0) * getQuantity(selectedMilkTea.id),
                          )}
                        </span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold text-orange-600">
                      <span>Tổng cộng:</span>
                      <span>
                        {formatPrice(
                          (selectedMilkTea.price + selectedToppings.reduce((sum, t) => sum + t.price, 0)) *
                            getQuantity(selectedMilkTea.id),
                        )}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={confirmAddToCart}
                    className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 h-12 text-base font-semibold"
                  >
                    Thêm vào giỏ hàng
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cart Bottom Sheet */}
      <div
        className={`fixed top-0 bottom-0 left-0 right-0 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          showCart ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-md mx-auto h-full flex flex-col">
          {/* Header */}
          <div className="px-4 pb-4 pt-4 border-b border-gray-100">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mr-3" onClick={() => setShowCart(false)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-bold text-orange-600 flex items-center gap-2 flex-1 justify-center">
                <ShoppingCart className="w-5 h-5" />
                Giỏ hàng của bạn
              </h2>
              <div className="w-8"></div> {/* Spacer for centering */}
            </div>
          </div>

          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🦊</div>
                <p className="text-gray-500 text-lg mb-2">Giỏ hàng trống</p>
                <p className="text-sm text-gray-400">Hãy chọn món yêu thích nhé!</p>
              </div>
            </div>
          ) : (
            <>
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto ">
                <div className="p-4 space-y-4">
                  {cart.map((item) => (
                    <Card key={item.id} className="border-orange-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-base">{item.milkTea.name}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                            onClick={() => removeFromCart(item.id)}
                          >
                            X
                          </Button>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1 mb-3">
                          <p>Số lượng: {item.quantity}</p>
                          <p>Độ ngọt: {item.sweetness}</p>
                          <p>Lượng đá: {item.ice}</p>
                          {item.toppings.length > 0 && <p>Topping: {item.toppings.map((t) => t.name).join(", ")}</p>}
                          {item.note && <p className="text-orange-600 font-medium">Ghi chú: {item.note}</p>}
                        </div>
                        <div className="flex justify-end">
                          <span className="font-bold text-lg text-orange-600">{formatPrice(item.totalPrice)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Fixed Bottom Section */}
              <div className="border-t border-gray-100 bg-white">
                <div className="p-4">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-xl">Tổng cộng:</span>
                      <span className="font-bold text-2xl text-orange-600">{formatPrice(getTotalCartPrice())}</span>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 h-12 text-base font-semibold"
                      onClick={handleStartCheckout}
                    >
                      🦊 Đặt hàng ngay
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Checkout Bottom Sheet */}
      <div
        className={`fixed top-0 bottom-0 left-0 right-0 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          showCheckout ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-md mx-auto h-full flex flex-col">
          {/* Header */}
          <div className="px-4 pb-4 pt-4 border-b border-gray-100">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mr-3" onClick={() => {setShowCheckout(false); setCashAmount(0)}}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-bold text-orange-600 flex items-center gap-2 flex-1 justify-center">
                <span>🦊</span>
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
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Tóm tắt đơn hàng</h3>
                    <div className="space-y-1 text-sm">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="border-b border-orange-100 pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0"
                        >
                          <div className="flex justify-between">
                            <span>
                              {item.milkTea.name} x{item.quantity}
                            </span>
                            <span>{formatPrice(item.totalPrice)}</span>
                          </div>
                          {item.note && <div className="text-xs text-orange-600 mt-1">Ghi chú: {item.note}</div>}
                        </div>
                      ))}
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-orange-600">
                      <span>Tổng cộng:</span>
                      <span>{formatPrice(getTotalCartPrice())}</span>
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
                        {cashAmount > getTotalCartPrice() ? (
                          <>Tiền thối: <span className="text-green-600 font-medium">{formatPrice(cashAmount - getTotalCartPrice())}</span></>
                        ) : cashAmount > 0 ? (
                          <>Còn thiếu: <span className="text-red-600 font-medium">{formatPrice(getTotalCartPrice() - cashAmount)}</span></>
                        ) : (
                          <>Tiền thối: {formatPrice(0)}</>
                        )}
                      </p>
                    </div>
                    <p className="text-gray-600">Đơn hàng của bạn đã được xác nhận</p>
                    <p className="text-sm text-gray-500 mt-2">Tổng tiền: {formatPrice(getTotalCartPrice())}</p>
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
                      <span className="font-bold text-orange-600">{formatPrice(getTotalCartPrice())}</span>
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                          <Image alt="" src={`https://img.vietqr.io/image/VCB-9931782220-qr_only.png?amount=${getTotalCartPrice()}`} width={600} height={776} />
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
                        <span className="font-medium">Chủ tài khoản:</span> Fox Milk Tea
                      </p>
                      <p>
                        <span className="font-medium">Số tiền:</span>{" "}
                        <span className="font-bold text-orange-600">{formatPrice(getTotalCartPrice())}</span>
                      </p>
                      {/* <p>
                        <span className="font-medium">Nội dung:</span> Fox Order #{Date.now().toString().slice(-6)}
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
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 h-12 text-base font-semibold disabled:opacity-50"
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
    </div>
  )
}
