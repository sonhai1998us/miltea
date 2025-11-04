import MilkTeaList from "@/components/MilkTeaList"
import ToppingList from "@/components/ToppingList"
import { OrderManagement } from "./OrderManagement"
import { formatPrice, formatDateTime, getQuantity, sortOrders } from "@/utils/shopUtils"
import { MilkTea, Order, Topping } from "@/types/shop"

interface ShopContentProps {
  activeTab: "order" | "manage"
  milkTeas: MilkTea[]
  isLoadingMilkTeas: boolean
  toppings: Topping[]
  orders: Order[]
  quantities: Record<number, number>
  onAddToCart: (milkTea: MilkTea) => void
  onSelectTopping: (topping: Topping) => void
  onToggleOrderStatus: (order: Order) => void
  onBackToOrder: () => void
  onQuantityChange: (id: number, newQuantity: number) => void
}

export const ShopContent = ({
  activeTab,
  milkTeas,
  isLoadingMilkTeas,
  toppings,
  orders,
  quantities,
  onAddToCart,
  onSelectTopping,
  onToggleOrderStatus,
  onBackToOrder,
  onQuantityChange,
}: ShopContentProps) => {
  // Memoized values
  const sortedOrders = sortOrders(orders)

  // Utility functions
  const getQuantityForId = (id: number) => getQuantity(quantities, id)
  const updateQuantityForId = (id: number, newQuantity: number) => {
    onQuantityChange(id, newQuantity)
  }

  return (
    <>
      {activeTab === "order" ? (
        <>
          <MilkTeaList
            milkTeas={milkTeas}
            isLoading={isLoadingMilkTeas}
            getQuantity={getQuantityForId}
            updateQuantity={updateQuantityForId}
            handleAddToCart={onAddToCart}
            formatPrice={formatPrice}
          />
          <ToppingList
            toppings={toppings}
            formatPrice={formatPrice}
            getQuantity={getQuantityForId}
            updateQuantity={updateQuantityForId}
            handleSelectTopping={onSelectTopping}
          />
        </>
      ) : (
        <OrderManagement
          orders={sortedOrders}
          formatPrice={formatPrice}
          formatDateTime={formatDateTime}
          onToggleStatus={onToggleOrderStatus}
          onBackToOrder={onBackToOrder}
        />
      )}
    </>
  )
}

