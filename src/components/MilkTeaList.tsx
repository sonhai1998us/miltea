"use client"

import { Plus, Minus, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface MilkTea {
  documentId: string
  id: number
  name: string
  price: number
  description: string
  image: { url: string }
  rating: number
}

interface MilkTeaListProps {
  milkTeas: MilkTea[]
  isLoading: boolean
  getQuantity: (id: number) => number
  updateQuantity: (id: number, newQuantity: number) => void
  handleAddToCart: (milkTea: MilkTea) => void
  formatPrice: (price: number) => string
}

export default function MilkTeaList({
  milkTeas,
  isLoading,
  getQuantity,
  updateQuantity,
  handleAddToCart,
  formatPrice
}: MilkTeaListProps) {
  if (isLoading) {
    return (
      <div className="p-4 max-w-md mx-auto pb-24">
        <div className="grid gap-4">
          {/* Loading skeleton for milk teas */}
          {Array.from({ length: 6 }).map((_, index) => (
            <Card
              key={`loading-${index}`}
              className="overflow-hidden border-green-200 shadow-md animate-pulse"
            >
              <CardContent className="p-0">
                <div className="flex items-center">
                  <div className="w-24 h-24 flex items-center justify-center pl-3">
                    <div className="w-20 h-20 bg-gray-300 rounded-lg"></div>
                  </div>
                  <div className="flex-1 p-3 pl-2">
                    <div className="flex items-start justify-between mb-1">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="flex items-center gap-1 ml-2">
                        <div className="w-3 h-3 bg-gray-300 rounded"></div>
                        <div className="w-4 h-3 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3 mb-2"></div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="h-4 bg-gray-300 rounded w-20"></div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-green-300 rounded-lg">
                          <div className="h-7 w-7 bg-gray-300 rounded"></div>
                          <div className="w-8 h-7 bg-gray-300 rounded"></div>
                          <div className="h-7 w-7 bg-gray-300 rounded"></div>
                        </div>
                        <div className="h-7 w-12 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <div className="grid gap-4">
        {milkTeas.map((milkTea) => (
          <Card
            key={milkTea.id}
            className="overflow-hidden border-green-200 shadow-md hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-0">
              <div className="flex items-center">
                <div className="w-24 h-24 flex items-center justify-center pl-3">
                  <img
                    src={milkTea.image.url || "/images/logo/logo2.png"}
                    alt={milkTea.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1 p-3 pl-2">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-800 text-sm leading-tight">{milkTea.name}</h3>
                    <div className="flex items-center gap-1 ml-2">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">{milkTea.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{milkTea.description}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-green-600">{formatPrice(milkTea.price)}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-green-300 rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-green-100"
                          onClick={() => updateQuantity(milkTea.id, getQuantity(milkTea.id) - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <Input
                          type="number"
                          value={getQuantity(milkTea.id)}
                          onChange={(e) => updateQuantity(milkTea.id, parseInt(e.target.value, 10) || 0)}
                          className="w-8 h-7 text-center border-0 text-xs p-0"
                          min="0"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-green-100"
                          onClick={() => updateQuantity(milkTea.id, getQuantity(milkTea.id) + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-7 px-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
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
  )
} 