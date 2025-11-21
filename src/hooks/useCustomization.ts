import { useState, useEffect, useMemo } from "react"
import {
    MilkTea,
    Topping,
    SweetnessLevelOption,
    IceLevelOption,
    SizeOption,
    fetchSweetnessLevels,
    fetchIceLevels,
    fetchSizes,
    SizeValue
} from "@/types/shop"
import { ProductSizePrices, fetchProductSizePrices } from "@/types/option"

interface UseCustomizationProps {
    open: boolean
    milkTea: MilkTea | null
    sheetSize: SizeValue
    sheetToppings: Topping[]
    quantity: number
    onSizeChange: (v: SizeValue) => void
}

export const useCustomization = ({
    open,
    milkTea,
    sheetSize,
    sheetToppings,
    quantity,
    onSizeChange
}: UseCustomizationProps) => {
    const [sweetnessLevels, setSweetnessLevels] = useState<SweetnessLevelOption[]>([])
    const [iceLevels, setIceLevels] = useState<IceLevelOption[]>([])
    const [sizes, setSizes] = useState<SizeOption[]>([])
    const [productSizePrices, setProductSizePrices] = useState<ProductSizePrices[]>([])
    const [isLoadingLevels, setIsLoadingLevels] = useState(true)
    const [selectedSize, setSelectedSize] = useState<string>('')

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
                if (sizesData.length > 0) {
                    if (productSizePricesData.find(val => val.product_id == milkTea?.id)) {
                        const sizeValue = productSizePricesData.find(val => val.product_id == milkTea?.id)?.size_id.toString() as SizeValue
                        setSelectedSize(sizeValue || '')
                        onSizeChange(sizeValue)
                    }
                }
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
    }, [open, milkTea?.id]) // Added milkTea?.id dependency to ensure correct size selection if milkTea changes

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

    return {
        sweetnessLevels,
        iceLevels,
        sizes,
        productSizePrices,
        isLoadingLevels,
        selectedSize,
        toppingsSum,
        sizePrice,
        total
    }
}
