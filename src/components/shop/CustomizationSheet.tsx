"use client"

import { memo, useMemo, useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

import { MilkTea, Topping, SweetValue, IceValue, SizeValue, SweetnessLevelOption, IceLevelOption, SizeOption, fetchSweetnessLevels, fetchIceLevels, fetchSizes } from "@/types/shop"
import { ProductSizePrices, fetchProductSizePrices }  from "@/types/option";

interface Props {
  open: boolean
  milkTea: MilkTea | null
  toppings: Topping[]
  quantity: number
  sheetSweetness: SweetValue
  sheetIce: IceValue
  sheetSize: SizeValue
  sheetNote: string
  sheetToppings: Topping[]
  formatPrice: (n: number) => string
  onClose: () => void
  onSweetChange: (v: SweetValue) => void
  onIceChange: (v: IceValue) => void
  onSizeChange: (v: SizeValue) => void
  onNoteChange: (v: string) => void
  onToggleTopping: (t: Topping) => void
  onConfirm: (id: number) => void
}

function CustomizationSheetBase({
  open,
  milkTea,
  toppings,
  quantity,
  sheetSweetness,
  sheetIce,
  sheetSize,
  sheetNote,
  sheetToppings,
  formatPrice,
  onClose,
  onSweetChange,
  onIceChange,
  onSizeChange,
  onNoteChange,
  onToggleTopping,
  onConfirm,
}: Props) {
  const [sweetnessLevels, setSweetnessLevels] = useState<SweetnessLevelOption[]>([])
  const [iceLevels, setIceLevels] = useState<IceLevelOption[]>([])
  const [sizes, setSizes] = useState<SizeOption[]>([])
  const [productSizePrices, setProductSizePrices] = useState<ProductSizePrices[]>([])
  const [isLoadingLevels, setIsLoadingLevels] = useState(true)

  // Fetch levels when component mounts
  useEffect(() => {
    const loadLevels = async () => {
      setIsLoadingLevels(true)
      try {
        const [sweetnessData, iceData, sizesData, productSizePricesData] = await Promise.all([
          fetchSweetnessLevels(),
          fetchIceLevels(),
          fetchSizes(),
          fetchProductSizePrices()
        ])
        setSweetnessLevels(sweetnessData)
        setIceLevels(iceData)
        setSizes(sizesData)
        setProductSizePrices(productSizePricesData)
      } catch (error) {
        console.error('Error loading levels:', error)
      } finally {
        setIsLoadingLevels(false)
      }
    }

    if (open) {
      loadLevels()
    }
  }, [open])

  const toppingsSum = useMemo(() => sheetToppings.reduce((s, t) => s + t.price, 0), [sheetToppings])
  
  const sizePrice = useMemo(() => {
    if (!milkTea) return 0
    const sizePriceData = productSizePrices.find(
      p => p.product_id === milkTea.id && p.size_id === Number(sheetSize)
    )
    return sizePriceData?.price || 0
  }, [productSizePrices, milkTea, sheetSize])

  const total = useMemo(() => {
    if (!milkTea) return 0
    const base = (milkTea.base_price + toppingsSum + sizePrice) * quantity;
    return base
  }, [milkTea, toppingsSum, quantity, sizePrice])

  if (!open) return null

  return (
    <div key={milkTea?.id} className="fixed top-0 bottom-0 left-0 right-0 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out translate-y-0">
      <div className="max-w-md mx-auto h-full flex flex-col">
        <div className="px-4 pb-4 pt-4 border-b border-gray-100">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mr-3" onClick={onClose}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-bold text-green-600 flex items-center gap-2 flex-1 justify-center">
              <span>🌿</span>
              Tùy chỉnh đồ uống
            </h2>
            <div className="w-8"></div>
          </div>
        </div>

        {milkTea && (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                <Card className="border-green-100">
                  <CardContent className="p-3 text-center">
                    <h3 className="font-semibold text-gray-800">{milkTea.name}</h3>
                    <p className="text-sm text-gray-600">Số lượng: {quantity}</p>
                  </CardContent>
                </Card>

                {/* Toppings */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Chọn topping</Label>
                  <div className="grid gap-2 mt-2">
                    {toppings.map((topping) => (
                      <div key={topping.id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50">
                        <Checkbox
                          id={`topping-${topping.id}`}
                          checked={sheetToppings.some((t) => t.id === topping.id)}
                          onCheckedChange={() => onToggleTopping(topping)}
                        />
                        <Label htmlFor={`topping-${topping.id}`} className="flex-1 text-sm cursor-pointer flex justify-between">
                          <span>{topping.name}</span>
                          <span className="text-green-600 font-medium">+{formatPrice(topping.price)}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Sweetness */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Độ ngọt</Label>
                  {isLoadingLevels ? (
                    <div className="mt-2 p-2 text-sm text-gray-500">Đang tải...</div>
                  ) : (
                    <RadioGroup value={sheetSweetness} onValueChange={(v) => onSweetChange(v as SweetValue)} className="mt-2">
                      {sweetnessLevels.map((level) => (
                        <div key={level.value} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value={level.value} id={`sweet-${level.value}`} />
                          <Label htmlFor={`sweet-${level.value}`} className="text-sm cursor-pointer">
                            {level.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </div>

                <Separator />

                {/* Ice */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Lượng đá</Label>
                  {isLoadingLevels ? (
                    <div className="mt-2 p-2 text-sm text-gray-500">Đang tải...</div>
                  ) : (
                    <RadioGroup value={sheetIce} onValueChange={(v) => onIceChange(v as IceValue)} className="mt-2">
                      {iceLevels.map((level) => (
                        <div key={level.value} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value={String(level.value)} id={`ice-${level.value}`} />
                          <Label htmlFor={`ice-${level.value}`} className="text-sm cursor-pointer">
                            {level.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </div>

                <Separator />

                {/* Size */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Kích thước</Label>
                  {isLoadingLevels ? (
                    <div className="mt-2 p-2 text-sm text-gray-500">Đang tải...</div>
                  ) : (
                    <RadioGroup value={sheetSize} onValueChange={(v) => onSizeChange(v as SizeValue)} className="mt-2">
                      {sizes.map((size) => {
                        const sizePriceData = productSizePrices.find(
                          p => p.product_id === milkTea.id && p.size_id === Number(size.value)
                        )
                        return (
                          sizePriceData && (
                          <div key={size.value} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50">
                            <RadioGroupItem value={size.value} id={`size-${size.value}`} />
                            <Label htmlFor={`size-${size.value}`} className="flex-1 text-sm cursor-pointer flex justify-between">
                              <span>{size.label}</span>
                              
                                <span className="text-green-600 font-medium">+{formatPrice(sizePriceData.price)}</span>
                            </Label>
                          </div>)
                        )
                      })}
                    </RadioGroup>
                  )}
                </div>

                <Separator />

                {/* Note */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Ghi chú cho ly trà sữa</Label>
                  <textarea
                    value={sheetNote}
                    onChange={(e) => onNoteChange(e.target.value)}
                    placeholder="Ví dụ: Ít đường hơn, nhiều đá, không topping, thêm lá bạc hà..."
                    className="w-full mt-2 p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    maxLength={200}
                  />
                  <div className="text-xs text-gray-400 mt-1 text-right">{sheetNote.length}/200 ký tự</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 bg-white">
              <div className="p-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Giá gốc:</span>
                    <span>{milkTea ? formatPrice(milkTea.base_price * quantity) : ""}</span>
                  </div>
                  {sizePrice > 0 && (
                    <div className="flex justify-between text-sm mb-1">
                      <span>Kích thước:</span>
                      <span>+{formatPrice(sizePrice * quantity)}</span>
                    </div>
                  )}
                  {sheetToppings.length > 0 && (
                    <div className="flex justify-between text-sm mb-1">
                      <span>Topping:</span>
                      <span>+{formatPrice(toppingsSum * quantity)}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold text-green-600">
                    <span>Tổng cộng:</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <Button
                  onClick={() => milkTea && onConfirm(milkTea.id)}
                  className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12 text-base font-semibold"
                >
                  Thêm vào giỏ hàng
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export const CustomizationSheet = memo(CustomizationSheetBase)
