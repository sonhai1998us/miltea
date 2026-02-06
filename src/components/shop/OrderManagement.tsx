"use client"

import { memo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, Circle, Trash2, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Order, Topping } from "@/types/shop"
import { PDFService } from "@/services/pdfService"

interface Props {
  orders: Order[]
  formatPrice: (n: number) => string
  formatDateTime: (d: Date | string | number) => string
  onToggleStatus: (o: Order) => void
  onDeleteOrder: (o: Order) => void
  onBackToOrder: () => void
}

function OrderManagementBase({ orders, formatPrice, formatDateTime, onToggleStatus, onDeleteOrder, onBackToOrder }: Props) {
  const [processingOrderIds, setProcessingOrderIds] = useState<Set<number>>(new Set())

  const isProcessing = (orderId: number) => processingOrderIds.has(orderId)

  const withLoading = async (orderId: number, action: () => Promise<void> | void) => {
    if (isProcessing(orderId)) return
    setProcessingOrderIds(prev => new Set(prev).add(orderId))
    try {
      await action()
    } finally {
      setProcessingOrderIds(prev => {
        const next = new Set(prev)
        next.delete(orderId)
        return next
      })
    }
  }

  const handlePrintBill = (order: Order) => {
    withLoading(order.id, async () => {
      const pdfService = new PDFService({
        formatPrice,
        formatDateTime
      })
      await pdfService.generateInvoice(order)
    })
  }

  const handleToggleStatus = (order: Order) => {
    withLoading(order.id, async () => {
      await onToggleStatus(order)
    })
  }

  const handleDeleteOrder = (order: Order) => {
    withLoading(order.id, async () => {
      await onDeleteOrder(order)
    })
  }

  if (!orders.length) {
    return (
      <div className="p-4 max-w-md mx-auto pb-24">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌿</div>
          <p className="text-gray-500 text-lg mb-2">Chưa có đơn hàng nào</p>
          <p className="text-sm text-gray-400">Hãy thưởng thức hương vị tự nhiên của Lá và Sương!</p>
          <Button onClick={onBackToOrder} className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600">Đặt trà sữa ngay</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-md mx-auto pb-24 space-y-4 print:hidden">
      {orders.map((order) => (
        <Card key={order.id} className={`border-2 ${order.is_completed ? "border-green-200 bg-green-50" : "border-green-200"}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800">Đơn hàng #{order.id.toString().slice(-6)}</h3>
                  <Badge className="bg-green-100 text-green-800">{order.is_completed ? "Hoàn thành" : "Đang xử lý"}</Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{formatDateTime(order.order_time)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Thanh toán: {order.payment_method_id === 1 ? "Tiền mặt" : "Chuyển khoản"}</p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleStatus(order)}
                  disabled={isProcessing(order.id)}
                  className="h-8 w-8 p-0 text-green-600 hover:bg-green-100 disabled:opacity-50"
                >
                  {isProcessing(order.id) ? <Loader2 className="w-5 h-5 animate-spin" /> : (order.is_completed ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />)}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteOrder(order)}
                  disabled={isProcessing(order.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 disabled:opacity-50"
                >
                  {isProcessing(order.id) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              {order.items.map((item) => (
                <div key={item.id} className="text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.product_name || item.topping_name} x{item.quantity}</span>
                    <span className="text-green-600">{formatPrice((item.unit_price + (item.toppings.reduce((s, t) => s + t.price, 0))) * item.quantity)}</span>
                  </div>
                  <div className="text-xs text-gray-500 ml-2">
                    {item.product_name && <>
                      <div>•{item.sweetness_name}</div>
                      <div>• {item.ice_name}</div>
                      <div>{item.toppings.length > 0 && ` • ${item.toppings.map((t: Topping) => t.name).join(", ")}`}</div>
                      <div>{item.size_name && <div className="text-green-600 mt-1 flex justify-between"><div>Size: {item.size_name}</div> <div>{formatPrice(item.size_price)}</div> </div>}</div>
                      <div>{item.notes && <div className="text-green-600 mt-1">Ghi chú: {item.notes}</div>}</div>
                    </>}
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-3" />
            {order.discount_amount > 0 &&
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Giảm giá:</span>
                <span className="font-bold text-xl text-red-600">{formatPrice(order.discount_amount)}</span>
              </div>}
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">Tổng cộng:</span>
              <span className="font-bold text-xl text-green-600">{formatPrice(order.total_amount)}</span>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                onClick={() => handlePrintBill(order)}
                disabled={isProcessing(order.id)}
                className="flex-1 border-green-300 text-green-700 disabled:opacity-50"
              >
                {isProcessing(order.id) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                In hóa đơn
              </Button>
              <Button
                variant="default"
                onClick={() => handleToggleStatus(order)}
                disabled={isProcessing(order.id)}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 disabled:opacity-70"
              >
                {isProcessing(order.id) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {order.is_completed ? "Đánh dấu chưa xong" : "Đánh dấu hoàn tất"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export const OrderManagement = memo(OrderManagementBase)
