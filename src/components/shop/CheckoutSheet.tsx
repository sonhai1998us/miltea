"use client"

import { memo } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Image from "next/image"
import { CartItem } from "@/types/shop"

interface Props {
  open: boolean
  step: 1 | 2
  paymentMethod: "" | "cash" | "transfer"
  cart: CartItem[]
  total: number
  cashAmount: number
  cashError: string
  formatPrice: (n: number) => string
  onClose: () => void
  onNext: () => void
  onConfirm: () => void
  onPaymentChange: (v: "cash" | "transfer") => void
  onCashChange: (v: number) => void
  onPrintBill: () => void
  formatInputNumber: (s: string) => string
}

function CheckoutSheetBase({
  open,
  step,
  paymentMethod,
  total,
  cashAmount,
  cashError,
  formatPrice,
  onClose,
  onNext,
  onConfirm,
  onPaymentChange,
  onCashChange,
  onPrintBill,
  formatInputNumber,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out translate-y-0">
      <div className="max-w-md mx-auto h-full flex flex-col">
        <div className="px-4 pb-4 pt-4 border-b border-gray-100">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mr-3" onClick={onClose}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-bold text-green-600 flex items-center gap-2 flex-1 justify-center">
              {step === 1 ? "Chọn thanh toán" : paymentMethod === "cash" ? "Thanh toán tiền mặt" : "Chuyển khoản"}
            </h2>
            <div className="w-8"></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto ">
          <div className="p-4">
            {step === 1 && (
              <div className="space-y-4">

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-3 block">Chọn phương thức thanh toán</Label>
                  <RadioGroup value={paymentMethod} onValueChange={(v) => onPaymentChange(v as "cash" | "transfer")} className="space-y-3">
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

            {step === 2 && paymentMethod === "cash" && (
              <div className="text-center py-8 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nhập số tiền khách đưa</label>
                  <input
                    id="cash-input"
                    type="text"
                    className={`w-full h-12 border ${cashError ? "border-red-500" : "border-gray-200"} rounded-lg p-2`}
                    placeholder="Nhập số tiền khách đưa"
                    value={formatInputNumber(cashAmount.toString())}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\./g, "")
                      const n = parseInt(raw, 10)
                      onCashChange(Number.isFinite(n) ? n : 0)
                    }}
                    min={0}
                  />
                  {cashError && <p className="text-red-500 text-sm mt-1">{cashError}</p>}
                  <div className="flex justify-center mt-4 mb-4">
                    <p className="text-sm text-gray-500">
                      {cashAmount > total ? (
                        <>Tiền thối: <span className="text-green-600 font-medium">{formatPrice(cashAmount - total)}</span></>
                      ) : cashAmount > 0 ? (
                        <>Còn thiếu: <span className="text-red-600 font-medium">{formatPrice(total - cashAmount)}</span></>
                      ) : (
                        <>Tiền thối: {formatPrice(0)}</>
                      )}
                    </p>
                  </div>
                  <p className="text-gray-600">Đơn hàng của bạn đã được xác nhận</p>
                  <p className="text-sm text-gray-500 mt-2">Tổng tiền: {formatPrice(total)}</p>
                  <p className="text-sm text-gray-500">Thanh toán khi nhận hàng</p>
                </div>
              </div>
            )}

            {step === 2 && paymentMethod === "transfer" && (
              <div className="text-center py-4 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Quét mã QR để thanh toán</h3>
                  <p className="text-sm text-gray-600">
                    Số tiền cần chuyển: <span className="font-bold text-green-600">{formatPrice(total)}</span>
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                        <Image alt="" src={`https://img.vietqr.io/image/VCB-9931782220-qr_only.png?amount=${total}`} width={600} height={776} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-left">
                  <h4 className="font-semibold text-blue-800 mb-2">Thông tin chuyển khoản:</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Ngân hàng:</span> Vietcombank</p>
                    <p><span className="font-medium">Số tài khoản:</span> 1234567890</p>
                    <p><span className="font-medium">Chủ tài khoản:</span> Lá và Sương</p>
                    <p><span className="font-medium">Số tiền:</span> <span className="font-bold text-green-600">{formatPrice(total)}</span></p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Sau khi chuyển khoản thành công,</p>
                  <p>vui lòng nhấn Xác nhận hoàn tất bên dưới</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {step === 1 && (
          <div className="border-t border-gray-100 bg-white">
            <div className="p-4">
              <Button onClick={onNext} disabled={!paymentMethod} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12 text-base font-semibold disabled:opacity-50">
                Tiếp theo
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="border-t border-gray-100 bg-white">
            <div className="p-4 flex gap-4 w-full">
              {/* <Button
                onClick={onPrintBill}
                className={`w-full h-12 flex-1 text-base font-semibold ${paymentMethod === "cash" ? "bg-green-600 hover:from-green-600 hover:to-green-700" : "bg-green-600 hover:from-blue-600 hover:to-blue-700"}`}
              >
                In hóa đơn
              </Button> */}
              <Button
                onClick={onConfirm}
                className={`w-full h-12 flex-1 text-base font-semibold ${paymentMethod === "cash" ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700" : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"}`}
              >
                Xác nhận hoàn tất
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const CheckoutSheet = memo(CheckoutSheetBase)
