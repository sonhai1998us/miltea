"use client"

import { useState } from "react"
import { Plus, Minus, ShoppingCart, Star, Heart, Zap, Flame, Sparkles, Search } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface Topping {
  id: string
  name: string
  price: number
}

interface BubbleTea {
  id: string
  name: string
  image: string
  price: number
  description: string
  rating: number
  popular?: boolean
}

interface CartItem {
  id: string
  bubbleTea: BubbleTea
  quantity: number
  toppings: Topping[]
  iceOption: string
  totalPrice: number
}

const toppings: Topping[] = [
  { id: "1", name: "Trân châu đen", price: 5000 },
  { id: "2", name: "Trân châu trắng", price: 5000 },
  { id: "3", name: "Thạch dừa", price: 7000 },
  { id: "4", name: "Pudding", price: 8000 },
  { id: "5", name: "Thạch cà phê", price: 6000 },
  { id: "6", name: "Kem cheese", price: 10000 },
]

const bubbleTeas: BubbleTea[] = [
  {
    id: "1",
    name: "Trà Sữa Truyền Thống",
    image: "/images/logo/default.png?height=400&width=400",
    price: 25000,
    description: "Trà sữa đậm đà với hương vị truyền thống, được pha chế từ trà đen thơm ngon",
    rating: 4.8,
    popular: true,
  },
  {
    id: "2",
    name: "Trà Sữa Matcha",
    image: "/images/logo/default.png?height=400&width=400",
    price: 30000,
    description: "Trà sữa matcha Nhật Bản cao cấp, vị đắng nhẹ hòa quyện cùng sữa béo ngậy",
    rating: 4.9,
    popular: true,
  },
  {
    id: "3",
    name: "Trà Sữa Taro",
    image: "/images/logo/default.png?height=400&width=400",
    price: 28000,
    description: "Trà sữa khoai môn tím thơm ngon, màu sắc bắt mắt và hương vị độc đáo",
    rating: 4.7,
  },
  {
    id: "4",
    name: "Trà Sữa Chocolate",
    image: "/images/logo/default.png?height=400&width=400",
    price: 32000,
    description: "Trà sữa chocolate đậm đà, ngọt ngào dành cho những ai yêu thích vị ngọt",
    rating: 4.6,
  },
  {
    id: "5",
    name: "Trà Sữa Dâu",
    image: "/images/logo/default.png?height=400&width=400",
    price: 29000,
    description: "Trà sữa dâu tươi mát, vị chua ngọt hài hòa và màu hồng dễ thương",
    rating: 4.5,
  },
  {
    id: "6",
    name: "Trà Sữa Oolong",
    image: "/images/logo/default.png?height=400&width=400",
    price: 35000,
    description: "Trà sữa oolong cao cấp, hương thơm tinh tế và vị trà đặc trưng",
    rating: 4.9,
  },
]

// Fox Ears Component
const FoxEars = ({ className = "" }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-orange-500">
      <path
        d="M8 2L12 8L16 2C16 2 18 4 18 8C18 12 16 14 12 14C8 14 6 12 6 8C6 4 8 2 8 2Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path d="M10 4L12 6L14 4" fill="none" stroke="#fff" strokeWidth="1" />
    </svg>
  </div>
)

export default function BubbleTeaShop() {
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [selectedTea, setSelectedTea] = useState<BubbleTea | null>(null)
  const [selectedToppings, setSelectedToppings] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [selectedIce, setSelectedIce] = useState<string>("ice")
  const [searchQuery, setSearchQuery] = useState("")

  const getQuantity = (teaId: string) => quantities[teaId] || 0

  const updateQuantity = (teaId: string, newQuantity: number) => {
    if (newQuantity < 0) return
    setQuantities((prev) => ({
      ...prev,
      [teaId]: newQuantity,
    }))
  }

  const handleAddToCart = (tea: BubbleTea) => {
    const quantity = getQuantity(tea.id)
    if (quantity === 0) return

    setSelectedTea(tea)
    setSelectedToppings([])
    setSelectedIce("ice")
    setIsDialogOpen(true)
  }

  const confirmAddToCart = () => {
    if (!selectedTea) return

    const quantity = getQuantity(selectedTea.id)
    const selectedToppingItems = toppings.filter((t) => selectedToppings.includes(t.id))
    const toppingsPrice = selectedToppingItems.reduce((sum, t) => sum + t.price, 0)
    const totalPrice = (selectedTea.price + toppingsPrice) * quantity

    const cartItem: CartItem = {
      id: Date.now().toString(),
      bubbleTea: selectedTea,
      quantity,
      toppings: selectedToppingItems,
      iceOption: selectedIce,
      totalPrice,
    }

    setCart((prev) => [...prev, cartItem])
    setQuantities((prev) => ({ ...prev, [selectedTea.id]: 0 }))
    setIsDialogOpen(false)
    setSelectedTea(null)
    setSelectedToppings([])
  }

  const toggleTopping = (toppingId: string) => {
    setSelectedToppings((prev) =>
      prev.includes(toppingId) ? prev.filter((id) => id !== toppingId) : [...prev, toppingId],
    )
  }

  const getTotalCartPrice = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId))
  }

  const filteredBubbleTeas = bubbleTeas.filter(
    (tea) =>
      tea.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tea.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Floating Fox Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 text-orange-200/30 animate-pulse">
          <FoxEars className="w-8 h-8" />
        </div>
        <div className="absolute bottom-40 left-1/4 text-orange-300/25 animate-pulse">
          <Sparkles className="w-10 h-10" />
        </div>
        <div className="absolute bottom-20 right-1/3 text-red-300/20 animate-bounce">
          <Flame className="w-8 h-8" />
        </div>
      </div>

      {/* Modern Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br flex items-center justify-center relative overflow-hidden">
                <Image width={48} height={48} src="/images/logo/logo.png" alt="" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent flex items-center">
                  1996
                </h1>
                <p className="text-sm bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent flex items-center">
                  Coffee & Milk Tea
                </p>
              </div>
            </div>
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm trà sữa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:border-orange-300 focus:ring-orange-200"
                />
              </div>
            </div>
            <Button
              onClick={() => setShowCart(!showCart)}
              className="relative bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 z-20"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Giỏ hàng
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-white border-2 border-white">
                  {cart.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-20 relative">
        {/* Menu Full Width */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent flex items-center">
              <FoxEars className="mr-3 text-orange-500" />
              Kho báu của cáo
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>Được cáo yêu thích nhất</span>
              <Flame className="w-4 h-4 text-red-400 ml-2" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBubbleTeas.length > 0 ? (
              filteredBubbleTeas.map((tea) => (
                <Card
                  key={tea.id}
                  className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-500 bg-white relative"
                >
                  
                  <CardHeader className="p-0 relative">
                    {tea.popular && (
                      <Badge className="absolute top-4 left-4 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
                        <Heart className="w-3 h-3 mr-1" />
                        Phổ biến
                      </Badge>
                    )}
                    <div className="relative overflow-hidden rounded-t-xl">
                      <Image
                        src={tea.image || "/images/logo/default.png"}
                        alt={tea.name}
                        width={400}
                        height={300}
                        className="w-full h-56 object-contain group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 via-transparent to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Floating sparkles on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute text-yellow-300 animate-pulse"
                            style={{
                              left: `${20 + i * 25}%`,
                              bottom: `${10 + i * 15}%`,
                              animationDelay: `${i * 0.3}s`,
                            }}
                          >
                            <Sparkles className="w-4 h-4" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                        {tea.name}
                      </CardTitle>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-600">{tea.rating}</span>
                      </div>
                    </div>

                    <CardDescription className="text-gray-600 mb-4 line-clamp-2">{tea.description}</CardDescription>

                    <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-6">
                      {formatPrice(tea.price)}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-center gap-3 mb-6 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-orange-100">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(tea.id, getQuantity(tea.id) - 1)}
                        disabled={getQuantity(tea.id) === 0}
                        className="w-10 h-10 rounded-full border hover:bg-red-50 hover:border-red-300"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        value={getQuantity(tea.id)}
                        onChange={(e) => updateQuantity(tea.id, Number.parseInt(e.target.value) || 0)}
                        className="w-16 text-center border rounded-xl font-medium"
                        min="0"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(tea.id, getQuantity(tea.id) + 1)}
                        className="w-10 h-10 rounded-full border hover:bg-red-50 hover:border-red-300"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>

                  <CardFooter className="p-6 pt-0">
                    <Button
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0 rounded-xl h-12 font-medium shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                      onClick={() => handleAddToCart(tea)}
                      disabled={getQuantity(tea.id) === 0}
                    >
                      <span className="relative z-10 flex items-center">
                        <Zap className="w-4 h-4 mr-2" />
                        Thêm vào giỏ hàng
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-orange-400" />
                </div>
                <p className="text-gray-500">Không tìm thấy trà sữa nào</p>
                <p className="text-sm text-gray-400 mt-1">Thử tìm kiếm với từ khóa khác</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Topping Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md border-0 shadow-xl bg-white">
          <DialogHeader className="text-center pb-4">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent flex items-center justify-center">
              <Sparkles className="w-6 h-6 mr-2 text-orange-500" />
              Tùy chỉnh đồ uống
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Tùy chỉnh ly <span className="font-semibold text-red-600">{selectedTea?.name}</span> với phép thuật của
              cáo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 max-h-80 overflow-y-auto">
            {/* Ice Options */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <Flame className="w-4 h-4 mr-2 text-orange-500" />
                Lựa chọn đá
              </h4>
              <RadioGroup value={selectedIce} onValueChange={setSelectedIce} className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors">
                  <RadioGroupItem value="ice" id="ice" className="border-orange-300 text-red-500" />
                  <Label htmlFor="ice" className="font-medium text-gray-900 cursor-pointer flex-1">
                    Có đá
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors">
                  <RadioGroupItem value="no-ice" id="no-ice" className="border-orange-300 text-red-500" />
                  <Label htmlFor="no-ice" className="font-medium text-gray-900 cursor-pointer flex-1">
                    Không đá
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Toppings */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-orange-500" />
                Chọn topping
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {toppings.map((topping) => (
                  <div
                    key={topping.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
                  >
                    <Checkbox
                      id={topping.id}
                      checked={selectedToppings.includes(topping.id)}
                      onCheckedChange={() => toggleTopping(topping.id)}
                      className="border-2 border-orange-300 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                    />
                    <label htmlFor={topping.id} className="flex-1 flex justify-between items-center cursor-pointer">
                      <span className="font-medium text-gray-900">{topping.name}</span>
                      <span className="text-red-600 font-bold">+{formatPrice(topping.price)}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
              Hủy
            </Button>
            <Button
              onClick={confirmAddToCart}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl"
            >
              <Flame className="w-4 h-4 mr-2" />
              Thêm vào giỏ hàng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cart Dialog */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-auto rounded-b-lg border-0 shadow-xl bg-white">
          <DialogHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-xl -m-6 mb-4 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-orange-600/20"></div>
            <DialogTitle className="text-xl font-bold flex items-center relative z-10">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Kho báu của cáo ({cart.length} món)
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[200px] overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FoxEars className="w-8 h-8 text-orange-400" />
                </div>
                <p className="text-gray-500">Kho báu trống</p>
                <p className="text-sm text-gray-400 mt-1 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Hãy khám phá ma thuật của cáo!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-orange-100 relative overflow-hidden"
                  >
                    {/* <div className="absolute top-2 right-2 text-orange-200/30">
                      <FoxTail className="w-4 h-4" />
                    </div> */}
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-gray-900">{item.bubbleTea.name}</h4>
                      <Button
                        size="c25"
                        variant="ghost"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 w-8 h-8 rounded-full p-0"
                      >
                        ×
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <p>
                        Số lượng: <span className="font-medium">{item.quantity}</span>
                      </p>
                      <p className="font-bold text-red-600 text-right">{formatPrice(item.totalPrice)}</p>
                    </div>
                    <div className="text-sm text-gray-600 mt-2 space-y-1">
                      <p>
                        <span className="inline-flex items-center">
                          <Flame className="w-3 h-3 mr-1 text-orange-500" />
                          {item.iceOption === "ice" ? "Có đá" : "Không đá"}
                        </span>
                      </p>
                      {item.toppings.length > 0 && (
                        <p>
                          Topping: <span className="font-medium">{item.toppings.map((t) => t.name).join(", ")}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-orange-600/20"></div>
                <div className="flex justify-between items-center font-bold text-lg mb-4 relative z-10">
                  <span className="flex items-center">
                    <FoxEars className="w-5 h-5 mr-2" />
                    Tổng kho báu:
                  </span>
                  <span>{formatPrice(getTotalCartPrice())}</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 relative z-10 grid-cols-1">
                  <Button
                    variant="outline"
                    onClick={() => setShowCart(false)}
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 rounded-xl"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Tiếp tục khám phá
                  </Button>
                  <Button className="bg-white text-red-600 hover:bg-gray-50 font-semibold rounded-xl shadow-md">
                    <Flame className="w-4 h-4 mr-2" />
                    Đặt hàng ngay
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
