"use client"

import { useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { HeaderBar } from "@/components/shop/HeaderBar"
import { BottomNav } from "@/components/shop/BottomNav"
import { ShopContent } from "@/components/shop/ShopContent"
import { ShopSheets } from "@/components/shop/ShopSheets"
import { LocationGate } from "@/components/shop/LocationGate"
import { AdminGate } from "@/components/shop/AdminGate"
import { QueueBadge } from "@/components/shop/QueueBadge"
import { useShopState } from "@/hooks/useShopState"
import { useShopActions } from "@/hooks/useShopActions"
import { useOrderSocket } from "@/hooks/useAdminSocket"
import { updateQuantity } from "@/utils/shopUtils"
import { MilkTea } from "@/types/shop"

function ShopInner() {
  const state = useShopState()
  const actions = useShopActions(state)
  const searchParams = useSearchParams()
  const isCustomer = searchParams.get("qr") === "1"

  useEffect(() => {
    actions.fetchInitialData()
  }, [])

  // Auto-dismiss toast after 3s
  useEffect(() => {
    if (!state.toast) return
    const timer = setTimeout(() => state.setToast(null), 3000)
    return () => clearTimeout(timer)
  }, [state.toast])

  // Cả Admin và Customer đều cần lắng nghe socket để cập nhật order
  useOrderSocket(isCustomer, state.setOrders)

  const pendingOrdersCount = useMemo(() => state.orders.filter((o) => !o.is_completed).length, [state.orders])
  
  return (
    <AdminGate isCustomer={isCustomer}>
      <LocationGate isCustomer={isCustomer}>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        {isCustomer && <QueueBadge />}
        <HeaderBar
          activeTab={state.activeTab}
          cartCount={state.cart.length}
          onOpenCart={() => state.setActiveSheet('cart')}
        />

        <ShopContent
          activeTab={state.activeTab}
          milkTeas={state.milkTeas}
          isLoadingMilkTeas={state.isLoadingMilkTeas}
          toppings={state.toppings}
          orders={state.orders}
          quantities={state.quantities}
          isCustomer={isCustomer}
          onAddToCart={actions.handleAddToCart}
          onSelectTopping={actions.handleSelectTopping}
          onToggleOrderStatus={actions.toggleOrderStatus}
          onDeleteOrder={actions.deleteOrder}
          onBackToOrder={() => state.setActiveTab("order")}
          onQuantityChange={(id: number, newQuantity: number) => {
            state.setQuantities(updateQuantity(state.quantities, id, newQuantity))
          }}
        />

        <BottomNav
          activeTab={state.activeTab}
          pendingOrders={pendingOrdersCount}
          onChangeTab={state.setActiveTab}
          isCustomer={isCustomer}
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

      {state.toast && (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm whitespace-nowrap transition-all ${
          state.toast.variant === 'error' ? 'bg-red-500' : 'bg-green-500'
        }`}>
          {state.toast.message}
        </div>
      )}
        </div>
      </LocationGate>
    </AdminGate>
  )
}

export default function FoxMilkTeaShop() {
  return (
    <Suspense>
      <ShopInner />
    </Suspense>
  )
}
