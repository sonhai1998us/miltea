"use client"

import { useEffect, useMemo } from "react"
import { HeaderBar } from "@/components/shop/HeaderBar"
import { BottomNav } from "@/components/shop/BottomNav"
import { ShopContent } from "@/components/shop/ShopContent"
import { ShopSheets } from "@/components/shop/ShopSheets"
import { useShopState } from "@/hooks/useShopState"
import { useShopActions } from "@/hooks/useShopActions"
import { updateQuantity } from "@/utils/shopUtils"
import { MilkTea } from "@/types/shop"

export default function FoxMilkTeaShop() {
  // State management
  const state = useShopState()
  // Actions
  const actions = useShopActions(state)

  // Fetch initial data on mount
  useEffect(() => {
    actions.fetchInitialData()
  }, [actions.fetchInitialData])

  // Memoized values
  const pendingOrdersCount = useMemo(() => state.orders.filter((o) => !o.is_completed).length, [state.orders])
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <HeaderBar 
        activeTab={state.activeTab} 
        cartCount={state.cart.length} 
        onOpenCart={() => state.setActiveSheet('cart')} 
      />

      <ShopContent
        activeTab={state.activeTab}
        milkTeas={state.milkTeas}
        isLoadingMilkTeas={state.isLoadingMilkTeas}
        orders={state.orders}
        quantities={state.quantities}
        onAddToCart={actions.handleAddToCart}
        onToggleOrderStatus={actions.toggleOrderStatus}
        onBackToOrder={() => state.setActiveTab("order")}
        onQuantityChange={(id: number, newQuantity: number) => {
          state.setQuantities(updateQuantity(state.quantities, id, newQuantity))
        }}
      />

      <BottomNav
        activeTab={state.activeTab}
        pendingOrders={pendingOrdersCount}
        onChangeTab={state.setActiveTab}
      />

      <ShopSheets
        // State
        activeSheet={state.activeSheet}
        selectedMilkTea={state.selectedMilkTea as MilkTea}
        toppings={state.toppings}
        quantities={state.quantities}
        sheetSweetness={state.sheetSweetness}
        sheetIce={state.sheetIce}
        sheetSize={state.sheetSize}
        sheetNote={state.sheetNote}
        sheetToppings={state.sheetToppings}
        cart={state.cart}
        checkoutStep={state.checkoutStep}
        paymentMethod={state.paymentMethod}
        cashAmount={state.cashAmount}
        cashError={state.cashError}
        discountAmount={state.discountAmount}
        discountLocked={state.discountLocked}
        totalCartPrice={actions.getTotalCartPrice}

        // Actions
        onCloseSheet={() => state.setActiveSheet('none')}
        onSweetChange={state.setSheetSweetness}
        onIceChange={state.setSheetIce}
        onSizeChange={state.setSheetSize}
        onNoteChange={state.setSheetNote}
        onToggleTopping={actions.toggleTopping}
        onConfirmAddToCart={actions.confirmAddToCart}
        onRemoveFromCart={actions.removeFromCart}
        onStartCheckout={actions.handleStartCheckout}
        onPaymentMethodNext={actions.handlePaymentMethodNext}
        onCompleteOrder={actions.handleCompleteOrder}
        onPrintCart={actions.handlePrintCart}
        onPaymentChange={state.setPaymentMethod}
        onCashChange={state.setCashAmount}
        onChangeDiscount={(n: number) => state.setDiscountAmount(n)}
        onApplyDiscount={() => state.setDiscountLocked(true)}
        onClearDiscount={() => { 
          state.setDiscountAmount(0); 
          state.setDiscountLocked(false) 
        }}
        onBackToCart={() => { 
          state.setActiveSheet('cart'); 
          state.setCashAmount(0) 
        }}
      />
    </div>
  )
}
