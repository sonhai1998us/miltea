"use client"

import { memo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Order, Topping } from "@/types/shop"
import { Printer } from "lucide-react"

interface InvoicePopupProps {
  isOpen: boolean
  onClose: () => void
  order: Order | null
  formatPrice: (n: number) => string
  formatDateTime: (d: Date) => string
}

function InvoicePopupBase({ isOpen, onClose, order, formatPrice, formatDateTime }: InvoicePopupProps) {
  if (!order) return null

  const handlePrint = () => {
    // Ensure all content is visible before printing
    setTimeout(() => {
      window.print()
    }, 100)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] print:max-h-none print:border-none overflow-y-auto print:bg-white">
        <DialogHeader className="print:hidden">
          <DialogTitle className="text-center text-xl font-bold text-green-700">
            HÓA ĐƠN BÁN HÀNG
          </DialogTitle>
        </DialogHeader>

        {/* Invoice Content */}
        <div id="invoice-print" className="space-y-4 print:space-y-1 print:bg-white print:text-black">
          {/* Header */}
          <div className="text-center border-b-2 border-green-200 pb-4 print:border-b-2 print:border-black print:pb-2">
            <h1 className="text-2xl font-bold text-green-700 print:text-xl print:text-black">Lá và Sương</h1>
            <p className="text-sm text-gray-600 print:text-xs print:text-black">Cà phê -Trà trái cây - Trà sữa</p>
            <p className="text-xs text-gray-500 print:text-xs print:text-black">36/27B Đ. Số 4, Thủ Đức, Hồ Chí Minh</p>
            <p className="text-xs text-gray-500 print:text-xs print:text-black">ĐT: 0931 792 220</p>
          </div>

          {/* Order Info */}
          <div className="space-y-1 print:space-y-1 print:bg-white print:text-black">
            <div className="flex justify-between print:text-xs">
              <span className="font-semibold print:text-sm print:text-black">Mã đơn:</span>
              <span className="font-bold text-green-600 print:text-sm print:text-black">#{order.id.toString().slice(-6)}</span>
            </div>
            <div className="flex justify-between print:text-xs">
              <span className="font-semibold print:text-sm print:text-black">Ngày:</span>
              <span className="print:text-sm print:text-black">{formatDateTime(order.order_time)}</span>
            </div>
            <div className="flex justify-between print:text-xs">
              <span className="font-semibold print:text-sm print:text-black">Thanh toán:</span>
              <span className="font-semibold print:text-sm print:text-black">
                {order.payment_method_id === 1 ? "Tiền mặt" : "Chuyển khoản"}
              </span>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Items */}
          <div className="space-y-2 print:text-black">
            <h3 className="font-bold text-lg text-center print:text-sm print:text-black">HÓA ĐƠN BÁN HÀNG</h3>
            {order.items.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-3 print:border-black print:p-2 print:rounded-none">
                <div className="flex justify-between items-start mb-2 print:mb-1">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 print:text-xs print:text-black">{item.product_name}</h4>
                    <p className="text-sm text-gray-600 print:text-xs print:text-black">SL: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 print:text-xs print:text-black">
                      {formatPrice((item.unit_price + item.toppings.reduce((s, t) => s + t.price, 0)) * item.quantity)}
                    </p>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1 print:text-xs print:text-black">
                  <div className="print:text-sm print:text-black">• {item.sweetness_name} - {item.ice_name}</div>
                  {item.size_name && (
                    <div className="print:text-sm print:text-black">• Size: {item.size_name} (+{formatPrice(item.size_price)})</div>
                  )}
                  {item.toppings.length > 0 && (
                    <div className="print:text-sm print:text-black">
                      {item.toppings.map((t: Topping, idx: number) => (
                        <div className="print:text-sm print:text-black" key={t.id || idx}>
                          • {t.name}{t.price > 0 ? ` (+${formatPrice(t.price)})` : ""}
                        </div>
                      ))}
                    </div>
                  )}
                  {item.notes && (
                    <div className="text-green-600 font-medium print:text-sm print:text-black">• {item.notes}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Total */}
          <div className="space-y-2 print:text-black">
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-lg">
                <span className="font-semibold print:text-sm print:text-black">Giảm giá:</span>
                <span className="font-bold text-red-600 print:text-sm print:text-black">-{formatPrice(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl border-t-2 border-green-200 pt-2 print:border-t-4 print:border-black">
              <span className="font-bold print:text-sm print:text-black mt-2">TỔNG CỘNG:</span>
              <span className="font-bold text-green-600 text-2xl print:text-sm print:text-black mt-2">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200 print:border-t-2 print:border-black print:text-black">
            <p className="print:text-sm print:text-black">Cảm ơn quý khách đã sử dụng dịch vụ!</p>
            <p className="print:text-sm print:text-black">Hẹn gặp lại quý khách lần sau</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 print:hidden">
          <Button 
            onClick={handlePrint} 
            className="flex-1 bg-green-600 hover:bg-green-700 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            In hóa đơn
          </Button>
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const InvoicePopup = memo(InvoicePopupBase)
