"use client"

import { Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { Topping } from "@/types/shop"

interface ToppingListProps {
  toppings: Topping[]
  formatPrice: (price: number) => string
  getQuantity: (id: number) => number
  updateQuantity: (id: number, newQuantity: number) => void
  handleSelectTopping: (topping: Topping) => void
}

export default function ToppingList({
  toppings,
  formatPrice,
  getQuantity,
  updateQuantity,
  handleSelectTopping
}: ToppingListProps) {
  if (toppings.length === 0) {
    return null
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Topping</h2>
      <div className="grid gap-3 pb-16">
        {toppings.map((topping) => (
          <Card
            key={topping.id}
            className="overflow-hidden border-green-200 shadow-md hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm">{topping.name}</h3>
                </div>
                <span className="font-bold text-green-600 ml-2">
                  {formatPrice(topping.price)}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <div className="flex items-center border border-green-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-green-100"
                    onClick={() => updateQuantity(topping.id, getQuantity(topping.id) - 1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Input
                    type="number"
                    value={getQuantity(topping.id)}
                    onChange={(e) => updateQuantity(topping.id, parseInt(e.target.value, 10) || 0)}
                    className="w-8 h-7 text-center border-0 text-xs p-0"
                    min="0"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-green-100"
                    onClick={() => updateQuantity(topping.id, getQuantity(topping.id) + 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-7 px-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleSelectTopping(topping)}
                  disabled={getQuantity(topping.id) === 0}
                >
                  Chọn
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

