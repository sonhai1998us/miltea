"use client"

import { memo } from "react"
import { Coffee, ClipboardList } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface BottomNavProps {
  activeTab: "order" | "manage"
  pendingOrders: number
  onChangeTab: (tab: "order" | "manage") => void
}

function BottomNavBase({ activeTab, pendingOrders, onChangeTab }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 shadow-lg">
      <div className="max-w-md mx-auto">
        <div className="flex">
          <button
            onClick={() => onChangeTab("order")}
            className={`flex-1 py-3 px-4 flex flex-col items-center gap-1 transition-colors ${
              activeTab === "order" ? "text-green-600 bg-green-50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Coffee className="w-5 h-5" />
            <span className="text-xs font-medium">Đặt hàng</span>
          </button>
          <button
            onClick={() => onChangeTab("manage")}
            className={`flex-1 py-3 px-4 flex flex-col items-center gap-1 transition-colors relative ${
              activeTab === "manage" ? "text-green-600 bg-green-50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-xs font-medium">Quản lý</span>
            {pendingOrders > 0 && (
              <Badge className="absolute top-1 right-3 bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
                {pendingOrders}
              </Badge>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export const BottomNav = memo(BottomNavBase)
