"use client"

import { memo } from "react"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface HeaderBarProps {
  activeTab: "order" | "manage"
  cartCount: number
  onOpenCart: () => void
}

function HeaderBarBase({ activeTab, cartCount, onOpenCart }: HeaderBarProps) {
  return (
    <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 sticky top-0 z-40 shadow-lg">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center">
            <img src={"/images/logo/logo3.png"} alt="" className="w-16 h-16 object-contain rounded-lg" />
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
            onClick={onOpenCart}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-amber-400 text-green-800 text-xs px-1.5 py-0.5">
                {cartCount}
              </Badge>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

export const HeaderBar = memo(HeaderBarBase)
