import { CustomizationSheet } from "./CustomizationSheet"
import { CartSheet } from "./CartSheet"
import { CheckoutSheet } from "./CheckoutSheet"
import { formatPrice, formatInputNumber } from "@/utils/shopUtils"
import { getQuantity } from "@/utils/shopUtils"
import { CartItem, MilkTea, Topping } from "@/types/shop"

interface ShopSheetsProps {
  // State
  activeSheet: 'none' | 'customization' | 'cart' | 'checkout'
  selectedMilkTea: MilkTea
  toppings: Topping[]
  quantities: Record<number, number>
  sheetSweetness: string
  sheetIce: string
  sheetSize: string
  sheetNote: string
  sheetToppings: Topping[]
  cart: CartItem[]
  checkoutStep: 1 | 2
  paymentMethod: "" | "cash" | "transfer"
  cashAmount: number
  cashError: string
  discountAmount: number
  discountLocked: boolean
  totalCartPrice: number

  // Actions
  onCloseSheet: () => void
  onSweetChange: (value: string) => void
  onIceChange: (value: string) => void
  onSizeChange: (value: string) => void
  onNoteChange: (value: string) => void
  onToggleTopping: (topping: Topping) => void
  onConfirmAddToCart: (id: number) => void
  onRemoveFromCart: (itemId: number) => void
  onStartCheckout: () => void
  onPaymentMethodNext: () => void
  onCompleteOrder: () => void
  onPaymentChange: (method: "" | "cash" | "transfer") => void
  onCashChange: (amount: number) => void
  onChangeDiscount: (amount: number) => void
  onApplyDiscount: () => void
  onClearDiscount: () => void
  onBackToCart: () => void
}

export const ShopSheets = ({
  // State
  activeSheet,
  selectedMilkTea,
  toppings,
  quantities,
  sheetSweetness,
  sheetIce,
  sheetSize,
  sheetNote,
  sheetToppings,
  cart,
  checkoutStep,
  paymentMethod,
  cashAmount,
  cashError,
  discountAmount,
  discountLocked,
  totalCartPrice,

  // Actions
  onCloseSheet,
  onSweetChange,
  onIceChange,
  onSizeChange,
  onNoteChange,
  onToggleTopping,
  onConfirmAddToCart,
  onRemoveFromCart,
  onStartCheckout,
  onPaymentMethodNext,
  onCompleteOrder,
  onPaymentChange,
  onCashChange,
  onChangeDiscount,
  onApplyDiscount,
  onClearDiscount,
  onBackToCart,
}: ShopSheetsProps) => {
  return (
    <>
      {/* Overlay */}
      {activeSheet !== 'none' && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300" 
          onClick={onCloseSheet} 
        />
      )}

      {/* Customization Sheet */}
      <CustomizationSheet
        open={activeSheet === 'customization'}
        milkTea={selectedMilkTea}
        toppings={toppings}
        quantity={selectedMilkTea ? getQuantity(quantities, selectedMilkTea.id) : 0}
        sheetSweetness={sheetSweetness}
        sheetIce={sheetIce}
        sheetSize={sheetSize}
        sheetNote={sheetNote}
        sheetToppings={sheetToppings}
        formatPrice={formatPrice}
        onClose={onCloseSheet}
        onSweetChange={onSweetChange}
        onIceChange={onIceChange}
        onSizeChange={onSizeChange}
        onNoteChange={onNoteChange}
        onToggleTopping={onToggleTopping}
        onConfirm={onConfirmAddToCart}
      />

      {/* Cart Sheet */}
      <CartSheet
        open={activeSheet === 'cart'}
        cart={cart}
        formatPrice={formatPrice}
        total={totalCartPrice}
        onClose={onCloseSheet}
        onRemove={onRemoveFromCart}
        onCheckout={onStartCheckout}
        discountAmount={discountAmount}
        discountLocked={discountLocked}
        onChangeDiscount={onChangeDiscount}
        onApplyDiscount={onApplyDiscount}
        onClearDiscount={onClearDiscount}
      />

      {/* Checkout Sheet */}
      <CheckoutSheet
        open={activeSheet === 'checkout'}
        step={checkoutStep}
        paymentMethod={paymentMethod}
        cart={cart}
        total={totalCartPrice}
        cashAmount={cashAmount}
        cashError={cashError}
        formatPrice={formatPrice}
        onClose={onBackToCart}
        onNext={onPaymentMethodNext}
        onConfirm={onCompleteOrder}
        onPaymentChange={onPaymentChange}
        onCashChange={onCashChange}
        formatInputNumber={formatInputNumber}
      />
    </>
  )
}

