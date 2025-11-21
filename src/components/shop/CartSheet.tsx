"use client"

import { memo } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CartItem } from "@/types/shop"

interface Props {
  open: boolean
  cart: CartItem[]
  formatPrice: (n: number) => string
  total: number
  onClose: () => void
  onRemove: (itemId: number) => void
  onCheckout: () => void
  discountAmount: number
  discountLocked: boolean
  onChangeDiscount: (n: number) => void
  onApplyDiscount: () => void
  onClearDiscount: () => void
}

function CartSheetBase({ open, cart, formatPrice, total, onClose, onRemove, onCheckout, discountAmount, discountLocked, onChangeDiscount, onApplyDiscount, onClearDiscount }: Props) {
  if (!open) return null

  const formattedDiscount = new Intl.NumberFormat('vi-VN').format(discountAmount || 0)

  const handleDiscountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "")
    const value = raw ? parseInt(raw, 10) : 0
    onChangeDiscount(value)
  }

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out translate-y-0">
      <div className="max-w-md mx-auto h-full flex flex-col">
        <div className="px-4 pb-4 pt-4 border-b border-gray-100">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mr-3" onClick={onClose}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-bold text-green-600 flex items-center gap-2 flex-1 justify-center">Giỏ hàng của bạn</h2>
            <div className="w-8"></div>
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
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                {cart.map((item) => {
                  const toppingsPrice = item.toppings ? item.toppings.reduce((sum, topping) => sum + topping.price, 0) * item.quantity : 0
                  const itemTotal = ((item.product_price || item.topping_price) * item.quantity) + (toppingsPrice) + ((item?.size_price ?? 0) * item.quantity)

                  return (
                    <Card key={item.id} className="border-green-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-base">{item.product_name || item.topping_name}</h4>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50" onClick={() => onRemove(item.id)}>
                            X
                          </Button>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1 mb-3">
                          <p>Số lượng: {item.quantity}</p>
                          {item.product_name && <>
                            <p>Độ ngọt: {item.sweetness_name}</p>
                            <p>Lượng đá: {item.ice_name}</p>
                            {item.toppings?.length ? (
                              <div>
                                <p className="font-medium">Toppings:</p>
                                <div className="ml-2 space-y-1">
                                  {item.toppings.map((topping, index) => (
                                    <div key={index} className="flex justify-between text-xs">
                                      <span>• {topping.name}</span>
                                      <span className="text-green-600">+{formatPrice(item.quantity * topping.price)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p>Topping: Không thêm Topping</p>
                            )}
                          </>}
                          {item.notes && <p className="text-green-600 font-medium">Ghi chú: {item.notes}</p>}
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Giá sản phẩm:</span>
                            <span>{formatPrice((item.product_price || item.topping_price) * item.quantity)}</span>
                          </div>
                          {toppingsPrice > 0 && (
                            <div className="flex justify-between text-sm mb-1">
                              <span>Giá topping:</span>
                              <span>+{formatPrice(toppingsPrice)}</span>
                            </div>
                          )}
                          {item.size_price > 0 && (
                            <div className="flex justify-between text-sm mb-1">
                              <span>Size: {item.size_name}</span>
                              <span>+{formatPrice(item.quantity * item.size_price)}</span>
                            </div>
                          )}
                          {<div className="flex justify-between font-bold text-lg text-green-600 border-t pt-1">
                            <span>Tổng:</span>
                            <span>{formatPrice(itemTotal)}</span>
                          </div>}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            <div className="border-t border-gray-100 bg-white">
              <div className="p-4">
                <div className="mb-4">
                  <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
                    Giảm giá (VND)
                  </label>
                  <div className="relative">
                    <input
                      id="discount"
                      name="discount"
                      type="text"
                      inputMode="numeric"
                      placeholder="Nhập số tiền..."
                      value={formattedDiscount}
                      onChange={handleDiscountInput}
                      disabled={discountLocked}
                      className={`w-full border border-green-200 rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-400 ${discountLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                    {discountLocked ? (
                      <button type="button" aria-label="Xóa giảm giá" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={onClearDiscount}>
                        ×
                      </button>
                    ) : (
                      <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-700 text-sm" onClick={onApplyDiscount} disabled={!discountAmount}>
                        Áp dụng
                      </button>
                    )}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Tạm tính:</span>
                      <span>{formatPrice(total + (discountLocked ? discountAmount : 0))}</span>
                    </div>
                    {discountLocked && discountAmount > 0 && (
                      <div className="flex justify-between items-center text-red-600">
                        <span className="font-medium">Giảm giá:</span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mb-2 border-t border-emerald-100 pt-2">
                      <span className="font-bold text-xl">Tổng cộng:</span>
                      <span className="font-bold text-2xl text-green-600">{formatPrice(total)}</span>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12 text-base font-semibold" onClick={onCheckout}>
                    Đặt hàng ngay
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export const CartSheet = memo(CartSheetBase)
